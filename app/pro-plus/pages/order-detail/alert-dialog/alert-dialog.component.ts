import { Component, OnInit, Inject } from '@angular/core';
import {
    Validators,
    FormControl,
    FormGroupDirective,
    NgForm,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { DeliveryStatusResponse } from '../../../model/delivery-tracking-status-response';
import { UserService } from '../../../services/user.service';

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
    selector: 'app-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnInit {
    phoneFormControl = new FormControl('', [
        // Validators.required,
        Validators.pattern(/^(\d{10})|(\d{3}-\d{3}-\d{4})$/),
        Validators.min(12),
    ]);
    emailFormControl = new FormControl('', [
        // Validators.required,
        Validators.email,
        Validators.pattern(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ),
    ]);
    alertSettings = {
        textAlert: false,
        emailAlert: false,
        phoneNumber: '',
        emailAddress: '',
        saveToProfile: false,
    };
    isExternalUser = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly userService: UserService
    ) {}
    get canSave() {
        if (
            this.isTextInvalid() ||
            this.isEmailInvalid() ||
            this.isSaveToProfileInvalid() ||
            (this.alertSettings.phoneNumber &&
                this.alertSettings.phoneNumber.length !== 12) ||
            (this.alertSettings.emailAddress &&
                !this.alertSettings.emailAddress.match(
                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                )) ||
            (this.alertSettings.phoneNumber &&
                !this.alertSettings.phoneNumber.match(
                    /^(\d{10})|(\d{3}-\d{3}-\d{4})$/
                ))
        ) {
            return false;
        } else {
            return true;
        }
    }
    matcher = new MyErrorStateMatcher();
    async ngOnInit() {
        const response: DeliveryStatusResponse = this.data.alert;
        if (response) {
            if (response.emailAddress) {
                this.alertSettings.emailAddress = response.emailAddress;
            }
            if (response.dtPhoneNumber) {
                this.alertSettings.phoneNumber = response.dtPhoneNumber.replace(
                    /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                    '$1-$2-$3'
                );
            }
            if (response.dtOrderStatusChangeNotification) {
                const alerts =
                    response.dtOrderStatusChangeNotification.notifications;
                if (
                    alerts.filter(
                        (a) =>
                            (a.value === 'sms' && a.selected) ||
                            (a.value === 'emailAndsms' && a.selected)
                    ).length > 0
                ) {
                    this.alertSettings.textAlert = true;
                }
                if (
                    alerts.filter(
                        (a) =>
                            (a.value === 'email' && a.selected) ||
                            (a.value === 'emailAndsms' && a.selected)
                    ).length > 0
                ) {
                    this.alertSettings.emailAlert = true;
                }
            }
        }
        this.isExternalUser = await this.userService.isExternalUser();
    }
    addDash() {
        return (this.alertSettings.phoneNumber = this.alertSettings.phoneNumber.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }

    isTextInvalid() {
        return !this.alertSettings.phoneNumber && this.alertSettings.textAlert;
    }

    isEmailInvalid() {
        return (
            !this.alertSettings.emailAddress && this.alertSettings.emailAlert
        );
    }

    isSaveToProfileInvalid() {
        return (
            this.alertSettings.saveToProfile &&
            !this.alertSettings.textAlert &&
            !this.alertSettings.emailAlert
        );
    }
}
