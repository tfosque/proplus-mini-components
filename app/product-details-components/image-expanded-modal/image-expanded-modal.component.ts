import { Component, OnInit, Inject } from '@angular/core';
import { MODAL_OVERLAY_DATA } from '../../misc-utils/modal-overlay.tokens';
import { ModalOverlayRef } from '../../global-classes/modal-overlay-ref';

@Component({
    selector: 'app-image-expanded-modal',
    templateUrl: './image-expanded-modal.component.html',
    styleUrls: ['./image-expanded-modal.component.scss'],
})
export class ImageExpandedModalComponent implements OnInit {
    constructor(
        private modalOverlayRef: ModalOverlayRef,
        @Inject(MODAL_OVERLAY_DATA) public data: any
    ) {}

    ngOnInit() {}

    closeModal() {
        this.modalOverlayRef.close();
    }
}
