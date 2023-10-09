import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    Optional,
} from '@angular/core';
import { ProductBrowseService } from '../../services/product-browse.service';
import { FacetGroup } from '../../global-classes/facet-group';
import { Facet } from '../../global-classes/facet';
import { categoriesKey } from '../../app.constants';
import { BrBaseComponent } from '../../core/BrBaseComponent';
import { BrPageComponent } from '@bloomreach/ng-sdk';

@Component({
    selector: 'app-facet-group',
    templateUrl: './facet-group.component.html',
    styleUrls: ['./facet-group.component.scss'],
})
export class FacetGroupComponent extends BrBaseComponent implements OnInit {
    @Input() facetGroup!: FacetGroup;
    @Input() selectedFacets!: Facet[];
    @Input() pageTitle!: string;
    @Input() currentUrlPath?: string;
    @Output() isExpandedToggled: EventEmitter<boolean> = new EventEmitter();
    @Output() showAllToggled: EventEmitter<boolean> = new EventEmitter();

    // Variable used to determine expanded state in mobile view.
    @Input() isExpanded = false;

    // Handles show all/show less behavior
    @Input() showAll = false;

    // At what number of facets the search input should be displayed.
    readonly SEARCH_DISPLAY_THRESHOLD = 10;

    // Number of facets to be displayed on initial load.
    readonly INITIAL_DISPLAYED_FACETS = 6;

    // The facets that apply to this group.  Filtered from selectedFacets array.
    groupSelectedFacets?: Facet[];

    // The search string.  Only used if search input is displayed.
    query = '';

    constructor(
        private productBrowseService: ProductBrowseService,
        @Optional() page?: BrPageComponent
    ) {
        super(page);
    }

    ngOnInit() {
        super.ngOnInit();

        this.groupSelectedFacets = this.selectedFacets.filter((curFacet) => {
            return (
                curFacet.group !== categoriesKey &&
                curFacet.group === this.facetGroup.title
            );
        });
    }

    /**
     * On change of a facet updates the data in the product browse service with new facet
     * info
     * @param facet Facet object that has been selected or deselected
     */
    onFacetChange(facet: Facet) {
        facet.selected = !facet.selected;
        if (facet.selected) {
            this.productBrowseService.addSelectedFacet(facet);
        } else {
            this.productBrowseService.removeSelectedFacet(facet);
        }

        this.productBrowseService.setProductList();
    }

    /**
     * Takes in a facet and calls the productBrowseService to remove that facet.
     * @param facet facet to be removed.
     */
    removeFacet(facet: Facet) {
        this.productBrowseService.removeSelectedFacet(facet);
        this.productBrowseService.setProductList();
    }

    /**
     * Toggles the is expanded variable causing an expand/collapse in mobile modal.  Then fires event emitter
     * to give the parent component the new value.
     */
    toggleIsExpanded() {
        this.isExpanded = !this.isExpanded;
        this.isExpandedToggled.emit(this.isExpanded);
    }

    /**
     * Toggles the showAll variable causing all filters to be shown or all but the first five to be hidden.  Then fires event emitter
     * to give the parent component the new value.
     */
    toggleShowAll() {
        this.showAll = !this.showAll;
        this.showAllToggled.emit(this.showAll);
    }
}
