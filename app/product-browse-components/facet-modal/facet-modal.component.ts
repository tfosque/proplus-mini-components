import { Component, OnInit } from '@angular/core';
import { ProductBrowseService } from '../../services/product-browse.service';
import { Observable } from 'rxjs';
import { ModalOverlayRef } from '../../global-classes/modal-overlay-ref';

@Component({
    selector: 'app-facet-modal',
    templateUrl: './facet-modal.component.html',
    styleUrls: ['./facet-modal.component.scss'],
})
export class FacetModalComponent implements OnInit {
    resultsCount$!: Observable<number | null>;

    constructor(
        private productBrowseService: ProductBrowseService,
        private modalOverlayRef: ModalOverlayRef
    ) {}

    ngOnInit() {
        this.resultsCount$ = this.productBrowseService.resultsCount$;
    }

    /**
     * Closes the modal overlay.
     */
    closeModal() {
        this.modalOverlayRef.close();
    }

    /**
     * Clear all selected facets in service.
     */
    clearFacets() {
        this.productBrowseService.clearSelectedFacets();
    }
}
