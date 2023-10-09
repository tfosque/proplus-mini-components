import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Handles user interactions with modal object.
 */
export class ModalOverlayRef {
    constructor(private overlayRef: OverlayRef) {}

    close(): void {
        this.overlayRef.dispose();
    }
}
