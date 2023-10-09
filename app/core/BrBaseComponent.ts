import { Component, OnInit, Optional } from '@angular/core';
import { BrPageComponent } from '@bloomreach/ng-sdk';
import { ImageSet, Page, Reference } from '@bloomreach/spa-sdk';
import {
    getContent,
    getDocument,
    getPrimaryDocumentPageLink_v2,
} from '../misc-utils/utility-methods';

@Component({
    selector: 'br-base-content',
    template: `<p>
        br-base-content works! This template should never be displayed. Base
        content component is meant to be extended by other content components.
    </p> `,
})
export class BrBaseComponent implements OnInit {
    page?: Page;

    get isPreview() {
        return this.page?.isPreview();
    }

    constructor(@Optional() page?: BrPageComponent) {
        this.page = page?.state.getValue() || this.page;
    }

    ngOnInit() {}

    getImageUrl(image: Reference) {
        const imageSet = this.page?.getContent<ImageSet>(image);
        return imageSet?.getOriginal()?.getUrl() || '';
    }

    getContentViaReference(item: Reference) {
        const itemDocument = getDocument(this.page, item);
        return getContent(itemDocument);
    }

    getPrimaryDocumentPageLink(curUrl: string, primaryDocObj: any): string {
        return getPrimaryDocumentPageLink_v2(curUrl, primaryDocObj, this.page);
    }
}
