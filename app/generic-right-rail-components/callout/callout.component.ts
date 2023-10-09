import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';
import { Image } from '../../global-classes/image';

@Component({
    selector: 'app-callout',
    templateUrl: './callout.component.html',
    styleUrls: ['./callout.component.scss'],
})
export class CalloutComponent extends BrBaseContentComponent implements OnInit {
    heading!: string;
    image!: Image;
    textContent!: string;
    link!: string;
    linkText!: string;
    linkIsExternal!: boolean;

    constructor() {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.heading = this.content.heading;
            const imageSrc = this.getImageUrl(this.content.image);
            if (this.content.image) {
                this.image =
                    this.content.image && imageSrc
                        ? new Image(imageSrc, this.content.heading, false)
                        : null as any;
            }
            this.textContent = this.content.textContent;

            this.link = this.getPrimaryDocumentPageLink(
                this.content.link.url,
                this.content.link.primaryDocument
            );

            this.linkText = this.content.link.text;
            this.linkIsExternal = this.content.link.isExternal;
        }
    }
}
