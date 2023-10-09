import { Component, OnInit, Input, Optional, Inject } from '@angular/core';
import { ProductBrowseService } from '../../services/product-browse.service';
import { Observable } from 'rxjs';
import { FacetGroup } from '../../global-classes/facet-group';
import { Facet } from '../../global-classes/facet';
import { MODAL_OVERLAY_DATA } from '../../misc-utils/modal-overlay.tokens';
import { categoriesKey } from '../../app.constants';
import { UserService } from '../../pro-plus/services/user.service';
import { ActivatedRoute } from '@angular/router';

interface ObjectMap {
    [key: string]: boolean;
}

@Component( {
    selector: 'app-facet-container',
    templateUrl: './facet-container.component.html',
    styleUrls: ['./facet-container.component.scss'],
} )
export class FacetContainerComponent implements OnInit {
    @Input() pageTitle!: string;
    facetGroups$!: Observable<FacetGroup[] | null>;
    selectedFacets$!: Observable<Facet[] | null>;
    currentUrlPath?: string;
    checkbox = 0;

    /**
     * These variables are passed in to the appropriate facet groups so that they are not reset
     * when the facet group components are destroyed
     */
    isFacetGroupExpandedArray: ObjectMap = {};
    isFacetGroupShowAllArray: ObjectMap = {};

    constructor(
        public readonly userService: UserService,
        private readonly productBrowseService: ProductBrowseService,
        private route: ActivatedRoute,

        @Optional()
        @Inject( MODAL_OVERLAY_DATA )
        public data: any
    ) { }

    ngOnInit() {
        this.checkQueries();
        if ( this.data ) {
            this.pageTitle = this.data.pageTitle;
            this.currentUrlPath = this.data.currentUrlPath;
        }
        this.facetGroups$ = this.productBrowseService.facetGroups$;
        this.selectedFacets$ = this.productBrowseService.selectedFacets$;
    }

    public get recentlyPurchased() {
        return this.productBrowseService.frequentlyPurchased;
    }
    public set recentlyPurchased( newValue ) {
        this.productBrowseService.frequentlyPurchased = newValue;
        this.checkQueries();
    }
    public get showForAll() {
        return this.productBrowseService.showForAll;
    }
    public set showForAll( newValue ) {
        this.productBrowseService.showForAll = newValue;
    }

    updateIsExpanded( newIsExpanded: boolean, facetGroup: FacetGroup ) {
        this.isFacetGroupExpandedArray[facetGroup.title] = newIsExpanded;
    }

    updateShowAll( newShowAll: boolean, facetGroup: FacetGroup ) {
        this.isFacetGroupShowAllArray[facetGroup.title] = newShowAll;
    }

    hasFacets( curFacetGroup: FacetGroup ): boolean {
        return (
            curFacetGroup.title !== categoriesKey ||
            curFacetGroup.facets.some(
                ( facet ) =>
                    !facet.permanent && !facet.isParentFacet && !facet.selected
            )
        );
    }

    checkQueries() {
        if (this.route.snapshot.queryParams['frequentlyPurchased'] && this.checkbox<=0) {
            this.productBrowseService.frequentlyPurchased = true;
            this.checkbox++;
        }
    }
}
