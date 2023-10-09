import { states, State } from './../../../global-classes/states';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { GetCurrentUserInfoResponseV2 } from '../../model/get-current-user-response-v2';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
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
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
    userInfo: GetCurrentUserInfoResponseV2 | any = ' ';
    get emailId() {
        if (!this.userInfo.email) {
            return null;
        }
        return this.userInfo.email;
    }
    err: any;

    email = '';
    title = '';
    firstName = '';
    lastName = '';
    address1 = '';
    address2 = '';
    city = '';
    state: any;
    zipCode = '';
    country = '';
    contactPhoneNumber = '';
    officePhoneNumber = '';
    mobilePhoneNumber = '';
    emailOptIn = '';
    subscribeOrder!: boolean;
    subscribeQuote!: boolean;
    subscribeAccount!: boolean;
    success!: boolean;
    firstNameControl = new FormControl('', [Validators.required]);
    matcher = new MyErrorStateMatcher();
    states: State[] = states;

    addDash() {
        return (this.contactPhoneNumber = this.contactPhoneNumber.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }

    addDashOffice() {
        return (this.officePhoneNumber = this.officePhoneNumber.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }
    addDashMobile() {
        return (this.mobilePhoneNumber = this.mobilePhoneNumber.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }

    addDashZipcode() {
        return (this.zipCode = this.zipCode.replace(
            /^(\d{5})\-*(\d{4})$/,
            '$1-$2'
        ));
    }

    constructor(
        private _snackBar: MatSnackBar,
        public userService: UserService
    ) {}

    async ngOnInit() {
        this.userInfo = await this.userService.ensureCurrentUserInfo();
        this.fillData(this.userInfo);
        this.addDash();
        this.addDashOffice();
        this.addDashMobile();
        this.addDashZipcode();
    }

    get invalidForm() {
        if (!this.firstName) {
            return true;
        } else {
            return false;
        }
    }

    fillData(userInfo: GetCurrentUserInfoResponseV2) {
        if (!userInfo) {
            throw new Error('Failed to load user info');
        }
        const contactAddress =
            userInfo.contactAddress || ({} as Record<string, undefined>);
        const subscribeEmailType = userInfo.subscribeEmailType;
        this.title = userInfo.title || '';
        this.firstName = userInfo.firstName || '';
        this.lastName = userInfo.lastName || '';
        this.address1 = contactAddress.address1 || '';
        this.address2 = contactAddress.address2 || '';
        this.city = contactAddress.city || '';
        this.state = contactAddress.state || '';
        this.zipCode = contactAddress.postalCode || '';
        this.country = contactAddress.country || '';
        this.contactPhoneNumber = userInfo.contactPhoneNumber || '';
        this.officePhoneNumber = userInfo.officePhoneNumber || '';
        this.mobilePhoneNumber = userInfo.mobilePhoneNumber || '';
        this.subscribeOrder = subscribeEmailType.subscribeOrder || false;
        this.subscribeQuote = subscribeEmailType.subscribeQuote || false;
        this.subscribeAccount = subscribeEmailType.subscribeAccount || false;
    }

    async saveUserInfo() {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 10000;
        try {
            const userInfo = this.userInfo;
            if (userInfo === null) {
                throw new Error('Failed to save user.  It was never loaded');
            }
            const newInfo = {
                title: this.title,
                firstName: this.firstName,
                lastName: this.lastName,
                address1: this.address1,
                address2: this.address2,
                city: this.city,
                state: this.state,
                postalCode: this.zipCode,
                country: this.country,
                contactPhoneNumber: this.contactPhoneNumber.replace(
                    /[^0-9]/g,
                    ''
                ),
                officePhoneNumber: this.officePhoneNumber.replace(
                    /[^0-9]/g,
                    ''
                ),
                mobilePhoneNumber: this.mobilePhoneNumber.replace(
                    /[^0-9]/g,
                    ''
                ),
                subscribeOrder: this.subscribeOrder,
                subscribeQuote: this.subscribeQuote,
                subscribeAccount: this.subscribeAccount,
            };
            // const response = await this.userService.updateUserInfo(newInfo);
            const response = await this.userService.updateUserInfo(newInfo);
            if (response.success) {
                this._snackBar.open(`Profile Updated`, 'Close', config);
            }
            console.log('Save newInfo', response);
            this.success = true;
        } catch (error) {
            console.error(error);
        } finally {
        }
    }
}
