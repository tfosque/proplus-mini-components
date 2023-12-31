import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-product-description',
    templateUrl: './product-description.component.html',
    styleUrls: ['./product-description.component.scss'],
})
export class ProductDescriptionComponent implements OnInit {
    @Input() descriptionHTML!: string;

    constructor() {}

    ngOnInit() {}
}
