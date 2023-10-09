import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
    Router,
} from '@angular/router';
import { Observable } from 'rxjs';
/* import { skipWhile, switchMapTo, takeWhile, tap } from 'rxjs/operators';
import { PageService } from '../services/page.service'; */
import { ProductBrowseService } from '../services/product-browse.service';

@Injectable( {
    providedIn: 'root',
} )
export class ProductBrowseDataResolverService {
    isSearchPage = false;
    isPreview = false;
    pageTitle = '';
    isBrowser = false;

    constructor(
        private router: Router,
        // private pageService: PageService,
        private readonly productBrowseService: ProductBrowseService,
        @Inject( PLATFORM_ID ) platformId: string
    ) {
        this.isBrowser = isPlatformBrowser( platformId );
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Observable<never> {
        this.isSearchPage = state.url.includes( 'search' );

        /* return this.pageService.preload(state.url).pipe(
            tap((page) => {
                const facetSelectorComponent = page?.getComponent<any>(
                    'facets-selector',
                    'facets-selector'
                );

                this.pageService.forcePageLoading(true);
                this.pageTitle = page?.getTitle() || '';

                this.productBrowseServiceSetup(
                    facetSelectorComponent,
                    state,
                    route
                );
            }),
            switchMapTo(this.productBrowseService.isLoading$),
            skipWhile((isLoading) => isLoading),
            takeWhile((isLoading) => isLoading, true),
            tap(() => this.pageService.forcePageLoading(false))
        ); */
        return new Observable;
    }

    /**
     * Doing setup here because the resolver doesn't have a reference
     * of the loaded page before render
     */
    productBrowseServiceSetup(
        facetSelectorComponent: any,
        state: RouterStateSnapshot,
        route: ActivatedRouteSnapshot
    ) {
        /**
         * If the facets selector component exists on this page, inititialize the ProductBrowseService with the values pulled from that.
         * Otherwise initialize with defaults from this pages data.
         */
        if ( facetSelectorComponent && !this.isSearchPage ) {
            const {
                categoryFacet: cateFilter,
                showAllCategories,
                extraCategoryFacetId,
                otherFacets,
            } = facetSelectorComponent.model?.meta?.paramsInfo || {};

            if ( cateFilter && !showAllCategories ) {
                this.productBrowseService.permanentCateFilter = cateFilter;
            } else if ( !showAllCategories ) {
                this.productBrowseService.permanentCateFilter = this.pageTitle;
            } else {
                this.productBrowseService.permanentCateFilter = '';
            }
            if ( otherFacets ) {
                this.productBrowseService.setPermanentOtherFilters( otherFacets );
            } else {
                this.productBrowseService.setPermanentOtherFilters( '' );
            }
            if ( extraCategoryFacetId ) {
                this.productBrowseService.setPermanentExtraCateFilter(
                    extraCategoryFacetId
                );
            } else {
                this.productBrowseService.setPermanentExtraCateFilter( null );
            }
        } else if ( !this.isSearchPage ) {
            this.productBrowseService.permanentCateFilter = this.pageTitle;
            this.productBrowseService.setPermanentOtherFilters( '' );
            this.productBrowseService.setPermanentExtraCateFilter( null );
        }

        if ( !this.isSearchPage ) {
            // Clear the search term as this is not a search page.
            this.productBrowseService.searchTerm = '';
        } else {
            this.productBrowseService.setPermanentOtherFilters( '' );
            this.productBrowseService.setPermanentExtraCateFilter( null );
            this.productBrowseService.permanentCateFilter = '';
            this.productBrowseService.searchTerm =
                route.paramMap.get( 'searchTerm' );
        }

        if ( !this.isPreview || !this.isSearchPage ) {
            this.productBrowseService.initializeFromUrlParams(
                '',
                '',
                '',
                route
            );

            this.productBrowseService.setProductList(
                this.router.parseUrl( state.url )
            );
        }
    }
}
