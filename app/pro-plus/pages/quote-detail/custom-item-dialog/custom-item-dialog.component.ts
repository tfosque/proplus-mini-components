import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-custom-item-dialog',
    templateUrl: './custom-item-dialog.component.html',
    styleUrls: ['./custom-item-dialog.component.scss'],
})
export class CustomItemDialogComponent implements OnInit {
    itemObject = {
        displayName: '',
        quantity: 1,
        unitPrice: 0,
        itemNumber: '0',
        productNumber: '0',
        itemType: 'E',
        unitOfMeasure: 'EA',
    };
    constructor() {}

    get itemNameEmpty() {
        if (this.itemObject.displayName.length === 0) {
            return true;
        }
        return false;
    }
    ngOnInit() {}
}
