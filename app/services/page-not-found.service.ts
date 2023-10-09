import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Helper service used to determine if the page not found content should be displayed and also to retrieve the
 * page not found cotent.
 */
@Injectable({
    providedIn: 'root',
})
export class PageNotFoundService {
    private _isPageContentNotFound: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    isPageContentNotFound$ = this._isPageContentNotFound.asObservable();

    private _isPageProductNotFound: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    isPageProductNotFound$ = this._isPageProductNotFound.asObservable();

    constructor() {}

    /**
     * Set whether the CMS content service returned a 404 error.
     * @param newValue did the CMS content service return 404?
     */
    setIsPageContentNotFound(newValue: boolean) {
        this._isPageContentNotFound.next(newValue);
    }

    /**
     * Set whether the beacon product service returned no results.
     * @param newValue did the beacon product service return no results?
     */
    setIsPageProductNotFound(newValue: boolean) {
        this._isPageProductNotFound.next(newValue);
    }
}
