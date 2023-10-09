import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

@Component({
    selector: 'app-single-row-bulleted-list',
    templateUrl: './single-row-bulleted-list.component.html',
    styleUrls: ['./single-row-bulleted-list.component.scss'],
})
export class SingleRowBulletedListComponent
    extends BrBaseContentComponent
    implements OnInit {
    heading?: string;
    buttonLink?: string;
    buttonText?: string;
    buttonIsExternal?: boolean;
    listArray?: string[];

    constructor(
    ) {
        super();
    }

    ngOnInit() {
        if (this.content) {
            console.log(this.listArray);
            this.heading = this.content.heading;
            this.buttonText = this.content.link.text;
            this.buttonLink = this.getPrimaryDocumentPageLink(
                this.content.link.url,
                this.content.link.primaryDocument,
            );
            this.buttonIsExternal = this.content.link.isExternal;
            this.listArray = this.content.listArray;
        }
    }
}
