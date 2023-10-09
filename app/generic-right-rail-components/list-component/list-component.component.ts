import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

@Component({
    selector: 'app-list-component',
    templateUrl: './list-component.component.html',
    styleUrls: ['./list-component.component.scss'],
})
export class ListComponentComponent
    extends BrBaseContentComponent
    implements OnInit {
    heading?: string;
    listArray?: string[];

    constructor(
    ) {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.heading = this.content.heading;
            this.listArray = this.content.listArray;
        }
    }
}
