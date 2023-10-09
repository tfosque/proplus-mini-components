import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

@Component({
    selector: 'app-information',
    templateUrl: './information.component.html',
    styleUrls: ['./information.component.scss'],
})
export class InformationComponent
    extends BrBaseContentComponent
    implements OnInit {
    heading!: string;
    textContent: string = '';
    linkListArray!: {
        text: string;
        url: string;
        primaryDocument: any;
        isExternal: boolean;
    }[];

    constructor(
    ) {
        super();
    }

    ngOnInit() {

        if (this.content) {
            this.heading = this.content.heading;
            this.textContent = this.content.content.toString();
            this.linkListArray = this.content.linkListArray.map(
                (curLink: any) => {
                    const newLink = curLink;
                    newLink.url = this.getPrimaryDocumentPageLink(
                        newLink.url,
                        newLink.primaryDocument
                    );
                    return newLink;
                }
            );
        }
    }
}
