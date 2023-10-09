import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    ItemListResponseV3, fromItemListResponseV2,
} from '../api-response-interfaces/item-list-response';
import { ProductImp } from '../global-classes/product-imp';
import { FacetGroup } from '../global-classes/facet-group';
import { Facet } from '../global-classes/facet';
import { map, take, tap } from 'rxjs/operators';
import { ProductSku } from '../global-classes/product-sku';
// import { Image } from '../global-classes/image';
import { FacetResponse } from '../api-response-interfaces/facet-response';
import {
    Router,
    ActivatedRoute,
    ActivatedRouteSnapshot,
} from '@angular/router';
import { Location } from '@angular/common';
import { SeoService } from './seo.service';
import { siteRoot } from '../app.constants';
import { categoriesKey } from '../app.constants';
import { UserService } from '../pro-plus/services/user.service';
import { ProPlusApiBase } from '../pro-plus/services/pro-plus-api-base.service';
import { ItemListResponseV2 } from '../pro-plus/model/item-list-response';
import * as _ from 'lodash';

export interface ProductSkus {
    product: ProductImp | null;
    skuList: ProductSku[] | null;
}

export interface ItemRequest {
    accountId?: string;
    pageSize?: number;
    pageNo?: number;
    filter?: string;
    cateFilter?: string;
    facetsFilter?: string;
    showHoverAttrs?: boolean;
    hoverSearch?: boolean;
    showSkuList?: boolean;
    showFacets?: boolean;
}

@Injectable( {
    providedIn: 'root',
} )
export class ProductBrowseService {
    private readonly _DEFAULT_PAGE_SIZE = 24;
    private readonly _LOAD_MORE_STARTING_PAGE_NUM = 2;
    // _DEFAULT_LOAD_MORE_PAGE_SIZE should be a multiple of _DEFAULT_PAGE_SIZE
    private _loadMorePageNum = this._LOAD_MORE_STARTING_PAGE_NUM;
    // The number of times to lazy load results.
    public readonly lazyLoadTotal = 999;
    private readonly _CATEGORIES_KEY = categoriesKey;
    // private readonly _MAX_PAGE_SIZE = 100;
    private _initialPageNum = 1;

    // Track the amount of times we have lazy loaded results.
    lazyLoadCount = 0;
    private _permanentCateFilter?: string;
    private _permanentExtraCateFilter?: Facet | null;
    private _searchTerm?: string | null;
    private _permanentOtherFilters: Facet[] = [];
    private _frequentlyPurchased = false;
    private _showForAll = false;

    // Loading vars to show accurate page state.
    private readonly _isLoadingSubj = new BehaviorSubject( false );
    public readonly isLoading$ = this._isLoadingSubj.asObservable();

    private readonly _isLoadingMoreSubj = new BehaviorSubject( false );
    public readonly isLoadingMore$ = this._isLoadingMoreSubj.asObservable();

    /**
     * Define private behavior subject and public observables referencing them so that all components
     * referencing this service can access the same data without an additional service call.
     */
    private _productList: BehaviorSubject<ProductSkus[] | null> =
        new BehaviorSubject<ProductSkus[] | null>( null );
    public readonly productList$ = this._productList.asObservable();

    private readonly _facetGroups: BehaviorSubject<FacetGroup[] | null> =
        new BehaviorSubject<FacetGroup[] | null>( null );
    public readonly facetGroups$ = this._facetGroups.asObservable();

    private _selectedFacetsArray: Facet[] = [];
    private readonly _selectedFacets: BehaviorSubject<Facet[] | null> =
        new BehaviorSubject<Facet[] | null>( this._selectedFacetsArray );
    public readonly selectedFacets$ = this._selectedFacets.asObservable();

    private readonly _resultsCount: BehaviorSubject<number | null> =
        new BehaviorSubject<number | null>( null );
    public readonly resultsCount$ = this._resultsCount.asObservable();

    constructor(
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly location: Location,
        private readonly seoService: SeoService,
        private readonly userService: UserService,
        private readonly api: ProPlusApiBase
    ) { }

    /**
     * Set the private _permanentCateFilter var.
     */
    public set permanentCateFilter( permanentCateFilter: string ) {
        this._permanentCateFilter = permanentCateFilter;
    }

    public set searchTerm( searchTerm: string | null ) {
        //  Changing the search term should turn off the frequently purchased filter
        this._frequentlyPurchased = false;
        this._searchTerm = searchTerm;
    }

    public setPermanentExtraCateFilter( filterId: number | null ) {
        this._permanentExtraCateFilter = filterId
            ? this._setFacetsFromString( `${filterId}`, true, 'cateFilter' )[0]
            : null;
    }

    public set frequentlyPurchased( frequentlyPurchased: boolean ) {
        this._frequentlyPurchased = frequentlyPurchased;
        if ( frequentlyPurchased ) {
            this._showForAll = false;
        }
        this.setProductList();
    }

    public get frequentlyPurchased() {
        return this._frequentlyPurchased;
    }

    public set showForAll( showForAll: boolean ) {
        this._showForAll = showForAll;
        //  Turning no show for all should turn off frequently purchased
        if ( showForAll ) {
            this._frequentlyPurchased = false;
        }
        this.setProductList();
    }

    public get showForAll() {
        return this._showForAll;
    }

    /**
     * Takes in a string of filters in the given format and converts to array of filter objects that are then saved
     * to the _permanentOtherFilters array.  Filters added in this way hide their parent category and cannot be removed
     * by the user.
     * @param filtersString String to be converted to filters.  Should be in format
     * "facetCategory: facetName, facetCategory: facetName,...etc" or "facetId,facetId,facetId,..etc"
     */
    public setPermanentOtherFilters( filtersString: string ) {
        this._permanentOtherFilters = filtersString
            ? this._setFacetsFromString( filtersString, true )
            : [];
    }

    /**
     * Takes in a string of filters in the given format and converts to array of filter objects that are then saved
     * to the _selectedFacetsArray array.  Filters added in this way can be removed by the user.
     * @param filtersString String to be converted to filters.  Should be in format
     * "facetCategory: facetName, facetCategory: facetName,...etc"
     * @param cateFilterString String to be converted to filters.  Should be in format
     * "facetCategory: facetName, facetCategory: facetName,...etc"
     * @param pageNo: Optional param that specifies the starting page
     * @param routeSnapshot optional param that is the snapshot of the desired route data.  Passed in if called by a route resolver.
     */
    public initializeFromUrlParams(
        filtersString?: string | null,
        cateFilterString?: string | null,
        pageNo?: string | null,
        routeSnapshot: ActivatedRouteSnapshot = this.activatedRoute.snapshot
    ) {
        const queryParams = routeSnapshot.queryParamMap;
        this._frequentlyPurchased =
            queryParams && queryParams.get( 'frequentlyPurchased' ) === 'true';

        filtersString = filtersString || queryParams.get( 'filters' ) || '';

        cateFilterString =
            cateFilterString || queryParams.get( 'cateFilter' ) || '';

        pageNo = pageNo || queryParams.get( 'pageNo' ) || '';

        this._selectedFacetsArray = filtersString
            ? this._setFacetsFromString( filtersString )
            : [];

        if ( cateFilterString ) {
            this._selectedFacetsArray.push(
                ...this._setFacetsFromString(
                    cateFilterString,
                    false,
                    'cateFilter'
                )
            );
        }

        if ( pageNo ) {
            this._initialPageNum = parseInt( pageNo, 10 );
        }
    }

    /**
     * Initiates a call to the itemlist service with the given parameters set.  On completion of the call, updates values of
     * all behavior subjects that pull data from this call.
     * @param urlTree Optional urlTree param.  Passed in if called by a route resolver.
     * @param filters Optional filters to be applied to the api request.
     */
    public async setProductList(
        urlTree = this.router.createUrlTree( [] ),
        filters: Facet[] = this._selectedFacetsArray
    ): Promise<any> {
        this._isLoadingSubj.next( true );

        const user = await this.userService.getSessionInfo();
        const accountId = user?.lastSelectedAccount.accountLegacyId;

        // Build url string with supplied params.
        const pList: any = this.searchItemList( { facetsFilter: filters }, accountId );

        pList
            .pipe(
                tap( t => { console.log( { t } ) } )
            )
            .subscribe(
                ( newProductList: any ) => {
                    if ( newProductList.items && newProductList.items.length ) {
                        //
                        this._productList.next( newProductList.items );

                    } else {
                        this._productList.next( [] );
                    }

                    // FACETS 
                    if ( newProductList.facets ) {
                        // Build out the facets objects to be used in components from beacon service data.
                        const newFacetsArray = Object.keys(
                            newProductList.facets
                        ).map( ( curKey ) => {
                            if ( curKey !== this._CATEGORIES_KEY ) {
                                if (
                                    !this._permanentOtherFilters.some(
                                        ( facet ) => facet.group === curKey
                                    ) &&
                                    !newProductList.facets[curKey].some( ( facet: any ) => {
                                        return this._permanentOtherFilters.some(
                                            ( permFacet ) =>
                                                permFacet.key === facet.facetId
                                        );
                                    } )
                                ) {
                                    return new FacetGroup(
                                        curKey,
                                        newProductList.facets[curKey].map(
                                            ( curFacet: FacetResponse ) => {
                                                if ( curFacet.selected ) {
                                                    const selectedFacet =
                                                        this._replaceFacetWithServerValue(
                                                            curFacet,
                                                            curKey
                                                        );

                                                    return new Facet(
                                                        curFacet.facetName,
                                                        curFacet.facetId,
                                                        curKey,
                                                        curFacet.recordCount,
                                                        true,
                                                        'filter',
                                                        selectedFacet
                                                            ? selectedFacet.permanent
                                                            : false
                                                    );
                                                } else {
                                                    return new Facet(
                                                        curFacet.facetName,
                                                        curFacet.facetId,
                                                        curKey,
                                                        curFacet.recordCount,
                                                        false
                                                    );
                                                }
                                            }
                                        )
                                    );
                                }
                                return null;
                            } else {
                                // Attempt to build out the category facet section given the tree from the api.
                                const newCategoryFacets =
                                    newProductList.facets[curKey];
                                let newCategoryFacetArray: Facet[];
                                let curSelectedFacet = newCategoryFacets[0];
                                let rootFacetFound = false;
                                let parentSelectedFacet: Facet | null = null;

                                // Traverse the children facet arrays until we find the facet that was already selected
                                while (
                                    !curSelectedFacet.selected &&
                                    curSelectedFacet.children &&
                                    curSelectedFacet.children.length
                                ) {
                                    const parentSelectedFacetResponse =
                                        curSelectedFacet;
                                    if (
                                        !this._permanentExtraCateFilter ||
                                        rootFacetFound
                                    ) {
                                        parentSelectedFacet = new Facet(
                                            parentSelectedFacetResponse.facetName,
                                            parentSelectedFacetResponse.facetId,
                                            this._CATEGORIES_KEY,
                                            parentSelectedFacetResponse.recordCount,
                                            parentSelectedFacetResponse.selected,
                                            'cateFilter',
                                            false,
                                            parentSelectedFacet
                                                ? [
                                                    ...parentSelectedFacet.parentFacetArray,
                                                    parentSelectedFacet,
                                                ]
                                                : [],
                                            true
                                        );
                                    }

                                    if (
                                        !this._permanentExtraCateFilter ||
                                        curSelectedFacet.facetId ===
                                        this._permanentExtraCateFilter.key ||
                                        curSelectedFacet.facetName ===
                                        this._permanentCateFilter ||
                                        !this._permanentCateFilter ||
                                        curSelectedFacet.selected
                                    ) {
                                        rootFacetFound = true;
                                    }

                                    curSelectedFacet = curSelectedFacet.children[0];
                                }

                                /**
                                 * If there is a facet selected we likely need to flatten the facet tree and remove facets that shouldn't
                                 * be displayed including the currently selected facet.
                                 */
                                if ( curSelectedFacet.selected ) {
                                    newCategoryFacetArray =
                                        this.expandChildrenFacets(
                                            curSelectedFacet,
                                            curKey,
                                            parentSelectedFacet as Facet
                                        );
                                    const selectedFacet =
                                        newCategoryFacetArray.find(
                                            ( facet ) => facet.selected
                                        );
                                    const selectedFacetParents = selectedFacet
                                        ? selectedFacet.parentFacetArray
                                        : [];
                                    newCategoryFacetArray = [
                                        ...selectedFacetParents,
                                        ...newCategoryFacetArray,
                                    ];
                                } else {
                                    return new FacetGroup(
                                        curKey,
                                        newProductList.facets[curKey].map(
                                            ( curFacet: any ) => {
                                                if ( curFacet.selected ) {
                                                    const selectedFacet =
                                                        this._replaceFacetWithServerValue(
                                                            curFacet,
                                                            curKey
                                                        );
                                                    return new Facet(
                                                        curFacet.facetName,
                                                        curFacet.facetId,
                                                        curKey,
                                                        curFacet.recordCount,
                                                        true,
                                                        'cateFilter',
                                                        selectedFacet
                                                            ? selectedFacet.permanent
                                                            : false
                                                    );
                                                } else {
                                                    return new Facet(
                                                        curFacet.facetName,
                                                        curFacet.facetId,
                                                        curKey,
                                                        curFacet.recordCount,
                                                        false,
                                                        'cateFilter'
                                                    );
                                                }
                                            }
                                        )
                                    );
                                }

                                // If there are no other category filters other than the permanent filter, do not render this group.
                                return new FacetGroup(
                                    curKey,
                                    newCategoryFacetArray
                                );
                            }
                        } );

                        const categoryFacetGroup =
                            this.getCategoryFacetGroup( newFacetsArray );

                        // Move the categories facets to the 0 index in the array.
                        if (
                            categoryFacetGroup &&
                            newFacetsArray.indexOf( categoryFacetGroup ) > 0
                        ) {
                            newFacetsArray.splice(
                                newFacetsArray.indexOf( categoryFacetGroup ),
                                1
                            );
                            newFacetsArray.unshift( categoryFacetGroup );
                        }

                        this._facetGroups.next( filterOutNull( newFacetsArray ) );
                    }

                    this._resultsCount.next( newProductList.totalNumRecs );

                    this._selectedFacets.next( this._selectedFacetsArray );

                    this._loadMorePageNum = this._LOAD_MORE_STARTING_PAGE_NUM;

                    this.lazyLoadCount = 0;

                    // Build out query params. Can't use activateRoute query params because it is empty initially on server
                    const queryParams: {
                        [key: string]: string | null;
                    } = {};
                    const cateFilter = this._selectedFacetsArray.filter(
                        ( curFilter ) => curFilter.type === 'cateFilter'
                    );
                    if ( cateFilter && cateFilter.length ) {
                        queryParams.cateFilter = cateFilter[0].key;
                    }
                    const nonCateFilters = this._selectedFacetsArray.filter(
                        ( curFilter ) => curFilter.type === 'filter'
                    );
                    if ( nonCateFilters && nonCateFilters.length ) {
                        queryParams.filters = nonCateFilters
                            .map( ( filter ) => filter.key )
                            .join( ',' );
                    }

                    const urlWithoutQuery = urlTree.root.children[
                        'primary'
                    ].segments
                        .map( ( it ) => it.path )
                        .join( '/' );
                    const fullUrl = `${siteRoot}${urlWithoutQuery.indexOf( '/' ) === 0
                        ? urlWithoutQuery
                        : `/${urlWithoutQuery}`
                        }`;

                    if ( this._initialPageNum > 1 ) {
                        this.seoService.createPrevLink(
                            this._initialPageNum - 1,
                            fullUrl,
                            queryParams
                        );
                    } else {
                        this.seoService.destroyPrevLink();
                    }

                    if (
                        this._initialPageNum * this._DEFAULT_PAGE_SIZE <
                        newProductList.totalNumRecs
                    ) {
                        this.seoService.createNextLink(
                            this._initialPageNum + 1,
                            fullUrl,
                            queryParams
                        );
                    } else {
                        this.seoService.destroyNextLink();
                    }

                    this._isLoadingSubj.next( false );
                }
            );
    }

    private getCategoryFacetGroup( newFacetsArray: ( FacetGroup | null )[] ) {
        return newFacetsArray.find( ( curGroup ) => {
            if ( !curGroup ) {
                return false;
            }
            return curGroup.title === this._CATEGORIES_KEY;
        } );
    }

    public searchItemList( r: {
        facetsFilter: Facet[];
        filter?: string | undefined;
        pageNo?: number;
        pageSize?: number;
        frequentlyPurchased?: boolean;
        showForAll?: boolean;
    }, accountId?: string ): Observable<ItemListResponseV3> {
        //
        // const user = ( async () => await this.userService.getSessionInfo() )       
        console.log( { accountId } );

        // enforce V2 when logged in
        const facetFilters = this.getFacetFilters( r.facetsFilter );

        if ( this.frequentlyPurchased ) {
            facetFilters.push( 'frequentlyPurchase:true' );
        }

        const req: ItemRequest = {
            ...r,
            accountId,
            facetsFilter: facetFilters ? facetFilters.join( ',' ) : undefined,
            cateFilter: this._permanentCateFilter || undefined,
            filter: r.filter || this._searchTerm || '',
            pageNo: r.pageNo || this._initialPageNum,
            pageSize: r.pageSize || this._DEFAULT_PAGE_SIZE,
            showSkuList: true,
        };

        //
        const queryParameters = cleanUndefined( req );

        // LOGGEDOUT 
        if ( _.isEmpty( accountId ) ) {
            console.log( 'calling v3..logged out usr..' );

            return this.api.getApiObservable<ItemListResponseV3>(
                'v3',
                'itemlist',
                queryParameters
            ).pipe(
                map( ( res: any ) => {
                    return fromItemListResponseV2( res );
                } )
            );
        }
        // LOGGEDIN truthy
        // console.log( { accountId } )
        return this.api
            .getApiObservable<ItemListResponseV2>(
                'v2',
                'itemlist',
                queryParameters
            )
            .pipe(
                map( ( res: any ) => {
                    return fromItemListResponseV2( res );
                } )
            );
    }

    public getItemListBySearchTerm( searchTerm: string ) {
        // TODO 
        this._frequentlyPurchased = false;
        return this.searchItemList( {
            facetsFilter: [],
            filter: searchTerm,
        } );
    }

    /**
 * Loads more results from itemlist service and appends to existing list.  Updates productList subject with
 * new results array.
 * @param pageSize Optional param to give a custom page size.
 */
    public async loadMoreResults( filters: Facet[] = this._selectedFacetsArray ): Promise<any> {
        this._isLoadingMoreSubj.next( true );
        //
        // const user = await this.userService.getSessionInfo();
        // const accountId = user?.lastSelectedAccount.accountLegacyId;

        // 

        const pList: any = this.searchItemList( { facetsFilter: filters, pageNo: this._loadMorePageNum, } );
        pList
            .pipe(
                tap( tee => {
                    if ( this._loadMorePageNum >= 2 ) {
                        this._loadMorePageNum = this._loadMorePageNum + 1;
                    }
                } ),
                take( 1 )
            )
            .subscribe(
                ( newProductList: any ) => {
                    if ( newProductList.items && newProductList.items.length ) {

                        // Append the newProductList to the existing product list.
                        if ( this._productList.value ) {
                            this._productList.next( this._productList.value.concat( newProductList.items ) );
                        }
                        this._isLoadingMoreSubj.next( false );

                    } else {
                        this._productList.next( [] );
                        this._isLoadingMoreSubj.next( false );
                    }

                    // FACETS 
                    if ( newProductList.facets ) {
                        // Build out the facets objects to be used in components from beacon service data.
                        // REVIEW newFacetsArray 
                        Object.keys( newProductList.facets )
                            .map( ( curKey ) => {

                                if ( curKey !== this._CATEGORIES_KEY ) {
                                    if (
                                        !this._permanentOtherFilters.some(
                                            ( facet ) => facet.group === curKey
                                        ) &&
                                        !newProductList.facets[curKey].some( ( facet: any ) => {
                                            return this._permanentOtherFilters.some(
                                                ( permFacet ) =>
                                                    permFacet.key === facet.facetId
                                            );
                                        } )
                                    ) {
                                        return new FacetGroup(
                                            curKey,
                                            newProductList.facets[curKey].map(
                                                ( curFacet: FacetResponse ) => {
                                                    if ( curFacet.selected ) {
                                                        const selectedFacet =
                                                            this._replaceFacetWithServerValue(
                                                                curFacet,
                                                                curKey
                                                            );

                                                        return new Facet(
                                                            curFacet.facetName,
                                                            curFacet.facetId,
                                                            curKey,
                                                            curFacet.recordCount,
                                                            true,
                                                            'filter',
                                                            selectedFacet
                                                                ? selectedFacet.permanent
                                                                : false
                                                        );
                                                    } else {
                                                        return new Facet(
                                                            curFacet.facetName,
                                                            curFacet.facetId,
                                                            curKey,
                                                            curFacet.recordCount,
                                                            false
                                                        );
                                                    }
                                                }
                                            )
                                        );
                                    }
                                    //
                                } //
                                return null;
                            } )
                        return null;
                    }
                    return;
                } )
    }

    /**
     * Given a facetResponse, recursively expand all it's children arrays to be one flat facet array to make it
     * easier for the components to digest.
     * @param facetResponse Response to expand.
     * @param key The group name to give all the facet objects.
     */
    private expandChildrenFacets(
        facetResponse: FacetResponse,
        key: string,
        parentFacet: Facet
    ): Facet[] {
        const selectedFacet = this._replaceFacetWithServerValue(
            facetResponse,
            key
        );

        if ( parentFacet ) {
            parentFacet.isParentFacet = true;
        }

        const curFacet = new Facet(
            facetResponse.facetName,
            facetResponse.facetId,
            key,
            facetResponse.recordCount,
            facetResponse.selected,
            'cateFilter',
            selectedFacet ? selectedFacet.permanent : false,
            parentFacet
                ? [
                    ...parentFacet.parentFacetArray.filter(
                        ( facet ) =>
                            !this._permanentExtraCateFilter ||
                            facet.key !== this._permanentExtraCateFilter.key
                    ),
                    parentFacet,
                ]
                : []
        );
        const expandedFacetArray: Facet[] = [curFacet];
        if ( facetResponse.children && facetResponse.children.length ) {
            facetResponse.children.forEach( ( childFacet ) => {
                expandedFacetArray.push(
                    ...this.expandChildrenFacets( childFacet, key, curFacet )
                );
            } );
        }

        return expandedFacetArray;
    }

    /**
     * Adds a new facet to the selectedFacets array.
     * @param newFacet The new facet to add to the selected facets array.
     */
    public addSelectedFacet( newFacet: Facet ) {
        this._selectedFacetsArray.push( newFacet );
        this.saveSelectedFacetsToQueryParams();
    }

    /**
     * Takes in a facet and removes it from the selected facets array.
     * @param newFacet Facet to be removed
     */
    public removeSelectedFacet( newFacet: Facet ) {
        if ( newFacet.type !== 'cateFilter' ) {
            this._selectedFacetsArray = this._selectedFacetsArray.filter(
                ( curFacet ) => {
                    return (
                        !newFacet ||
                        curFacet.key !== newFacet.key ||
                        curFacet.value !== newFacet.value
                    );
                }
            );
        } else {
            this._selectedFacetsArray = this._selectedFacetsArray.filter(
                ( curFacet ) => {
                    return curFacet.type !== 'cateFilter';
                }
            );
        }

        this.saveSelectedFacetsToQueryParams();
    }

    /**
     * Clears all non cate facets from the selected facets array then makes a call for new data.
     */
    public clearSelectedFacets() {
        this._selectedFacetsArray =
            this._selectedFacetsArray && this._selectedFacetsArray.length
                ? this._selectedFacetsArray.filter(
                    ( facet ) => facet.type === 'cateFilter'
                )
                : [];

        this.saveSelectedFacetsToQueryParams();
        this.setProductList();
    }

    /**
     * Takes in a filters string and returns an array of facets that are set by that string.
     * @param filtersString String of comma separated filters.  Either filterId, or filterGroup: filterValue,
     * @param permanent boolean that determines whether this facet is visible/removable by the user
     */
    private _setFacetsFromString(
        filtersString: string,
        permanent: boolean = false,
        type: 'filter' | 'cateFilter' = 'filter'
    ): Facet[] {
        const filterGroups = filtersString.split( ',' );
        return filterOutNull(
            filterGroups.map( ( curGroup ) => {
                const curFilterParts = curGroup.split( ':' );
                if ( curFilterParts && curFilterParts.length > 1 ) {
                    const curFacetGroup = decodeURIComponent(
                        curFilterParts[0]
                    ).trim();
                    const curFacetName = decodeURIComponent(
                        curFilterParts[1]
                    ).trim();

                    return new Facet(
                        curFacetName,
                        null,
                        curFacetGroup,
                        null,
                        true,
                        type,
                        permanent
                    );
                } else if ( curFilterParts && curFilterParts.length === 1 ) {
                    const curFacetID = decodeURIComponent(
                        curFilterParts[0]
                    ).trim();

                    return new Facet(
                        null,
                        curFacetID,
                        null,
                        null,
                        true,
                        type,
                        permanent
                    );
                }
                return null;
            } )
        );
    }

    /**
     * Given an array of filters, attempt to convert the array into a string that can be sent to the
     * server.
     * @param filters array of filters to convert to string.
     */
    private getFacetFilters( filters: Facet[] ) {
        const filterStrings = filterOutNull(
            filters.map( ( curFilter ) => {
                if ( curFilter.key ) {
                    return curFilter.key;
                } else if ( curFilter.group && curFilter.value ) {
                    return `${encodeURIComponent(
                        curFilter.group
                    )}:${encodeURIComponent( curFilter.value )}`;
                }
                return null;
            } )
        );
        const permFilterStrings = filterOutNull(
            this._permanentOtherFilters.map( ( curFilter ) => {
                if ( curFilter.key ) {
                    return curFilter.key;
                } else if ( curFilter.group && curFilter.value ) {
                    return `${encodeURIComponent(
                        curFilter.group
                    )}:${encodeURIComponent( curFilter.value )}`;
                }
                return null;
            } )
        );
        const allFilters = ( () => {
            if (
                !filters.some( ( curFilter ) => curFilter.type === 'cateFilter' ) &&
                this._permanentExtraCateFilter
            ) {
                const permExtractFilter = filterOutNull( [
                    this._permanentExtraCateFilter.key,
                ] );
                return ( filters && filters.length ) ||
                    this._permanentOtherFilters.length ||
                    this._permanentExtraCateFilter
                    ? filterStrings.concat( permFilterStrings, permExtractFilter )
                    : [];
            } else {
                return ( filters && filters.length ) ||
                    this._permanentOtherFilters.length
                    ? filterStrings.concat( permFilterStrings )
                    : [];
            }
        } )();
        return allFilters;
    }

    /**
     * Replace selected facet with facet from service in case it was added by key only or name and group only
     * @param curFacet the facet to be checked
     * @param curKey the current group of facets being checked
     */
    private _replaceFacetWithServerValue(
        curFacet: FacetResponse,
        curKey: string
    ): Facet | undefined {
        const selectedFacet = this._selectedFacetsArray
            .concat(
                this._permanentOtherFilters,
                filterOutNull( [this._permanentExtraCateFilter] )
            )
            .find( ( selFacet ) => {
                if ( selFacet ) {
                    if ( selFacet.key ) {
                        return selFacet.key === curFacet.facetId;
                    } else if ( selFacet.value && selFacet.group ) {
                        return (
                            selFacet.value === curFacet.facetName &&
                            selFacet.group === curKey
                        );
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } );

        if ( selectedFacet ) {
            const selectedFacetIndex =
                this._selectedFacetsArray.indexOf( selectedFacet );
            selectedFacet.value = curFacet.facetName;
            selectedFacet.key = curFacet.facetId;
            selectedFacet.group = curKey;
            selectedFacet.type =
                curKey === this._CATEGORIES_KEY ? 'cateFilter' : 'filter';
            this._selectedFacetsArray[selectedFacetIndex] = selectedFacet;
        }
        return selectedFacet;
    }

    /**
     * Updates the url with the current set of facet keys.
     */
    private saveSelectedFacetsToQueryParams() {
        const selectedFacetsArray = this._selectedFacetsArray
            .filter( ( curFacet ) => curFacet.type === 'filter' )
            .map( ( curFacet ) => curFacet.key );
        const selectedCateFacet = this._selectedFacetsArray
            .filter( ( curFacet ) => curFacet.type === 'cateFilter' )
            .map( ( curFacet ) => curFacet.key );

        const urlTree = this.router.createUrlTree( [] );
        const urlWithoutQuery = urlTree.root.children['primary'].segments
            .map( ( it ) => it.path )
            .join( '/' );

        this.location.replaceState(
            urlWithoutQuery,
            `filters=${selectedFacetsArray.join(
                ','
            )}&cateFilter=${selectedCateFacet.join( ',' )}`
        );
    }
}

function filterOutNull<T>( array: ( T | null | undefined )[] ) {
    const result: T[] = [];
    array.forEach( ( item ) => {
        if ( item !== null && item !== undefined ) {
            result.push( item );
        }
    } );
    return result;
}

type AllButUndefined = null | boolean | number | string | object;

function cleanUndefined<T>( obj: T ): Record<string, AllButUndefined> {
    if ( typeof obj !== 'object' ) {
        throw new Error( 'You cannot clean a non object' );
    }
    const res: Record<string, AllButUndefined> = {};
    Object.entries<any>( obj as any ).forEach( ( [key, value] ) => {
        if ( value !== undefined ) {
            res[key] = value;
        }
    } );

    return res;
}
