import { states } from './../../../../global-classes/states';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { State } from '../../shopping-cart/shopping-cart.component';
import {
    FormControl,
    Validators,
    FormGroupDirective,
    NgForm,
} from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched || isSubmitted)
        );
    }
}

@Component({
    selector: 'app-form-dialog',
    templateUrl: './form-dialog.component.html',
    styleUrls: ['./form-dialog.component.scss'],
})
export class FormDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

    get canSave(): boolean {
        if (!this.formInvalid && this.phoneLength && this.zipLength) {
            return false;
        } else {
            return true;
        }
    }

    get saveText(): string {
        return this.data.type === 'update' ? 'Update' : 'Create';
    }

    matcher = new MyErrorStateMatcher();
    requestObject = {
        nickname: '',
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
    };

    states: State[] = states;

    lastNameFormControl = new FormControl('', [Validators.required]);
    cityFormControl = new FormControl('', [Validators.required]);
    zipFormControl = new FormControl('', [Validators.required]);
    phoneFormControl = new FormControl('', [Validators.required]);
    addressFormControl = new FormControl('', [Validators.required]);
    stateFormControl = new FormControl('', [Validators.required]);

    get formInvalid() {
        if (
            this.requestObject.lastName &&
            this.requestObject.city &&
            this.requestObject.zip &&
            this.requestObject.phone &&
            this.requestObject.address1 &&
            this.requestObject.state
        ) {
            return false;
        } else {
            return true;
        }
    }
    get phoneLength() {
        if (this.requestObject.phone.length === 12) {
            return true;
        } else {
            return false;
        }
    }

    get zipLength() {
        if (
            (this.requestObject.zip.length === 10 &&
                this.requestObject.zip.match(/^[0-9-]*$/)) ||
            (this.requestObject.zip.length === 5 &&
                this.requestObject.zip.match(/^[0-9-]*$/))
        ) {
            return true;
        } else {
            return false;
        }
    }

    ngOnInit() {
        console.log(this.data);
        if (this.data != null) {
            this.requestObject.nickname = this.data.nickname;
            this.requestObject.firstName = this.data.firstName;
            this.requestObject.lastName = this.data.lastName;
            this.requestObject.address1 = this.data.address1;
            this.requestObject.address2 = this.data.address2;
            this.requestObject.city = this.data.city;
            this.requestObject.state = this.data.state;
            this.requestObject.zip = this.data.zip;
            this.requestObject.country = this.data.country;
            this.requestObject.phone = this.data.phone;
        }
    }

    addDash() {
        return (this.requestObject.phone = this.requestObject.phone.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }
    addDashZip() {
        return (this.requestObject.zip = this.requestObject.zip.replace(
            /^(\d{5})\-*(\d{4})$/,
            '$1-$2'
        ));
    }
}
