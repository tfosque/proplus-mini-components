import { Component, OnInit, Input } from '@angular/core';
import { ProductSpecifications } from '../../api-response-interfaces/product-specifications';

@Component({
    selector: 'app-product-specs',
    templateUrl: './product-specs.component.html',
    styleUrls: ['./product-specs.component.scss'],
})
export class ProductSpecsComponent implements OnInit {
    @Input() productItemNum!: string;
    @Input() productNum!: string;
    @Input() productManuNum!: string;
    @Input() productSpecifications!: ProductSpecifications;

    constructor() {}

    ngOnInit() {}
}
