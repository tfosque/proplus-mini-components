import { Injectable } from '@angular/core';

type TranslationObject = {
    [key: string]: string;
};

/**
 * Sets translation object and exposes data to be used in components/translations pipe.
 */
@Injectable({
    providedIn: 'root',
})
export class TranslationsService {
    translationsObject: TranslationObject | null = null; // {}

    constructor() {}

    /**
     * Takes in an array of values from the cms saves to the service as a more friendly object to be consumed by
     * components
     * @param cmsTranslationsArray Array from the cms to be converted to a more usable object.
     */
    initTranslationsObject(
        cmsTranslationsArray: {
            key: string;
            label: string;
        }[]
    ) {
        if (cmsTranslationsArray && cmsTranslationsArray.length) {
            const translationsObject: TranslationObject = {};

            cmsTranslationsArray.forEach((curVal) => {
                translationsObject[curVal.key] = curVal.label;
            });
            this.translationsObject = translationsObject;
        }
    }
}
