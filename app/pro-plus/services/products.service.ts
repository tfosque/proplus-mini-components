import { Injectable } from '@angular/core';
import {
    ProPlusApiBase,
    ApiResult,
    ApiResponse,
} from './pro-plus-api-base.service';
import { ItemListResponseV2 } from '../model/item-list-response';
import { ApiError } from '../services/api-error';
import { AppError } from '../../common-components/classes/app-error';
import {
    ConfirmationProduct,
    ConfirmAvailableProductsComponent,
    ProductConfirmationConfig,
} from '../../pro-plus/shared-components/confirm-available-products/confirm-available-products.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from './user.service';
import { BehaviorSubject, from, Observable, of, ReplaySubject } from 'rxjs';
import { ItemResponse } from '../../api-response-interfaces/item-response';
import { debounceTime, distinctUntilChanged, flatMap, map, take } from 'rxjs/operators';
import { ProductImp } from '../../global-classes/product-imp';
import { SearchModalService } from '../../services/search-modal.service';
import { FacetsService } from '../../services/facets.service';
import { UserNotifierService } from '../../common-components/services/user-notifier.service';
import { PageEvent } from '@angular/material/paginator';
import * as _ from 'lodash';
//  Represents a single product search
export interface ProductSearchRequest {
    accountId: string;
    filter: string; // Text being search
    pageNo: number;
    pageSize: number;
    showHoverAttrs: boolean;
    hoverSearch: boolean;
    showSkuList: boolean;
    facets?: string;
    facetsFilter?: string;
    cateFilter?: string;
    matchMode?: string;
}

export interface ProductItemRequest {
    accountId?: string;
    productId?: string;
    itemNumber?: string;
}

@Injectable( {
    providedIn: 'root',
} )
export class ProductsService {
    accountInfo: any = {};
    private isLoadingSearch = new BehaviorSubject<boolean>( false );
    public isLoadingSearch$ = this.isLoadingSearch.asObservable();

    private searchRequestLog: any = new BehaviorSubject<any>( [] )
    public searchRequestLog$ = this.searchRequestLog.asObservable();

    categoryFilters = '';
    //
    private isLoadingSelectedSku = new BehaviorSubject<boolean>( false );
    public isLoadingSelectedSku$ = this.isLoadingSelectedSku.asObservable();

    // search modal pagination (searchModalPagination)
    pageEvent = new BehaviorSubject<any>( {} );
    private pagination = new BehaviorSubject<any>(
        { pageNo: 1, pageSize: 20, totalRecords: 0, index: 0, previousIndex: 1 } );
    public pagination$ = this.pagination.asObservable();
    pageNo = 1;

    //
    private searchStr$ = new BehaviorSubject<any>( '' );

    private readonly suggestionsMaps = new Map<
        string,
        Observable<SuggestiveSellingResponse>
    >();

    constructor(
        private readonly api: ProPlusApiBase,
        private readonly dialog: MatDialog,
        private readonly userService: UserService,
        private readonly userNotifier: UserNotifierService,
        private readonly searchModalService: SearchModalService,
        private readonly facetsService: FacetsService

    ) {
        this.userService.sessionBehavior.subscribe( ( user: any ) => {
            this.accountInfo = user.session.user;
        } )
        this.searchModalService.searchStr$.subscribe( str => {
            this.searchStr$.next( str );
        } )
    }

    private async getItemDetailsInternal(
        req: ProductItemRequest
    ): Promise<ProductDetailsResponse | null> {
        const response = await this.api.getV2<ProductDetailsResponse>(
            'itemDetails',
            req
        );
        const { ok, body } = response;
        if ( !ok ) {
            throw new ApiError( 'getItemDetails', response );
        }
        return body;
    }

    public getItemDetails(
        req: ProductItemRequest
    ): Promise<ProductDetailsResponse | null> {
        const { isLoggedIn, accountId } = this.api.userSession.value;
        if ( isLoggedIn && accountId ) {
            req.accountId = accountId.toString();
        }
        return this.getItemDetailsInternal( req );
    }

    public async searchProducts( req: ProductSearchRequest ) {
        const response = await this.api.getV2<ItemListResponseV2>(
            'itemlist',
            req
        );
        const { ok, body } = response;
        if ( !ok ) {
            throw new ApiError( 'searchProducts', response );
        }
        return body;
    }

    public async getTypeAhead( req: TypeAheadReq ) {
        const response = await this.api.getV2<TypeAheadResponse>(
            'typeAhead',
            req
        );
        const { ok, body } = response;
        if ( !ok ) {
            throw new ApiError( 'Type ahead text', response );
        }
        return body;
    }

    public async getPricingForUOM(
        skuId: string,
        accountId: string,
        jobNumber: string | null = null
    ): Promise<PricingResponse> {
        const request: PricingRequest = {
            // skuIds: `${skuId}:${uom}`,
            skuIds: `${skuId}`,
            accountId: accountId,
        };
        if ( jobNumber ) {
            request.jobNumber = jobNumber;
        }
        return await this.api.tryGetResponse<PricingResponse>(
            'v2',
            'pricing',
            request
        );
    }

    public async getManyPricing(
        skuIds: string[],
        accountId?: string,
        jobNumber: string | null = null
    ) {
        if ( !skuIds || !skuIds.length ) {
            return null;
        }
        if ( !accountId ) {
            const userAccountId = this.api.userSession.value.accountId;
            accountId = userAccountId ? userAccountId.toString() : accountId;
        }
        if ( !accountId ) {
            throw new AppError( 'Must be logged in to get prices' );
        }
        const request: PricingRequest = {
            skuIds: skuIds.join( ',' ),
            accountId: accountId,
        };
        if ( jobNumber ) {
            request.jobNumber = jobNumber;
        }
        const response = await this.api.tryGetResponse<PricingResponse>(
            'v2',
            'pricing',
            request
        );
        return response;
    }

    public getSuggestiveSelling(
        req: SuggestiveSellingRequest
    ): Observable<SuggestiveSellingResponse> {
        const itemNumbers = req.itemNumber.join( ',' );

        const key = `${req.account}-${itemNumbers}-${req.pageSize}-${req.pageSize}`;
        const result = this.suggestionsMaps.get( key );
        if ( !!result ) {
            return result;
        }
        const cachedObservable = new ReplaySubject<SuggestiveSellingResponse>(
            1
        );
        this.suggestionsMaps.set( key, cachedObservable );

        const request: SuggestiveSellingRequestInternal = {
            account: req.account,
            itemNumber: itemNumbers,
            pageSize: req.pageSize.toString(),
            pageNo: req.pageNo.toString(),
        };

        this.api
            .getApiObservable<SuggestiveSellingResponse>(
                'v2',
                'suggestiveSelling',
                request
            )
            .subscribe(
                ( r ) => {
                    cachedObservable.next( r );
                },
                ( e ) => {
                    this.suggestionsMaps.delete( key );
                    cachedObservable.error( e );
                }
            );

        return cachedObservable;
    }

    async checkProductsBeforeAdding(
        products: ConfirmationProduct[],
        cartOrTemplate: string,
        whenUserSaysOk: ( availableItems: Set<string> ) => void
    ) {
        //  Abort if we're not logged in...
        const currentUser = this.api.userSession.value.sessionInfo;
        if ( !currentUser || !currentUser.accountBranch ) {
            throw new Error( 'Failed to get user info' );
        }

        const unfilteredProducts = products.filter( ( i ) => i.itemNumber !== '0' );
        //  Filter out invalid products
        const cleanedProducts = unfilteredProducts.map( ( i ) => i.itemNumber );

        //  If there's nothing to add, let the user know
        if ( cleanedProducts.length === 0 ) {
            throw new Error( 'You have no stock products to add.' );
        }
        const skuCheckResult = await this.getSKUBranchOrRegionAvailability( {
            skuIds: cleanedProducts.join( ',' ),
            //  We only need to pass in the regionId because we're only validating region availability
            // branchId: currentUser.accountBranch.branchNumber,
            regionId: currentUser.accountBranch.branchRegionId,
            marketId: currentUser.accountBranch.market
                ? currentUser.accountBranch.market
                : '',
        } );

        //  Only keep the regionally available ones
        let availableSkuArray: string[] = [];
        if ( currentUser.accountBranch.market ) {
            availableSkuArray = (
                ( skuCheckResult && skuCheckResult.result ) ||
                []
            )
                .filter( ( s ) => s.isSKUAvailableAtRegion.toLowerCase() === 'yes' )
                .map( ( s ) => s.sku_id );
        } else {
            availableSkuArray = (
                ( skuCheckResult && skuCheckResult.result ) ||
                []
            )
                .filter(
                    ( s ) =>
                        s.isSKUAvailableAtRegion.toLowerCase() === 'yes' &&
                        !s.market
                )
                .map( ( s ) => s.sku_id );
        }

        const availableSkuList = new Set<string>( availableSkuArray );
        const unavailableSkuList = new Set<string>(
            cleanedProducts.filter( ( p ) => !availableSkuList.has( p ) )
        );

        //  Don't show a dialog if everything is available
        if ( unavailableSkuList.size === 0 ) {
            whenUserSaysOk( availableSkuList );
            return;
        }

        const availableLineItems = unfilteredProducts.filter( ( l ) =>
            availableSkuList.has( l.itemNumber )
        );
        const unavailableLineItems = unfilteredProducts.filter(
            ( l ) => !availableSkuList.has( l.itemNumber )
        );

        const config: ProductConfirmationConfig = {
            unavailableLineItems,
            availableLineItems,
            unavailableSkuList: Array.from( unavailableSkuList ),
            cartOrTemplate,
            whenUserSaysOk,
        };

        const dialogRef = this.dialog.open( ConfirmAvailableProductsComponent, {
            data: config,
        } );
        dialogRef.afterClosed().subscribe();
    }

    private getProductInternal(
        req: ItemDetailRequest
    ): Observable<ItemResponse> {
        const queryParams: Record<string, string> = {};
        queryParams.productId = req.productId;
        if ( req.itemNumber ) {
            queryParams.itemNumber = req.itemNumber;
        }
        if ( req.accountId ) {
            queryParams.accountId = req.accountId;
        }
        if ( req.jobNumber ) {
            queryParams.jobNumber = req.jobNumber;
        }
        if ( req.uom ) {
            queryParams.uom = req.uom;
        }

        const queryParams2 = { ...queryParams };
        delete queryParams2.accountId;
        delete queryParams2.jobNumber;

        const version = req.accountId ? 'v2' : 'v3';

        //  Let's try to fetch the item details
        return this.api
            .getApiObservable<ItemResponse>( version, 'itemDetails', queryParams )
            .pipe(
                flatMap( ( details ) => {
                    if ( !req.accountId || details.product ) {
                        return of( details );
                    }
                    return this.api.getApiObservable<ItemResponse>(
                        'v3',
                        'itemDetails',
                        queryParams2
                    );
                } )
            );
    }

    /**
     * Makes a call to the rest service and returns an observable with product information.
     * @param productId product identifier passed to service call.
     * @param itemNumber optional value for product sku numbers.
     */
    public getProduct(
        productId: string = '',
        itemNumber: string | null = '',
        allowFromAllBranches = false,
        accountIdParam?: string | null
    ): Observable<ProductImp | null> {
        //  TODO - Check the userService to see if we're logged in...

        const req: ItemDetailRequest = { productId, itemNumber };

        const { isLoggedIn, accountIdInString } = this.userService;
        accountIdParam =
            accountIdParam ||
            ( accountIdInString ? `${accountIdInString}` : null );
        if ( isLoggedIn && accountIdParam ) {
            req.accountId = accountIdParam;
        }
        const fromAccount = accountIdParam || null;

        /*
    If we're logged in
      -- Fetch product + pricing information from the other product API
      -- We'll incorporate it into the ProductImp with addPricingInfo()

    */

        const response = this.getProductInternal( req );
        return response.pipe(
            flatMap( async ( itemResponse ) => {
                //  First fetch the product info from the anonymous API
                let product = ProductImp.fromItemResponse(
                    fromAccount,
                    itemResponse
                );
                if ( !product && req.accountId && allowFromAllBranches ) {
                    delete req.accountId;
                    const response2 = await this.getProductInternal(
                        req
                    ).toPromise();
                    product = ProductImp.fromItemResponse(
                        fromAccount,
                        response2
                    );
                }
                if ( !product ) {
                    return null;
                }

                if ( product.currentSKU && !product.currentSKU.currentUOM ) {
                    // TODO: Improve logic UOM not on original api call
                    delete req.accountId;
                    const response2 = await this.getProductInternal(
                        req
                    ).toPromise();
                    product.currentSKU.currentUOM =
                        response2.currentSKU.currentUOM;
                }

                //  If we're logged in, fetch more information
                if ( isLoggedIn && accountIdParam && product ) {
                    const skus = product.skuList.map( ( s ) => s.itemNumber );
                    if ( skus.length === 0 && product.currentSKU ) {
                        skus.push( product.currentSKU.itemNumber );
                    }

                    product.addProductService(
                        this,
                        parseInt( accountIdParam, 10 )
                    );

                    //  Get the details for our account and all the prices for each SKU
                    const fetches = {
                        details: await this.getItemDetails( {
                            productId: product.productId,
                            accountId: accountIdParam.toString(),
                        } ),
                    };

                    const { details } = fetches;

                    if ( details ) {
                        product.includeProPlusDetails( details );
                    }
                }
                return product;
            } )
        );
    }

    // /getSKUBranchOrRegionAvailability
    public async getSKUBranchOrRegionAvailability( req: {
        skuIds: string;
        branchId?: string;
        regionId?: string;
        marketId?: string;
    } ) {
        // tslint:disable-next-line: no-any
        const response = await this.api.getV2<SKUAvailabilityResponse>(
            'getSKUBranchOrRegionAvailability',
            req
        );
        const { ok, body } = response;
        if ( !ok ) {
            throw new ApiError(
                'Error getting sku branch or region availability',
                response
            );
        }
        return body;
    }

    public getProductBranchOrRegionAvailability( req: {
        productIds: string;
        branchId?: string;
        regionId?: string;
    } ) {
        // tslint:disable-next-line: no-any
        return this.api.getApiObservable<ProductAvailabilityResponse>(
            'v2',
            'getProductBranchOrRegionAvailability',
            req
        );
    }

    public async updateOrderAlert( orderAlert: OrderAlert ) {
        const { ok, body } = await this.api.postV2<any>(
            'updateOrderAlert',
            orderAlert
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to update order alert setting' );
        }
        return body;
    }

    public async getMultipleProductVariation( items: ProductVariationRequest[] ) {
        const { ok, body } = await this.api.postV2<MultipleProductVariationResponse>(
            'getMultipleProductVariation',
            items
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to get multiple product variation' );
        }
        return body;
    }

    public async getProductVariation( item: ProductVariationRequest ) {
        const { ok, body } = await this.api.getV2<ProductVariationResponse>(
            'getProductVariation',
            item
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to get product variation' );
        }
        return body;
    }
    //
    searchProductsByCateFilterAdd( item: any, label: string, cat?: any ) {
        // console.group( 'searchProductsByCateFilerAdd' )
        console.log( { item, label } )

        if ( !_.isEmpty( item ) ) {
            item.facetCategoryName = label;
            this.facetsService.addFacetCrumb( item );
        }

        // build request
        const filter = this.searchStr$.value;
        const { cateFilter, matchMode } = this.facetsService.categoriesSearchObj;
        const selectedFacets = this.facetsService.getSelectedFacets();
        const facetsRaw = selectedFacets.map( ( m: any ) => {
            return m.facetId;
        } );
        const facetsFilter = facetsRaw.join( ',' );

        //
        console.log( { selectedFacets }, { filter } )

        const accountId = this.api.userSession.value.session.user?.lastSelectedAccount.accountLegacyId;
        const request: any = {
            accountId: accountId || '',
            filter,
            cateFilter,
            facetsFilter,
            pageNo: 1,
            pageSize: 20,
            showHoverAttrs: false,
            hoverSearch: false,
            showSkuList: true,
            matchMode
        }
        // console.log( { filter, cateFilter, facetsRaw, facetsFilter, request } );

        // fetch api
        this.isLoadingSearch.next( true );
        this.searchModalService.setIsLoadingSearch( true );
        this.searchRequestLog.next( { ...this.searchRequestLog.value, request, cat } );
        // console.log( 'requestLog:', this.searchRequestLog.value )

        // API find the double api call DOUBLE 
        from( this.searchProducts( request ) )
            .pipe(
                take( 2 ),
                debounceTime( 1300 ),
                distinctUntilChanged(),
                map( ( searchResponse: any ) => {

                    if ( searchResponse?.totolNumRecs < 1 ) {
                        this.isLoadingSearch.next( false );
                        this.searchModalService.setIsLoadingSearch( false );
                        console.log( 'no records found....' )
                        return;
                    }
                    return searchResponse;
                } )
            )
            .subscribe(
                res => {
                    if ( res ) {
                        this.searchModalService.setSearchResults( [] );
                        //
                        this.searchModalService.setSearchResults( res.items );
                        this.searchModalService.setSearchTotalRecords( res.totalNumRecs );
                        this.facetsService.buildFacets( res.facets );
                        this.searchModalService.setPageIndex( 1 );
                    }
                },
                error => {
                    this.isLoadingSearch.next( false );
                    this.searchModalService.setIsLoadingSearch( false );
                    console.log( { error } )
                },
                () => {
                    this.isLoadingSearch.next( false );
                    this.searchModalService.setIsLoadingSearch( false );
                    console.log( 'completed search......' );
                    console.log( 'isLoading', this.isLoadingSearch.value )
                }
            )
        console.groupEnd();
    };

    async searchProductsByCateFilterDelete( item: any ) {
        if ( !_.isEmpty( item ) ) {
            // load search with or without facets
            this.facetsService.deleteFacetCrumb( item );
        }

        // capture reset: if not facets crumbs are selected then cateFilters to default
        const blankSearch = !this.facetsService.getSelectedFacets().length;

        let filter = this.searchStr$.value;
        let cateFilter = this.facetsService.categoriesSearchObj.cateFilter;
        let facetsFilter = '';
        const { matchMode } = this.facetsService.categoriesSearchObj;

        //
        if ( !blankSearch ) {
            // filtered search
            filter = this.searchStr$.value;
            cateFilter = this.facetsService.categoriesSearchObj.cateFilter;
            const selectedFacets = this.facetsService.getSelectedFacets();
            console.log( { selectedFacets } )

            // format facets
            const facetsRaw = selectedFacets.map( ( m: any ) => {
                return m.facetId;
            } );
            facetsFilter = facetsRaw.join( ',' );
        } else {
            console.log( 'This is not a filtered search......' );
        }

        /*  */
        const accountId = this.api.userSession.value.session.user?.lastSelectedAccount.accountLegacyId;

        const request: any = {
            accountId: accountId || '',
            filter,
            cateFilter,
            facetsFilter,
            pageNo: 1,
            pageSize: 20,
            showHoverAttrs: false,
            hoverSearch: false,
            showSkuList: true,
            matchMode
        }
        //
        this.isLoadingSearch.next( true );
        this.searchModalService.setIsLoadingSearch( true );

        const searchResponse: any = await this.searchProducts( request );

        this.searchRequestLog.next( [...this.searchRequestLog.value, request] );

        if ( searchResponse?.totolNumRecs < 1 ) {
            this.isLoadingSearch.next( false );
            this.searchModalService.setIsLoadingSearch( false );
            console.log( 'no records found....' )
            return;
        }
        this.searchModalService.setSearchResults( searchResponse.items );
        this.facetsService.buildFacets( searchResponse.facets );
        this.searchModalService.setSearchTotalRecords( searchResponse.totalNumRecs );
        this.searchModalService.setPageIndex( 1 );
        //
        this.isLoadingSearch.next( false );
        this.searchModalService.setIsLoadingSearch( false );
    }

    async resetSearch() {
        this.searchModalService.resetEmptySearchResults();

        const filter = ''
        const facetsFilter = ''
        const cateFilter = this.facetsService.defaultCateFilters;

        const accountId = this.api.userSession.value.session.user?.lastSelectedAccount.accountLegacyId;
        const request: any = {
            accountId: accountId || '',
            filter,
            facetsFilter,
            cateFilter,
            pageNo: 1,
            pageSize: 20,
            showHoverAttrs: false,
            hoverSearch: false,
            showSkuList: true,
            matchMode: 'any'
        }
        // console.log( { request }, 'request', { cateFilter } )
        //
        this.isLoadingSearch.next( true );
        this.searchModalService.setIsLoadingSearch( true );

        const searchResponse: any = await this.searchProducts( request );

        this.searchRequestLog.next( [...this.searchRequestLog.value, request] );
        this.resetPagination();

        if ( searchResponse?.totolNumRecs < 1 ) {
            this.isLoadingSearch.next( false );
            this.searchModalService.setIsLoadingSearch( false );
            console.log( 'no records found....' )
            return;
        }
        this.searchModalService.setSearchResults( searchResponse.items );
        this.facetsService.buildFacets( searchResponse.facets );
        this.searchModalService.setSearchTotalRecords( searchResponse.totalNumRecs );
        this.searchModalService.setPageIndex( 1 );
        //
        this.isLoadingSearch.next( false );
        this.searchModalService.setIsLoadingSearch( false );
    }

    performSearchWithFilters( facetsFilter: string ) {
        const accountId = this.accountInfo.lastSelectedAccount.accountLegacyId;
        const filter = this.searchStr$.value;

        const cateFilter = this.facetsService.cateFilter;
        const matchMode = '';

        console.log( { cateFilter } );
        console.log( { filter } );

        this.searchModalService.setIsLoadingSearch( true );

        from( this.searchProducts( {
            accountId, filter, facetsFilter, pageNo: 1, pageSize: 20,
            showHoverAttrs: false, showSkuList: true, hoverSearch: false, cateFilter, matchMode
        } ) )
            .pipe(
                distinctUntilChanged(),
                debounceTime( 900 ),
                map( ( m: any ) => {
                    return m;
                } )
            )
            .subscribe(
                searchResultsByIds => {
                    // this.updateAfterSearch( searchResultsByIds, fromPage );
                    if ( searchResultsByIds ) {
                        this.searchModalService.setSearchResults( searchResultsByIds.items );
                        this.facetsService.buildFacets( searchResultsByIds.facets );
                        this.searchModalService.setSearchTotalRecords( searchResultsByIds.totalNumRecs );
                        this.searchModalService.setPageIndex( 1 );
                        this.isLoadingSearch.next( false );
                        this.searchModalService.setIsLoadingSearch( false );
                    }
                    console.log( { searchResultsByIds } );
                },
                err => {
                    this.userNotifier.alertError( 'Something went wrong with your search. Try again.' );
                    this.searchModalService.setIsLoadingSearch( false );
                    console.log( { err } );
                },
                () => {
                    this.searchModalService.setIsLoadingSearch( false );
                    console.log( 'completed searchResultsByIds....' );
                }
            )
    }

    getProductDetails( itemNumber = '', productId = '' ) {
        // console.log( 'ppProduct', { itemNumber }, { productId } );

        const { accountId } = this.accountInfo.lastSelectedAccount.accountLegacyId;

        this.searchModalService.setIsLoadingSelectedSku( true );
        from( this.getItemDetails( { accountId, itemNumber, productId } ) )
            .pipe()
            .subscribe(
                ( itemDetails: any ) => {
                    if ( itemDetails ) {
                        this.searchModalService.setProductDetails( itemDetails );
                    }
                },
                err => {
                    this.userNotifier.alertError( 'Failed to get data....' );
                    this.searchModalService.setIsLoadingSelectedSku( false );
                    console.log( { err } )
                },
                () => {
                    this.searchModalService.setIsLoadingSelectedSku( false );
                    console.log( 'completed itemDetails....' )
                }
            )
    }
    // NEXTPAGECATEFILTER 
    public nextPageWithCateFilter( filter = this.searchStr$.value, pageEvent: PageEvent ) {
        console.log( { pageEvent } );

        this.pageEvent.next( pageEvent );

        const categories = this.facetsService.defaultCateFilters;

        let cateFilter = ''
        let matchMode = 'all';
        const accountId = this.accountInfo.lastSelectedAccount?.accountLegacyId;

        // Search with cateFilter if available
        if ( categories && categories.length > 0 ) {
            cateFilter = categories
            this.categoryFilters = categories;

            if ( categories[0] !== 'miscellaneous' ) {
                matchMode = 'any';
            }
        }

        // Pagination
        if ( pageEvent.previousPageIndex &&
            pageEvent.previousPageIndex > pageEvent.pageIndex ) {

            // Clicked on prev button
            this.pageNo = pageEvent.previousPageIndex;
            this.searchModalService.setPageNo( this.pageNo - 1 );
            this.searchModalService.setPagination( pageEvent )
        } else {
            // Clicked on next button      
            this.pageNo = pageEvent.pageIndex + 1;
            this.searchModalService.setPageNo( this.pageNo )
        }

        this.isLoadingSearch.next( true );
        this.searchModalService.setIsLoadingSearch( true );

        console.log( 'this.page:info:', this.pageNo );
        console.log( 'pagination:', this.pagination.value );

        // search
        from( this.searchProducts( {
            accountId, filter, pageNo: this.pageNo, pageSize: this.pagination.value.pageSize,
            showHoverAttrs: false, showSkuList: true, hoverSearch: false, cateFilter, matchMode
        } ) )
            .pipe(
                debounceTime( 900 ),
                map( ( nextResults: any ) => {
                    return nextResults;
                } )
            ).subscribe(
                ( nextRes: any ) => {
                    console.log( { nextRes } );
                    this.searchModalService.setSearchResults( nextRes.items );
                    this.searchModalService.setSearchTotalRecords( nextRes.totalNumRecs );
                    this.facetsService.buildFacets( nextRes.facets );
                },
                ( err: any ) => {
                    this.isLoadingSearch.next( false );
                    this.searchModalService.setIsLoadingSearch( false )
                    this.userNotifier.alertError( 'Next pagination search failed...' )
                    console.log( { err } )
                },
                () => {
                    this.isLoadingSearch.next( false );
                    this.searchModalService.setIsLoadingSearch( false )
                    console.log( 'completed fetching next page....' );
                }
            );
    }

    /* LEGACY */
    searchProductsByFacetId( facetSelection: any = {}, isChecked: boolean, filterName?: string, fromPage?: string ) {

        if ( !facetSelection ) {
            console.log( 'Please select a facet to search...' );
            return;
        }

        let facetsFilter;

        // IMPORTANT only one category facet can be provided for search
        if ( filterName === 'Categories' ) {  // REVIEW this.facetsService.updateFactesSelected( facetSelection );         
            facetsFilter = facetSelection.facetId;
        } else {
            // otherwise non-category filter
            facetSelection.facetCategoryName = ''
            this.facetsService.addFacetCrumb( facetSelection );
            // IMPORTANT only one category facet can be provided for search
            // menu hasChildren then call that facetsFilter only (remove other filters)
            const facetIds = this.facetsService.getSelectedFacets().map( ( m: any ) => {
                return m.facetId;
            } );
            facetsFilter = facetIds.join( ',' );
            console.log( { facetIds }, { facetsFilter } );
        }

        // Remove Facet
        if ( !isChecked ) {
            this.facetsService.deleteFacetCrumb( facetSelection );

            // Search and remove facet
            this.performSearchWithFilters( facetsFilter );
            console.log( 'Removing facet...' );
            return;
        }

        // Search and add facet
        this.performSearchWithFilters( facetsFilter );
    }

    // NEXTPAGE  // DEBOUNCE need to implement // unique to modal fromPage(location)
    /*     public nextPage( filter = this.searchStr$.value, pageEvent: PageEvent ) {
            console.log( 'xxWrong....', { pageEvent } );
    
            const categories = this.categoryFilters;
    
            let cateFilter = ''
            let matchMode = 'all';
    
            // Search with cateFilter if available
            if ( categories && categories.length > 0 ) {
                cateFilter = categories
                this.categoryFilters = categories;
    
                if ( categories[0] !== 'miscellaneous' ) {
                    matchMode = 'any';
                }
            }
    
            this.pageEvent.next( pageEvent );
            this.searchModalService.setPagination( pageEvent )
    
            const accountId = this.accountInfo.lastSelectedAccount.accountLegacyId;
            console.log( { accountId } );
    
            if ( pageEvent.previousPageIndex &&
                pageEvent.previousPageIndex > pageEvent.pageIndex ) {
    
                // Clicked on prev button
                this.pageNo = pageEvent.previousPageIndex;
                this.searchModalService.setPageNo( this.pageNo - 1 )
            } else {
                // Clicked on next button      
                this.pageNo = pageEvent.pageIndex + 1;
                this.searchModalService.setPageNo( this.pageNo )
            }
    
            this.isLoadingSearch.next( true );
            this.searchModalService.setIsLoadingSearch( true );
    
            from( this.searchProducts( {
                accountId, filter, pageNo: this.pageNo, pageSize: this.pagination.value.pageSize,
                showHoverAttrs: false, showSkuList: true, hoverSearch: false, cateFilter, matchMode
            } ) )
                .pipe(
                    debounceTime( 900 ),
                    map( ( nextResults: any ) => {
                        return nextResults;
                    } )
                ).subscribe(
                    ( nextRes: any ) => {
                        console.log( { nextRes } );
                        this.searchModalService.setSearchResults( nextRes.items );
                        this.searchModalService.setSearchTotalRecords( nextRes.totalNumRecs );
                        this.facetsService.buildFacets( nextRes.facets );
                        this.isLoadingSearch.next( false );
                        this.searchModalService.setIsLoadingSearch( false );
                    },
                    ( err: any ) => {
                        this.isLoadingSearch.next( false );
                        this.searchModalService.setIsLoadingSearch( false )
                        this.userNotifier.alertError( 'Next pagination search failed...' )
                        console.log( { err } )
                    },
                    () => {
                        this.isLoadingSearch.next( false );
                        this.searchModalService.setIsLoadingSearch( false )
                        console.log( 'completed fetching next page....' );
                    }
                );
        } */
    /* resetPagination() {
        // this.pageNo.next( 1 );
        // this.pageSize.next( 20 );
        // this.paginator.firstPage();
        console.log( 'reseting paginator........' );
    } */
    /* updatePaginator( pageEvent: PageEvent ) {
        console.log( { pageEvent } );
        // this.pageEvent.next( pageEvent );
    } */

    /*  setMessage( str: string ) {
         // this.message.next( str );
     } */


    // SEARCH MODAL
    /*   async searchProductsByFilter( categories?: any[] ) {
          // ProductSearchRequest // Promise<ItemListResponseV2 | null
          const filter = this.searchStr$.value;
          let cateFilter = ''
          let matchMode = 'all';
          const facetsFilter = '';
  
          // const cats = categories || this.categoryFilters;
  
          // Search with cateFilter if available
          if ( categories && categories.length > 0 ) {
              cateFilter = categories.join( '+' );
              this.categoryFilters = cateFilter;
  
              if ( categories[0] !== 'miscellaneous' ) {
                  matchMode = 'any';
              }
          } else {
              cateFilter = this.categoryFilters;
          }
  
          const accountId = this.api.userSession.value.session.user?.lastSelectedAccount.accountLegacyId;
          const request: any = {
              accountId: accountId || '',
              filter,
              cateFilter,
              facetsFilter,
              pageNo: 1,
              pageSize: 20,
              showHoverAttrs: false,
              hoverSearch: false,
              showSkuList: true,
              matchMode
          }
          //
          this.isLoadingSearch.next( true );
          this.searchModalService.setIsLoadingSearch( true );
  
          const searchResponse: any = await this.searchProducts( request );
  
          if ( searchResponse?.totolNumRecs < 1 ) {
              this.isLoadingSearch.next( false );
              console.log( 'no records found....' )
              return;
          }
          this.searchModalService.setSearchResults( searchResponse.items );
          this.facetsService.buildFacets( searchResponse.facets );
          this.searchModalService.setSearchTotalRecords( searchResponse.totalNumRecs );
          this.searchModalService.setPageIndex( 1 );
          this.isLoadingSearch.next( false );
          this.searchModalService.setIsLoadingSearch( false );
      }; */

    /*  searchProductsByCateFilterAdd( item: any, label: string, cat?: any ) {
         // console.group( 'searchProductsByCateFilerAdd' )
         // console.log( { item, label } )
 
         if ( !_.isEmpty( item ) ) {
             item.facetCategoryName = label;
             this.facetsService.addFacetCrumb( item );
         }
 
         // build request
         const filter = this.searchStr$.value;
         const { cateFilter, matchMode } = this.facetsService.categoriesSearchObj;
         const selectedFacets = this.facetsService.getSelectedFacets();
         const facetsRaw = selectedFacets.map( ( m: any ) => {
             return m.facetId;
         } );
         const facetsFilter = facetsRaw.join( ',' );
 
         const accountId = this.api.userSession.value.session.user?.lastSelectedAccount.accountLegacyId;
         const request: any = {
             accountId: accountId || '',
             filter,
             cateFilter,
             facetsFilter,
             pageNo: 1,
             pageSize: 20,
             showHoverAttrs: false,
             hoverSearch: false,
             showSkuList: true,
             matchMode
         }
         // console.log( { filter, cateFilter, facetsRaw, facetsFilter, request } );
 
         // fetch api
         this.isLoadingSearch.next( true );
         this.searchModalService.setIsLoadingSearch( true );
         this.searchRequestLog.next( { ...this.searchRequestLog.value, request, cat } );
         // console.log( 'requestLog:', this.searchRequestLog.value )
 
         // API find the double api call DOUBLE 
         from( this.searchProducts( request ) )
             .pipe(
                 take( 2 ),
                 debounceTime( 1300 ),
                 distinctUntilChanged(),
                 map( ( searchResponse: any ) => {
 
                     if ( searchResponse?.totolNumRecs < 1 ) {
                         this.isLoadingSearch.next( false );
                         this.searchModalService.setIsLoadingSearch( false );
                         console.log( 'no records found....' )
                         return;
                     }
                     return searchResponse;
                 } )
             )
             .subscribe(
                 res => {
                     if ( res ) {
                         this.searchModalService.setSearchResults( [] );
                         //
                         this.searchModalService.setSearchResults( res.items );
                         this.searchModalService.setSearchTotalRecords( res.totalNumRecs );
                         this.facetsService.buildFacets( res.facets );
                         this.searchModalService.setPageIndex( 1 );
                     }
                 },
                 error => {
                     this.isLoadingSearch.next( false );
                     this.searchModalService.setIsLoadingSearch( false );
                     console.log( { error } )
                 },
                 () => {
                     this.isLoadingSearch.next( false );
                     this.searchModalService.setIsLoadingSearch( false );
                     console.log( 'completed search......' );
                     console.log( 'isLoading', this.isLoadingSearch.value )
                 }
             )
         console.groupEnd();
     }; */

    /*     async searchProductsByCateFilterDelete( item: any ) {
            if ( !_.isEmpty( item ) ) {
                // load search with or without facets
                this.facetsService.deleteFacetCrumb( item );
            }
    
            // capture reset: if not facets crumbs are selected then cateFilters to default
            const blankSearch = !this.facetsService.getSelectedFacets().length;
    
            let filter = this.searchStr$.value;
            let cateFilter = this.facetsService.categoriesSearchObj.cateFilter;
            let facetsFilter = '';
            const { matchMode } = this.facetsService.categoriesSearchObj;
    
            //
            if ( !blankSearch ) {
                // filtered search
                filter = this.searchStr$.value;
                cateFilter = this.facetsService.categoriesSearchObj.cateFilter;
                const selectedFacets = this.facetsService.getSelectedFacets();
                console.log( { selectedFacets } )
    
                // format facets
                const facetsRaw = selectedFacets.map( ( m: any ) => {
                    return m.facetId;
                } );
                facetsFilter = facetsRaw.join( ',' );
            } else {
                console.log( 'This is not a filtered search......' );
            }
    
           
            const accountId = this.api.userSession.value.session.user?.lastSelectedAccount.accountLegacyId;
    
            const request: any = {
                accountId: accountId || '',
                filter,
                cateFilter,
                facetsFilter,
                pageNo: 1,
                pageSize: 20,
                showHoverAttrs: false,
                hoverSearch: false,
                showSkuList: true,
                matchMode
            }
            //
            this.isLoadingSearch.next( true );
            this.searchModalService.setIsLoadingSearch( true );
    
            const searchResponse: any = await this.searchProducts( request );
    
            this.searchRequestLog.next( [...this.searchRequestLog.value, request] );
    
            if ( searchResponse?.totolNumRecs < 1 ) {
                this.isLoadingSearch.next( false );
                this.searchModalService.setIsLoadingSearch( false );
                console.log( 'no records found....' )
                return;
            }
            this.searchModalService.setSearchResults( searchResponse.items );
            this.facetsService.buildFacets( searchResponse.facets );
            this.searchModalService.setSearchTotalRecords( searchResponse.totalNumRecs );
            this.searchModalService.setPageIndex( 1 );
            //
            this.isLoadingSearch.next( false );
            this.searchModalService.setIsLoadingSearch( false );
        } */

    /*     async resetSearch() {
            this.searchModalService.resetEmptySearchResults();
    
            const filter = ''
            const facetsFilter = ''
            const cateFilter = this.facetsService.defaultCateFilters;
    
            const accountId = this.api.userSession.value.session.user?.lastSelectedAccount.accountLegacyId;
            const request: any = {
                accountId: accountId || '',
                filter,
                facetsFilter,
                cateFilter,
                pageNo: 1,
                pageSize: 20,
                showHoverAttrs: false,
                hoverSearch: false,
                showSkuList: true,
                matchMode: 'any'
            }
            // console.log( { request }, 'request', { cateFilter } )
            //
            this.isLoadingSearch.next( true );
            this.searchModalService.setIsLoadingSearch( true );
    
            const searchResponse: any = await this.searchProducts( request );
    
            this.searchRequestLog.next( [...this.searchRequestLog.value, request] );
    
    
            if ( searchResponse?.totolNumRecs < 1 ) {
                this.isLoadingSearch.next( false );
                this.searchModalService.setIsLoadingSearch( false );
                console.log( 'no records found....' )
                return;
            }
            this.searchModalService.setSearchResults( searchResponse.items );
            this.facetsService.buildFacets( searchResponse.facets );
            this.searchModalService.setSearchTotalRecords( searchResponse.totalNumRecs );
            this.searchModalService.setPageIndex( 1 );
            //
            this.isLoadingSearch.next( false );
            this.searchModalService.setIsLoadingSearch( false );
        } */

    /*     performSearchWithFilters( facetsFilter: string ) {
            const accountId = this.accountInfo.lastSelectedAccount.accountLegacyId;
            const filter = this.searchStr$.value;
    
            const cateFilter = this.facetsService.cateFilter;
            const matchMode = '';
    
            console.log( { cateFilter } );
            console.log( { filter } );
    
            this.searchModalService.setIsLoadingSearch( true );
    
            from( this.searchProducts( {
                accountId, filter, facetsFilter, pageNo: 1, pageSize: 20,
                showHoverAttrs: false, showSkuList: true, hoverSearch: false, cateFilter, matchMode
            } ) )
                .pipe(
                    distinctUntilChanged(),
                    debounceTime( 900 ),
                    map( ( m: any ) => {
                        return m;
                    } )
                )
                .subscribe(
                    searchResultsByIds => {
                        // this.updateAfterSearch( searchResultsByIds, fromPage );
                        if ( searchResultsByIds ) {
                            this.searchModalService.setSearchResults( searchResultsByIds.items );
                            this.facetsService.buildFacets( searchResultsByIds.facets );
                            this.searchModalService.setSearchTotalRecords( searchResultsByIds.totalNumRecs );
                            this.searchModalService.setPageIndex( 1 );
                            this.isLoadingSearch.next( false );
                            this.searchModalService.setIsLoadingSearch( false );
                        }
                        console.log( { searchResultsByIds } );
                    },
                    err => {
                        this.userNotifier.alertError( 'Something went wrong with your search. Try again.' );
                        this.searchModalService.setIsLoadingSearch( false );
                        console.log( { err } );
                    },
                    () => {
                        this.searchModalService.setIsLoadingSearch( false );
                        console.log( 'completed searchResultsByIds....' );
                    }
                )
        } */

    /*     getProductDetails( itemNumber = '', productId = '' ) {
            // console.log( 'ppProduct', { itemNumber }, { productId } );
    
            const { accountId } = this.accountInfo.lastSelectedAccount.accountLegacyId;
    
            this.searchModalService.setIsLoadingSelectedSku( true );
            from( this.getItemDetails( { accountId, itemNumber, productId } ) )
                .pipe()
                .subscribe(
                    ( itemDetails: any ) => {
                        if ( itemDetails ) {
                            this.searchModalService.setProductDetails( itemDetails );
                        }
                    },
                    err => {
                        this.userNotifier.alertError( 'Failed to get data....' );
                        this.searchModalService.setIsLoadingSelectedSku( false );
                        console.log( { err } )
                    },
                    () => {
                        this.searchModalService.setIsLoadingSelectedSku( false );
                        console.log( 'completed itemDetails....' )
                    }
                )
        } */
    // NEXTPAGECATEFILTER 
    /*     public nextPageWithCateFilter( filter = this.searchStr$.value, pageEvent: PageEvent ) {
            // console.log( { pageEvent } );
    
            this.pageEvent.next( pageEvent );
    
            const categories = this.facetsService.defaultCateFilters;
    
            let cateFilter = ''
            let matchMode = 'all';
            const accountId = this.accountInfo.lastSelectedAccount.accountLegacyId;
    
            // Search with cateFilter if available
            if ( categories && categories.length > 0 ) {
                cateFilter = categories
                this.categoryFilters = categories;
    
                if ( categories[0] !== 'miscellaneous' ) {
                    matchMode = 'any';
                }
            }
    
            if ( pageEvent.previousPageIndex &&
                pageEvent.previousPageIndex > pageEvent.pageIndex ) {
    
                // Clicked on prev button
                this.pageNo = pageEvent.previousPageIndex;
                this.searchModalService.setPageNo( this.pageNo - 1 )
            } else {
                // Clicked on next button      
                this.pageNo = pageEvent.pageIndex + 1;
                this.searchModalService.setPageNo( this.pageNo )
            }
    
            this.isLoadingSearch.next( true );
            this.searchModalService.setIsLoadingSearch( true );
    
            // search
            from( this.searchProducts( {
                accountId, filter, pageNo: this.pageNo, pageSize: this.pagination.value.pageSize,
                showHoverAttrs: false, showSkuList: true, hoverSearch: false, cateFilter, matchMode
            } ) )
                .pipe(
                    debounceTime( 900 ),
                    map( ( nextResults: any ) => {
                        return nextResults;
                    } )
                ).subscribe(
                    ( nextRes: any ) => {
                        // console.log( { nextRes } );
                        this.searchModalService.setSearchResults( nextRes.items );
                        this.searchModalService.setSearchTotalRecords( nextRes.totalNumRecs );
                        this.facetsService.buildFacets( nextRes.facets );
                    },
                    ( err: any ) => {
                        this.isLoadingSearch.next( false );
                        this.searchModalService.setIsLoadingSearch( false )
                        this.userNotifier.alertError( 'Next pagination search failed...' )
                        console.log( { err } )
                    },
                    () => {
                        this.isLoadingSearch.next( false );
                        this.searchModalService.setIsLoadingSearch( false )
                        console.log( 'completed fetching next page....' );
                    }
                );
        } */

    /* LEGACY */
    /*    searchProductsByFacetId( facetSelection: any = {}, isChecked: boolean, filterName?: string, fromPage?: string ) {
   
           if ( !facetSelection ) {
               console.log( 'Please select a facet to search...' );
               return;
           }
   
           let facetsFilter;
   
           // IMPORTANT only one category facet can be provided for search
           if ( filterName === 'Categories' ) {  // REVIEW this.facetsService.updateFactesSelected( facetSelection );         
               facetsFilter = facetSelection.facetId;
           } else {
               // otherwise non-category filter
               facetSelection.facetCategoryName = ''
               this.facetsService.addFacetCrumb( facetSelection );
               // IMPORTANT only one category facet can be provided for search
               // menu hasChildren then call that facetsFilter only (remove other filters)
               const facetIds = this.facetsService.getSelectedFacets().map( ( m: any ) => {
                   return m.facetId;
               } );
               facetsFilter = facetIds.join( ',' );
               console.log( { facetIds }, { facetsFilter } );
           }
   
           // Remove Facet
           if ( !isChecked ) {
               this.facetsService.deleteFacetCrumb( facetSelection );
   
               // Search and remove facet
               this.performSearchWithFilters( facetsFilter );
               console.log( 'Removing facet...' );
               return;
           }
   
           // Search and add facet
           this.performSearchWithFilters( facetsFilter );
       } */

    // NEXTPAGE  // DEBOUNCE need to implement // unique to modal fromPage(location)
    public nextPage( filter = this.searchStr$.value, pageEvent: PageEvent ) {
        console.log( { pageEvent } );

        const categories = this.categoryFilters;

        let cateFilter = ''
        let matchMode = 'all';

        // Search with cateFilter if available
        if ( categories && categories.length > 0 ) {
            cateFilter = categories
            this.categoryFilters = categories;

            if ( categories[0] !== 'miscellaneous' ) {
                matchMode = 'any';
            }
        }

        this.pageEvent.next( pageEvent );
        this.searchModalService.setPagination( pageEvent )

        const accountId = this.accountInfo.lastSelectedAccount.accountLegacyId;
        console.log( { accountId } );

        if ( pageEvent.previousPageIndex &&
            pageEvent.previousPageIndex > pageEvent.pageIndex ) {

            // Clicked on prev button
            this.pageNo = pageEvent.previousPageIndex;
            this.searchModalService.setPageNo( this.pageNo - 1 )
        } else {
            // Clicked on next button      
            this.pageNo = pageEvent.pageIndex + 1;
            this.searchModalService.setPageNo( this.pageNo )
        }

        this.isLoadingSearch.next( true );
        this.searchModalService.setIsLoadingSearch( true );

        from( this.searchProducts( {
            accountId, filter, pageNo: this.pageNo, pageSize: this.pagination.value.pageSize,
            showHoverAttrs: false, showSkuList: true, hoverSearch: false, cateFilter, matchMode
        } ) )
            .pipe(
                debounceTime( 900 ),
                map( ( nextResults: any ) => {
                    return nextResults;
                } )
            ).subscribe(
                ( nextRes: any ) => {
                    console.log( { nextRes } );
                    this.searchModalService.setSearchResults( nextRes.items );
                    this.searchModalService.setSearchTotalRecords( nextRes.totalNumRecs );
                    this.facetsService.buildFacets( nextRes.facets );
                    this.isLoadingSearch.next( false );
                    this.searchModalService.setIsLoadingSearch( false );
                },
                ( err: any ) => {
                    this.isLoadingSearch.next( false );
                    this.searchModalService.setIsLoadingSearch( false )
                    this.userNotifier.alertError( 'Next pagination search failed...' )
                    console.log( { err } )
                },
                () => {
                    this.isLoadingSearch.next( false );
                    this.searchModalService.setIsLoadingSearch( false )
                    console.log( 'completed fetching next page....' );
                }
            );
    }
    resetPagination() {
        this.searchModalService.setPageNo( 1 );
        // this.pageNo.next( 1 );
        // this.pageSize.next( 20 );
        // this.paginator.firstPage();
        console.log( 'reseting paginator........' );
    }
    updatePaginator( pageEvent: PageEvent ) {
        console.log( { pageEvent } );
        // this.pageEvent.next( pageEvent );
    }
    setPagination( event: any ) { // REVIEW
        this.pagination.next( event );
    }

    setMessage( str: string ) {
        // this.message.next( str );
    }


    clearAllFacets() {
        this.searchModalService.resetEmptySearchResults();
        this.searchProductsByCateFilterAdd( {}, '' );
    }
}
export interface SKUAvailabilityResponse {
    success: boolean;
    result: SkuAvailabilityRecord[];
}

export interface SkuAvailabilityRecord {
    sku_id: string;
    div: string;
    reg: string;
    cmp: string;
    brn: string;
    isSKUAvailableAtBranch: string;
    isSKUAvailableAtRegion: string;
    market: string | null;
}

interface ProductAvailabilityResponse {
    success: boolean;
    result: ProductAvailabilityRecord[];
}

interface ProductAvailabilityRecord {
    sku_id: string;
    product_id: string;
    div: string;
    reg: string;
    cmp: string;
    brn: string;
    isSKUAvailableAtBranch: string;
    isSKUAvailableAtRegion: string;
}

interface SuggestiveSellingRequestInternal {
    account?: string;
    // brandName?: string;
    // templateId?: string;
    itemNumber: string;
    // excludeCategory?: string;
    // excludeBrand?: string;
    jobNumber?: string;
    pageSize: string;
    pageNo: string;
}

export interface SuggestiveSellingRequest {
    account?: string;
    // brandName?: string;
    // templateId?: string;
    itemNumber: string[];
    // excludeCategory?: string[];
    // excludeBrand?: string[];
    jobNumber?: number;
    pageSize: number;
    pageNo: number;
}

export interface SuggestiveSellingItem {
    productId: string;
    productName: string;
    productNameNotTruncate: string;
    pdpUrl: string;
    defaultItem: {
        itemNumber: string;
        unitOfMeasure: string;
        price: 0;
        vendorColorId: string;
        itemImage: string;
        itemOnErrorImage: string;
    };
}

export type SuggestiveSellingResponse = ApiResponse<SuggestiveSellingItem[]>;

interface PricingRequest {
    skuIds: string;
    accountId: string;
    jobNumber?: string;
}

export interface PricingResponse extends ApiResult {
    orderPricing: SkuPrices;
    priceInfo: SkuPrices;
    unavailableSkuList: string[];
}

export interface SkuPrices {
    [sku: string]: Record<string, number>;
}

export interface ProductDetailsResponse {
    product: Product;
    message?: string;
    specification: Record<string, string>;
    resource: Record<string, string>;
    currentSKU: Sku;
    skuList: Sku[];
    variations: Record<string, Record<string, string[]>>;
}

export interface Sku {
    auxiliaryImages?: AuxiliaryImage[];
    currentUOM: string;
    color?: string;
    itemImage?: string;
    itemNumber: string;
    heroImage?: string;
    hoverAttributes?: Record<string, string>;
    manufactureNumber: string;
    swatchImage?: string;
    thumbImage: string;
    skuShortDesc?: string;
    unitPrice: number;
    uomlist?: string[];
    productNumber: string;
    variations?: Record<string, string[]>;
    isAddedToFavorites?: boolean;
}

export interface AuxiliaryImage {
    image: string;
    videoUrl?: string;
}

export interface Product {
    productImage: string;
    productOnErrorImage: string;
    productAdditionalOnErrorImage: string;
    longDesc: string;
    manufactureNumber: string;
    categories: Category[];
    shortDesc: string;
    itemNumber: string;
    itemFromQuote: boolean;
    productName: string;
    productId: string;
    baseProductName: string;
    internalProductName: string;
    brand: string;
    url: string;
    relatedProducts: RelatedProduct[];
}

export interface Category {
    categoryName: string;
    categoryId: string;
    facetId: string;
}

export interface RelatedProduct {
    productImage: string;
    url: string;
    productName: string;
    productId: string;
    internalProductName: string;
    brand: string;
    categories: Category[];
}

interface TypeAheadReq {
    accountId: string;
    filter: string;
}
export interface TypeAheadResponse {
    success: boolean;
    messages: {
        code: number;
        type: string;
        value: string;
        key: string | null;
    }[];
    result: TypeAheadResult;
}

export interface TypeAheadResult {
    items: TypeAheadItem[];
    seeMoreLink: string;
}

export interface TypeAheadItem {
    baseProductName: string;
    searchTypeAheadLink: string;
}

interface ItemDetailRequest {
    productId: string;
    itemNumber: string | null;
    accountId?: string;
    jobNumber?: string;
    uom?: string;
    showHoverAttrs?: boolean;
}

export interface OrderAlert {
    orderNumber: string;
    alertType: string;
    phoneNumber: string;
    emailAddress: string;
    saveToProfile: boolean;
}

export interface ProductVariationRequest {
    productId: string;
    skuId: string;
    vendorColorId: string;
}

interface MultipleProductVariationResponse {
    result: ProductVariation[];
    code: unknown | null;
    success: boolean;
    messages: {
        code: number;
        type: string;
        value: string;
        key: string | null;
    }[] | null;
}

export interface ProductVariation {
    variationContentKeyMap: any;
    productMultiVariation: ProductMultiVariation | null;
    productId: string;
}

export interface ProductMultiVariation {
    allOptionsSingle: boolean;
    skus: Record<string, Record<string, string[]>>;
    defaultSkuId: string;
    currentVendorColorId: string | null;
    vendorColors: any[];
    variations: Record<string, Record<string, string[]>>;
    singleColorDisplay: string | null;
    currentVariations: any;
    currentSkuId: string;
    variationSteps: any;
}

export interface ProductVariationResponse {
    result: ProductVariation;
    code: unknown | null;
    success: boolean;
    messages: {
        code: number;
        type: string;
        value: string;
        key: string | null;
    }[] | null;
}
