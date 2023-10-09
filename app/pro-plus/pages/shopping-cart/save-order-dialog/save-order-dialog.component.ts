import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-save-order-dialog',
    templateUrl: './save-order-dialog.component.html',
    styleUrls: ['./save-order-dialog.component.scss'],
})
export class SaveOrderDialogComponent implements OnInit {
    fromSavedOrder = false;
    orderName = '';
    currentStep = 1;
    emptyCartOrContinue = '';
    constructor(
        @Inject(MAT_DIALOG_DATA) public data?: SaveOrderDialog
    ) {}

    get orderEmpty() {
        if (this.orderName.length === 0) {
            return true;
        }
        return false;
    }
    ngOnInit() {
        if (this.data) {
            this.fromSavedOrder = this.data.fromSavedOrder;
        }
    }

    saveAndEmptyCart() {
        this.emptyCartOrContinue = 'emptyCart';
        this.currentStep = 2;
    }

    saveAndContinue() {
        this.emptyCartOrContinue = 'continue';
        this.currentStep = 2;
    }

    continueEmptyCart() {
        this.currentStep = 3;
    }

    cancelEmptyCart() {
        this.emptyCartOrContinue = '';
        this.currentStep = 1;
    }
}

interface SaveOrderDialog {
    fromSavedOrder: boolean;
}
