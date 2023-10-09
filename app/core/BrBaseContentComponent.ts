import { Component, Input, OnInit, Optional } from '@angular/core';
import { BrPageComponent } from '@bloomreach/ng-sdk';
import { Component as BrComponent, Document, Page } from '@bloomreach/spa-sdk';
import { DocumentData, DocumentModels } from '../../declarations';
import { getContent, getDocument } from '../misc-utils/utility-methods';
import { BrBaseComponent } from './BrBaseComponent';

@Component({
    selector: 'br-base-content',
    template: `<p>
        br-base-content works! This template should never be displayed. Base
        content component is meant to be extended by other content components.
    </p> `,
})
export class BrBaseContentComponent extends BrBaseComponent implements OnInit {
    @Input() component?: BrComponent;
    @Input() page?: Page;

    constructor(@Optional() page?: BrPageComponent) {
        super(page);
    }

    ngOnInit() {}

    get isPreview() {
        return this.page?.isPreview();
    }

    get document(): Document | undefined {
        if (this.page && this.component) {
            const { document = { $ref: '' } } =
                this.component.getModels<DocumentModels>();
            return getDocument(this.page, document);
        } else {
            return;
        }
    }

    get content(): DocumentData | undefined {
        return getContent(this.document);
    }

    get configuration() {
        return this.component?.getModels();
    }
}
