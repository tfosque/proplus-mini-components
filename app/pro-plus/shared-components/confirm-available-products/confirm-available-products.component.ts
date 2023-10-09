import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-available-products',
    templateUrl: './confirm-available-products.component.html',
    styleUrls: ['./confirm-available-products.component.scss'],
})
export class ConfirmAvailableProductsComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public config: ProductConfirmationConfig
    ) {}

    addToCart() {
        const availableItems = new Set(
            this.config.availableLineItems.map((i) => i.itemNumber)
        );
        this.config.whenUserSaysOk(availableItems);
    }
}

export interface ProductConfirmationConfig {
    unavailableLineItems: ConfirmationProduct[];
    availableLineItems: ConfirmationProduct[];
    unavailableSkuList: string[];
    cartOrTemplate: string;
    whenUserSaysOk(items: Set<string>): void;
}

export interface ConfirmationProduct {
    name: string;
    productId: string;
    itemNumber: string;
    prodUrl: string[];
    productImageUrl: string;
}
