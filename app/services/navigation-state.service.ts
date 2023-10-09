import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service used to control display state of navigation. Primarily used to display the overlay.
 */
@Injectable({
    providedIn: 'root',
})
export class NavigationStateService {
    private _overlayActive: Subject<boolean> = new Subject<boolean>();
    overlayActive$ = this._overlayActive.asObservable();

    constructor() {}

    setOverlayActive(newState: boolean) {
        this._overlayActive.next(newState);
    }
}
