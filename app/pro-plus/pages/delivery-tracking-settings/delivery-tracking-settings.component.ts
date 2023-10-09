import { Component, OnInit } from '@angular/core';
import {
    DeliveryStatusResponse,
    DtStatusChangeNotification,
    Notification,
} from '../../model/delivery-tracking-status-response';
import { DeliveryTrackingService } from '../../services/delivery-tracking.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import {
    FormControl,
    Validators,
    FormGroupDirective,
    NgForm,
    FormGroup,
} from '@angular/forms';
import { Location } from '@angular/common';

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
    selector: 'app-delivery-tracking-settings',
    templateUrl: './delivery-tracking-settings.component.html',
    styleUrls: ['./delivery-tracking-settings.component.scss'],
})
export class DeliveryTrackingSettingsComponent implements OnInit {
    displayedColumns = ['status', 'orders', 'allOrders'];
    data = [
        { status: 'Requested', orders: '', allOrders: '' },
        { status: 'Scheduled', orders: '', allOrders: '' },
        { status: 'Delivered', orders: '', allOrders: '' },
    ];

    isLoading = true;
    dataSource = this.data;
    applyAllOrders = false;
    applyMyOrders = false;
    phoneNumber = '';
    matcher = new MyErrorStateMatcher();
    request: SettingsRequest = {
        dtPhoneNumber: '',
        dtEmailAddress: '',
        dtAdminStatusChangeNotification: {
            delivered: '',
            requested: '',
            scheduled: '',
        },
        dtStatusChangeNotification: {
            delivered: '',
            requested: '',
            scheduled: '',
        },
    };
    response: DeliveryStatusResponse = {
        callbackParam: '',
        code: 0,
        message: '',
        messageCode: 0,
        result: '',
        emailAddress: '',
        dtPhoneNumber: '',
        dtStatusChangeNotification: [
            {
                displayName: '',
                label: '',
                notifications: [
                    {
                        displayName: '',
                        value: '',
                        selected: false,
                    },
                ],
            },
        ],
        dtAdminStatusChangeNotification: [
            {
                displayName: '',
                label: '',
                notifications: [
                    {
                        displayName: '',
                        value: '',
                        selected: false,
                    },
                ],
            },
        ],
    };

    formDTSettings!: FormGroup;
    isExternalUser = false;
    emailAddressFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);
    internalEmailAddressFormControl = new FormControl('', [Validators.email]);
    phoneFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^(\d{10})|(\d{3}-\d{3}-\d{4})$/),
        Validators.minLength(10),
    ]);
    internalPhoneFormControl = new FormControl('', [
        Validators.pattern(/^(\d{10})|(\d{3}-\d{3}-\d{4})$/),
        Validators.minLength(10),
    ]);

    get phoneLength() {
        if (this.request.dtPhoneNumber) {
            if (
                this.request.dtPhoneNumber.length === 12 &&
                this.request.dtPhoneNumber.match(/^[0-9-]*$/)
            ) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly deliveryService: DeliveryTrackingService,
        private readonly _location: Location,
        private readonly userService: UserService,
        private readonly _snackBar: MatSnackBar
    ) {}

    get deliveryOptions() {
        return {
            dtStatusChangeNotifacation: formatMyOrder(
                this.response.dtStatusChangeNotification
            ),
            dtAdminStatusChangeNotifacaton: formatMyOrder(
                this.response.dtAdminStatusChangeNotification || []
            ),
        };

        function formatMyOrder(myOrder: DtStatusChangeNotification[]) {
            return myOrder.map(({ displayName, notifications }) => {
                const selectedValues = notifications
                    .filter((n) => n.selected)
                    .map((n) => n.value);
                const selectedValue = selectedValues ? selectedValues[0] : null;
                return {
                    displayName,
                    selectedValue,
                    notifications,
                };
            });
        }
    }
    async ngOnInit() {
        try {
            this.response = await this.deliveryService.getStatusChange();
            // console.log(this.response);
            const myOrder: NotificationInfo[] =
                this.deliveryOptions.dtStatusChangeNotifacation;
            const allOrder: NotificationInfo[] =
                this.deliveryOptions.dtAdminStatusChangeNotifacaton;
            console.log(this.response);
            console.log(myOrder, allOrder);
            if (this.response && this.response.emailAddress) {
                if (this.response && this.response.dtPhoneNumber) {
                    this.phoneNumber = this.response.dtPhoneNumber.replace(
                        /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                        '$1-$2-$3'
                    );
                }
                this.request = {
                    dtEmailAddress: this.response.emailAddress,
                    dtPhoneNumber: this.phoneNumber,
                    dtAdminStatusChangeNotification: {
                        requested:
                            this.getValue('Requested', allOrder) || 'none',
                        scheduled:
                            this.getValue('Scheduled', allOrder) || 'none',
                        delivered:
                            this.getValue('Delivered', allOrder) || 'none',
                    },
                    dtStatusChangeNotification: {
                        requested:
                            this.getValue('Requested', myOrder) || 'none',
                        scheduled:
                            this.getValue('Scheduled', myOrder) || 'none',
                        delivered:
                            this.getValue('Delivered', myOrder) || 'none',
                    },
                };
            }
            this.request.dtPhoneNumber = this.addDash();
            this.isExternalUser = await this.userService.isExternalUser();
            if (!this.isExternalUser) {
                const myOrderStatus = this.response.dtStatusChangeNotification;
                const allOrderStatus = this.response.dtAdminStatusChangeNotification;
                if (myOrderStatus) {
                    this.response.dtStatusChangeNotification =
                        myOrderStatus.map((o) => {
                            return {
                                displayName: o.displayName,
                                notifications: o.notifications.filter(
                                    (n) =>
                                        n.value != 'sms' &&
                                        n.value != 'emailAndsms'
                                ),
                                label: o.label,
                            };
                        });
                }
                if (allOrderStatus) {
                    this.response.dtAdminStatusChangeNotification =
                    allOrderStatus.map((o) => {
                            return {
                                displayName: o.displayName,
                                notifications: o.notifications.filter(
                                    (n) =>
                                        n.value != 'sms' &&
                                        n.value != 'emailAndsms'
                                ),
                                label: o.label,
                            };
                        });
                }
                console.log('response: ', this.response);
            }

            if (this.isExternalUser == false) {
                this.formDTSettings = new FormGroup({});
            } else {
                this.formDTSettings = new FormGroup({
                    emailAddressFormControl: this.emailAddressFormControl,
                    phoneFormControl: this.phoneFormControl,
                });
            }
        } finally {
            this.isLoading = false;
        }
    }

    getValue(status: string, options: NotificationInfo[]) {
        for (const i of options) {
            if (i.displayName === status) {
                return i.selectedValue;
            }
        }
        return 'none';
    }

    goBack() {
        this._location.back();
    }
    addDash() {
        return (this.request.dtPhoneNumber = this.request.dtPhoneNumber.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }

    async saveChanges() {
        try {
            if (this.formDTSettings.valid) {
                this.isLoading = true;
                const config = new MatSnackBarConfig();
                config.verticalPosition = 'top';
                config.duration = 10000;
                this.request.dtPhoneNumber = this.request.dtPhoneNumber.replace(
                    /[^0-9]/g,
                    ''
                );
                const result =
                    await this.deliveryService.updateDeliveryTrackingSettings(
                        this.request
                    );
                if (result.messageCode === 200) {
                    this._snackBar.open('Changes saved', 'Close', config);
                }

                this.request.dtPhoneNumber = this.request.dtPhoneNumber.replace(
                    /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                    '$1-$2-$3'
                );
            } else {
                Object.keys(this.formDTSettings.controls).forEach((key) =>
                    this.formDTSettings.controls[key].markAsTouched()
                );
            }
        } finally {
            this.isLoading = false;
        }
    }

    allMyOrders() {
        this.request.dtStatusChangeNotification.delivered =
            this.request.dtStatusChangeNotification.requested;
        this.request.dtStatusChangeNotification.scheduled =
            this.request.dtStatusChangeNotification.requested;
    }
    allOrders() {
        this.request.dtAdminStatusChangeNotification.delivered =
            this.request.dtAdminStatusChangeNotification.requested;
        this.request.dtAdminStatusChangeNotification.scheduled =
            this.request.dtAdminStatusChangeNotification.requested;
    }
}

interface NotificationInfo {
    displayName: string;
    selectedValue: string | null;
    notifications: Notification[];
}

export interface SettingsRequest {
    dtEmailAddress: string;
    dtPhoneNumber: string;
    dtStatusChangeNotification: {
        requested: string;
        scheduled: string;
        delivered: string;
    };
    dtAdminStatusChangeNotification: {
        requested: string;
        scheduled: string;
        delivered: string;
    };
}
