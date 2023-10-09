import { Component, OnInit } from '@angular/core';
import { ProductBrowseService } from '../../services/product-browse.service';
import { Observable } from 'rxjs';
import { Facet } from '../../global-classes/facet';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-selected-facets-container',
    templateUrl: './selected-facets-container.component.html',
    styleUrls: ['./selected-facets-container.component.scss'],
})
export class SelectedFacetsContainerComponent implements OnInit {
    selectedFacets$!: Observable<Facet[]>;

    constructor(private productBrowseService: ProductBrowseService) {}

    ngOnInit() {
        this.selectedFacets$ = this.productBrowseService.selectedFacets$.pipe(
            map<Facet[] | null, Facet[]>((facetArray) =>
                !facetArray
                    ? []
                    : facetArray.filter((facet) => facet.type !== 'cateFilter')
            )
        );
    }

    /**
     * On click of a selected facet anchor, removes the selected facet from the services
     * selected facet array.
     * @param facet facet to remove from selected facets.
     */
    removeSelectedFacet(facet: Facet) {
        this.productBrowseService.removeSelectedFacet(facet);
        this.productBrowseService.setProductList();
    }

    /**
     * Remove all selected facets.
     */
    removeAllFacets() {
        this.productBrowseService.clearSelectedFacets();
    }
}
