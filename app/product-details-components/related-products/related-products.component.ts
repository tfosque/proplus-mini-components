import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../../global-classes/image';

@Component({
    selector: 'app-related-products',
    templateUrl: './related-products.component.html',
    styleUrls: ['./related-products.component.scss'],
})
export class RelatedProductsComponent implements OnInit {
    @Input() relatedProducts: any;
    readonly INITIAL_PRODUCTS = 8;
    productImage!: Image;
    showAll = false;

    constructor() {}

    ngOnInit() {}

    getProductImage(imageSrc: string, altText: string): Image {
        return new Image(imageSrc, altText, true);
    }

    toggleShowAll() {
        this.showAll = !this.showAll;
    }

    getCategoryName(prod: any) {
        if (prod.categories && prod.categories.length > 0) {
         return prod.categories[0].categoryName;
        } else {
            return '';
        }
    }
}
