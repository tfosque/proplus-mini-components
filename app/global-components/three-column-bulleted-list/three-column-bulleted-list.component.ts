import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

@Component({
    selector: 'app-three-column-bulleted-list',
    templateUrl: './three-column-bulleted-list.component.html',
    styleUrls: ['./three-column-bulleted-list.component.scss'],
})
export class ThreeColumnBulletedListComponent
    extends BrBaseContentComponent
    implements OnInit {
    heading?: string;
    listHeading1?: string;
    listHeading2?: string;
    listHeading3?: string;
    listArray1?: string[];
    listArray2?: string[];
    listArray3?: string[];

    constructor() {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.heading = this.content.heading;
            this.listHeading1 = this.content.listHeading1;
            this.listHeading2 = this.content.listHeading2;
            this.listHeading3 = this.content.listHeading3;
            this.listArray1 = this.content.listArray1;
            this.listArray2 = this.content.listArray2;
            this.listArray3 = this.content.listArray3;
        }
    }
}
