import { AppError } from './../../../common-components/classes/app-error';
import { states } from './../../../global-classes/states';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { CurrencyPipe } from '@angular/common';
import { UserService } from '../../services/user.service';
import { CurrentUser } from '../../model/get-current-user-response';
import { AccountsResponse } from '../../model/accounts-response';
import { AccountDetails } from '../../model/account-with-branch';
import { AddressBook } from '../../model/address-book-response';
import { JobsResponse } from '../../model/jobs-response';
import { Job, noJob } from '../../model/job';
import { FormControl, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TemplatesService } from '../../services/templates.service';
import {
    ShoppingCartService,
    CartItemV2,
} from '../../services/shopping-cart-service';
import { CartStore } from '../../services/Cart';
import { ApiError } from '../../services/api-error';
import { AttributeValues } from '../../model/attribute-values';
import moment from 'moment';
import { LocationsService } from '../../../services/locations.service';
import {
    LocationPicker,
    LocationMarker,
} from '../shopping-cart/location-picker';
import { Branch } from '../../model/branch';
import { SuggestiveSellingResponse } from '../../services/products.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { MyErrorStateMatcher } from '../shopping-cart/MyErrorStateMatcher';
import { UserNotifierService } from '../../../common-components/services/user-notifier.service';
import {
    Record,
    String,
    Static,
    Number,
    Array,
    Undefined,
    Boolean,
    Literal,
} from 'runtypes';

export const standardPickupHours = [
    { key: 8, value: '8 am' },
    { key: 9, value: '9 am' },
    { key: 10, value: '10 am' },
    { key: 11, value: '11 am' },
    { key: 12, value: '12 pm' },
    { key: 13, value: '1 pm' },
    { key: 14, value: '2 pm' },
    { key: 15, value: '3 pm' },
    { key: 16, value: '4 pm' },
];

export const Address = Record({
    address1: String.withConstraint(
        (a) => a.length > 2 || 'Length must be greater than 2 characters'
    ),
    address2: String,
    city: String.withConstraint((a) => a.length > 2),
    postalCode: String.withConstraint((a) => a.length === 5 || a.length === 10),
    state: String.withConstraint((a) => a.length === 5 || a.length === 10),
});
export type Address = Static<typeof Address>;

export const LineItem = Record({
    itemNumber: String,
    quantity: Number,
    unitOfMeasure: String,
    description: String,
});
export type LineItem = Static<typeof LineItem>;

export const ShippingMethod = Literal('O').Or(Literal('P'));
export type ShippingMethod = Static<typeof ShippingMethod>;

export const ShippingInfo = Record({
    shippingMethod: ShippingMethod,
    shippingBranch: String,
    address: Address,
}).withConstraint((si) => {
    if (si.shippingMethod === 'O' && !si.address) {
        return 'Orders require a shipping address';
    }
    return true;
});

export type ShippingInfo = Static<typeof ShippingInfo>;

export const JobInfo = Record({
    jobName: String,
    jobNumber: String,
});
export type JobInfo = Static<typeof JobInfo>;

export const PlaceOrderBase = Record({
    accountId: String,
    job: JobInfo,
    purchaseOrderNo: String,
    orderStatusCode: String,
    apiSiteId: String,
    lineItems: Array(LineItem),
    shipping: ShippingInfo,
    sellingBranch: String,
    specialInstruction: String,
    checkForAvailability: String,
})
    .And(
        //  If we're not on hold, we need a pickupDate and time
        Record({
            onHold: Boolean,
            pickupDate: String.Or(Undefined),
            pickupTime: String.Or(Undefined),
        })
    )
    .withConstraint((o) => {
        return true;
    });

export type PlaceOrderBase = Static<typeof PlaceOrderBase>;

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
    @ViewChild('tabGroup') tabGroup?: MatTabGroup;
    @Input() checked = true;
    loading = true;
    successMsg = false;
    _DeliveryMethod = false;
    matcher = new MyErrorStateMatcher();
    DeliveryOpt = true;
    saveAddress = false;
    time = '';
    private _date: Date | null = null;
    availablePickupTimes: Time[] = [];
    mapInfo: LocationPicker;
    timeZoneOffset = 0;
    public suggestedProducts!: Observable<SuggestiveSellingResponse>;
    poRequired = false;
    isJobAccountRequired = false;
    cart: CartStore;
    displayedColumns2 = ['product', 'details', 'price', 'qty', 'total'];
    currentUser!: CurrentUser;
    accounts!: Promise<AccountsResponse | null>;
    activeAccount!: AccountDetails;
    get accountId() {
        if (this.userService.accountIdInString) {
            return this.userService.accountIdInString;
        } else {
            return null;
        }
    }
    saveOrderName = '';
    states: State[] = states;
    addressBooks$ = new BehaviorSubject<AddressBook[]>([]);
    addressBook: AddressBook = {
        accountLegacyId: '',
        accountName: '',
        addressBookId: '',
        addressBookInfo: {
            nickName: '',
            firstName: '',
            lastName: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            stateValue: '',
            postalCode: '',
            country: '',
            countryValue: '',
            phoneNumber: '',
        },
    };
    changeLocation = false;
    pickupBranch: Branch = {};
    distanceOptions = [
        { text: '5 Miles', value: 5 },
        { text: '10 Miles', value: 10 },
        { text: '25 Miles', value: 25 },
        { text: '50 Miles', value: 50 },
        { text: '100 Miles', value: 100 },
    ];
    private _job: Job = noJob;
    //  TODO - We need to populate the list based on whether the user has a job or not
    jobInfo!: Promise<JobsResponse>;
    PO = '';
    orderNotes = '';
    public readonly currentDate = new Date();
    public readonly minDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate()
    );
    public readonly maxDate = new Date(
        this.currentDate.getFullYear() + 1,
        this.currentDate.getMonth(),
        this.currentDate.getDate()
    );
    dateAndTimeFormControl = new FormControl('', [Validators.required]);
    timeFormControl = new FormControl('', [Validators.required]);
    lastNameFormControl = new FormControl('', [Validators.required]);
    cityFormControl = new FormControl('', [Validators.required]);
    zipFormControl = new FormControl('', [Validators.required]);
    phoneFormControl = new FormControl('', [Validators.required]);
    addressFormControl = new FormControl('', [Validators.required]);
    stateFormControl = new FormControl('', [Validators.required]);
    jobFormControl = new FormControl('', [Validators.required]);
    //  TODO:  Let's rename this
    words2: { value: string }[] = [];
    firstFormGroup!: FormGroup;
    selectedJobName = 'Select Job Account';
    atgOrderId = '';
    locationValidMsg = '';

    get DeliveryMethod() {
        return this._DeliveryMethod;
    }
    set DeliveryMethod(newValue: boolean) {
        this.date = null;
        this._DeliveryMethod = newValue;
    }

    get job() {
        return this._job;
    }

    set job(newJob: Job) {
        // tslint:disable-next-line: no-floating-promises
        this.selectJob(newJob);
    }

    get isValidDate() {
        return this.date && this.date < this.minDate;
    }
    get date() {
        return this._date;
    }
    set date(newDate: Date | null) {
        this._date = newDate;
        this.availablePickupTimes = this.getAvailablePickupTimes();
        this.time = '';
        this.timeFormControl.setValue('');
    }

    get getTimesAvailable() {
        this.availablePickupTimes = this.getAvailablePickupTimes();
        return this.availablePickupTimes;
    }
    get shippingAddressEntered() {
        if (
            this.addressBook.addressBookInfo.address1 &&
            this.addressBook.addressBookInfo.city &&
            this.addressBook.addressBookInfo.lastName &&
            this.addressBook.addressBookInfo.state &&
            this.addressBook.addressBookInfo.postalCode &&
            this.addressBook.addressBookInfo.phoneNumber
        ) {
            return true;
        } else {
            return false;
        }
    }

    getAvailablePickupTimes() {
        const nowDate = new Date();
        if (this.date && !this.DeliveryMethod) {
            const now = this.currentDate;
            const offsetInMinutes = Math.round(this.timeZoneOffset / 60);
            const minimumHour = moment(now).utcOffset(offsetInMinutes).hour();
            const dateDiffms = this.date.getTime() - now.getTime();
            const maxFutureDays = 3;
            const msInADay = 1000 * 60 * 60 * 24;
            const dateDiff = dateDiffms / msInADay;

            if (dateDiff <= maxFutureDays) {
                if (
                    this.date.setHours(0, 0, 0, 0) !==
                        nowDate.setHours(0, 0, 0, 0) &&
                    !this.DeliveryMethod
                ) {
                    return standardPickupHours;
                }
                return standardPickupHours.filter(
                    (h) => h.key >= minimumHour + 2
                );
            }
        }
        return [
            { key: 'anytime', value: 'Anytime' },
            { key: 'afternoon', value: 'Afternoon' },
            { key: 'specialReuqest', value: 'Special Request' },
            { key: 'morning', value: 'Morning' },
        ];
    }
    get dateAndDate() {
        if (this.date && this.time) {
            return true;
        } else {
            return false;
        }
    }
    get jobsSelected() {
        if (this.job) {
            return true;
        } else {
            return false;
        }
    }
    get subTotal() {
        return this.cart.value.subTotal;
    }

    get tax() {
        const summary = this.cart.value.summary;
        if (summary) {
            return {
                value: this.currencyPipe.transform(summary.tax, 'USD'),
                cssClass: 'summary-text-right-default-number',
            };
        } else {
            return {
                value: 'Tax calculated at invoicing',
                cssClass: 'summary-text-right-default',
            };
        }
    }

    get otherCharges() {
        const summary = this.cart.value.summary;
        if (summary && !summary.displayOtherChargeTBD) {
            return {
                value: this.currencyPipe.transform(summary.otherChanges, 'USD'),
                cssClass: 'summary-text-right-default-number',
            };
        } else {
            return {
                value: 'Pending',
                cssClass: 'summary-text-right-default',
            };
        }
    }

    get total() {
        const summary = this.cart.value.summary;
        if (summary) {
            if (summary.totalMsg) {
                return {
                    value: summary.totalMsg,
                    cssClass: 'summary-text-total-default-right',
                };
            } else if (summary.total && !summary.displayOtherChargeTBD) {
                return {
                    value: this.currencyPipe.transform(summary.total, 'USD'),
                    cssClass: 'summary-text-total-default-right-number',
                };
            }
        }
        return {
            value: 'Will be calculated at the time of invoicing.',
            cssClass: 'summary-text-total-default-right',
        };
    }

    constructor(
        public templateService: TemplatesService,
        public deleteItemDialog: MatDialog,
        public saveOrderDialog: MatDialog,
        public newTemplateDialog: MatDialog,
        private readonly router: Router,
        // private readonly _formBuilder: FormBuilder,
        private readonly userService: UserService,
        private readonly cartService: ShoppingCartService,
        private readonly locationsService: LocationsService,
        private readonly currencyPipe: CurrencyPipe,
        private readonly userNotifier: UserNotifierService
    ) {
        this.mapInfo = new LocationPicker(this.locationsService);
        this.cart = this.cartService.cart$;
        // this.cartItems = this.cart.getState().pipe(map(s => s.items.map(getCartItem)));
        // tslint:disable-next-line: no-floating-promises
        this.cartService.getCartsItems();
    }

    async ngOnInit() {
        await this.loadUserInfo();
        this.availablePickupTimes = this.getAvailablePickupTimes();
        await this.reloadCart();
    }

    setFocus() {
        // do nothing pseudo code
    }

    async reloadCart() {
        // try {
        //   this.loading = true;
        //   // tslint:disable-next-line: no-floating-promises
        //   // tslint:disable-next-line: no-floating-promises
        //   this.cartService.reloadCart();
        //   this.firstFormGroup = this._formBuilder.group({
        //     firstCtrl: ['', Validators.required]
        //   });
        //   this.loading = false;
        // } finally {
        //   this.loading = false;
        // }
    }

    public numKeys(attributes: AttributeValues) {
        return Object.keys(attributes).length;
    }

    private async loadUserInfo() {
        const currentUser = await this.userService.getCurrentUserInfo();
        if (!currentUser) {
            throw new Error('Failed to get user info');
        }
        this.currentUser = currentUser;
        const alertUser = true;
        this.jobInfo = this.userService.getUserJobs(alertUser).then((j) => {
            this.isJobAccountRequired = j.isJobAccountRequired;
            return j;
        });
        this.accounts = this.userService.getAccounts();
        const accountId = this.accountId;
        // tslint:disable-next-line: no-floating-promises
        this.userService.getAddressBook().then((r) => {
            if (r && r.addressBooks) {
                this.addressBooks$.next(
                    r.addressBooks.filter(
                        (a) => a.accountLegacyId === (accountId || '0')
                    )
                );
            }
        });
        this.timeZoneOffset = 0;
        // tslint:disable-next-line: no-floating-promises
        this.accounts.then(async (accts) => {
            if (!accts) {
                return;
            }
            const activeAccount = this.userService.getCurrentAccount(
                currentUser,
                accts
            );
            if (!activeAccount) {
                return;
            }
            this.activeAccount = this.formatInfo(activeAccount);
            if (this.activeAccount && this.activeAccount.branch) {
                const branch = this.activeAccount.branch;
                this.pickupBranch = branch;
                const address = branch.address;
                if (address) {
                    await this.mapInfo.setZipCode(address.postalCode || '');
                    if (address.postalCode) {
                        const geo =
                            await this.locationsService.getTimeZoneFromAddress(
                                address.postalCode
                            );
                        if (geo) {
                            this.timeZoneOffset = geo.rawOffset + geo.dstOffset;
                        }
                    }
                }
            }
        });
    }

    isWorkDay = (d: Date): boolean => {
        if (!d) return false;
        const day = d.getDay();
        return day !== 0 && day !== 6;
    };
    add() {
        if (this.words2.length < 3) {
            this.words2.push({ value: '' });
        } else {
        }
    }
    deleteInput(index: number) {
        this.words2.splice(index, 1);
    }

    emptyForm() {
        this.addressBook = {
            accountLegacyId: '',
            accountName: '',
            addressBookId: '',
            addressBookInfo: {
                nickName: '',
                firstName: '',
                lastName: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                stateValue: '',
                postalCode: '',
                country: '',
                countryValue: '',
                phoneNumber: '',
            },
        };
    }

    addDash() {
        return (this.addressBook.addressBookInfo.phoneNumber =
            this.addressBook.addressBookInfo.phoneNumber.replace(
                /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                '$1-$2-$3'
            ));
    }

    formatInfo(activeAccount: AccountDetails): AccountDetails {
        const branch = activeAccount.branch;
        if (branch) {
            const address = branch.address;
            if (address) {
                for (const state of this.states) {
                    if (state.key === address.state) {
                        address.state = state.value;
                        address.state = address.state.toUpperCase();
                    }
                }
            }
            if (branch.branchPhone) {
                branch.branchPhone = branch.branchPhone.replace(
                    /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                    '$1-$2-$3'
                );
            }
        }

        return activeAccount;
    }

    async placeOrder() {
        //  Do a check - If it fails, we return but make sure we show the error messages
        if (!this.canPlaceOrder) {
            // TODO add analytics here
            // this.analytics.placeOrder(orderItems?)
            return;
        }

        try {
            this.loading = true;
            const request: PlaceOrderBase = this.getRequest();

            const response = await this.cartService.submitOrder(request);
            await this.cartService.clearCart();
            if (response.orderId) {
                await this.redirectWindowToOrder(response.orderId);
            }
        } finally {
            this.loading = false;
        }
    }

    private getRequest() {
        const accountId = this.accountId;
        if (!accountId) {
            throw new AppError('No account is selected');
        }
        const onHold = !this.DeliveryOpt;
        const currentBranch = this.currentUser.accountBranch;
        if (!currentBranch || !currentBranch.branchNumber) {
            throw new AppError('A Branch must be selected');
        }
        const shipment = this.DeliveryMethod ? 'O' : 'P';
        let time = this.time;
        const { date, addressBook, activeAccount, job, PO, orderNotes } = this;
        const cartItems = this.cart.value.items;
        if (!onHold && !date) {
            throw new AppError('Date is required');
        }

        //  Create function
        const formatedDate = date
            ? moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
            : '';
        if (onHold) {
            time = '';
        }
        const shippingBranch = currentBranch.branchNumber;
        if (!shippingBranch) {
            throw new AppError('Shipping branch not found');
        }
        return getRequest({
            shipment,
            addressBook,
            activeAccount,
            shippingBranch,
            accountId,
            job,
            PO,
            cartItems,
            orderNotes,
            onHold,
            formatedDate,
            time,
        });
    }

    async redirectWindowToOrder(orderId: string) {
        if (!this.accountId) {
            throw new AppError('No account is selected');
        }
        await this.router.navigateByUrl(
            `/proplus/accounts/${this.accountId}/orders/${orderId}`
        );
    }

    toggleChangeLocation() {
        this.changeLocation = !this.changeLocation;
    }

    encodeUri(value: string): string {
        return encodeURIComponent(value);
    }

    async changePickupLocation(store: LocationMarker) {
        this.pickupBranch = store;
        await this.showLocationInventoryMsg();
    }

    public formatPhone(phone: string) {
        if (phone) {
            phone = phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3');
        }
        return phone;
    }

    public isBranchSelected(branch: Branch) {
        if (branch.branchNumber === this.pickupBranch.branchNumber) {
            return true;
        }
        return false;
    }

    get canPlaceOrder(): boolean {
        const results = this.validationCheck();
        return results.length === 0;
    }

    validationCheck(): Errors[] {
        const errors: Errors[] = [];
        const isShippingAddressEntered = this.shippingAddressEntered;
        const hasDateAndTime = this.dateAndDate;
        const isShipping = this.DeliveryMethod;
        const selectedDate = this.date;
        const minDate = this.minDate;
        const isScheduled = this.DeliveryOpt;
        const jobNumberRequired = this.isJobAccountRequired;
        const { job } = this;
        const requireJobIsMissing = jobNumberRequired && !job.jobNumber;
        if (requireJobIsMissing) {
            errors.push({ error: 'Job is required', subError: null });
        }
        const requirePOIsMissing = this.poRequired && !this.PO;
        if (requirePOIsMissing) {
            errors.push({ error: 'PO is required', subError: null });
        }

        if (isScheduled) {
            if (!hasDateAndTime) {
                errors.push({
                    error: 'Scheduled orders must have a date and time',
                    subError: null,
                });
            }
        }

        if (isShipping && !isShippingAddressEntered) {
            errors.push({
                error: 'Shipped orders require an address',
                subError:
                    'Please check that Last Name, Adress 1, City, Phone Number, Zip Code and State are filled out',
            });
        } else {
            if (isScheduled && selectedDate && selectedDate < minDate) {
                errors.push({
                    error: `Scheduled date ${selectedDate.toLocaleString()} must be later than ${minDate.toLocaleString()}`,
                    subError: null,
                });
            }
        }

        return errors;
    }

    async selectJob(job?: Job) {
        //  Set default values up top
        job = job || noJob;
        //  Don't update if it's the same job
        if (this._job.jobNumber === job.jobNumber) {
            return;
        }
        this.selectedJobName = job.jobName;
        this._job = job;
        await this.cartService.updateCurrentOrderJobNumber(job.jobNumber);
        await this.reloadCart();
        const message =
            !job.jobName || !job.jobNumber
                ? `Job Account successfully reset`
                : `Job Account successfully set to ${job.jobName}`;
        this.userNotifier.alertError(message);
    }

    withinWeekdays(days: number): boolean {
        let calculatedDate = moment(this.currentDate);
        while (days > 0) {
            calculatedDate = calculatedDate.add(1, 'days');
            // decrease "days" only if it's a weekday.
            if (
                calculatedDate.isoWeekday() !== 6 &&
                calculatedDate.isoWeekday() !== 7
            ) {
                days -= 1;
            }
        }
        const date = this.date;
        if (!date) {
            return false;
        }
        const selectedDate = moment(date);
        return selectedDate.isBefore(calculatedDate, 'day');
    }

    showPickupMsg(): boolean {
        return !this.DeliveryMethod && this.withinWeekdays(4);
    }

    async validateOrderByLocation(): Promise<string> {
        if (this.atgOrderId === '') {
            throw new AppError('No atg order id');
        }
        const response = await this.cartService.validateOrderByLocation({
            orderId: this.atgOrderId,
            branchId: this.pickupBranch.branchNumber || '',
            address: this.pickupBranch.address
                ? this.pickupBranch.address.address2 || ''
                : '',
            postCode: this.pickupBranch.address
                ? this.pickupBranch.address.postalCode || ''
                : '',
        });
        const { success, result } = response;
        if (success) {
            return result || '';
        } else {
            throw new ApiError(
                'Unknown error while validating order by location',
                response
            );
        }
    }

    async showLocationInventoryMsg() {
        const validMsg = await this.validateOrderByLocation();
        this.locationValidMsg = validMsg;
    }

    public async reviewOrder() {
        const orderReview = await this.cartService
            .getCurrentOrderReview()
            .toPromise();
        if (!orderReview || !orderReview.result || !orderReview.result.poJob) {
            return;
        }
        const { poJob } = orderReview.result;
        this.poRequired = poJob.poRequired;
    }

    public async tabChanged(evt: MatTabChangeEvent) {
        if (!this.tabGroup) {
            return;
        }
        if (evt.index === 0) {
            await this.reviewOrder();
        } else if (evt.index === 1) {
        }
    }

    async goBack() {
        await this.router.navigateByUrl('/proplus/shopping-cart');
    }
}

function getRequest(m: {
    shipment: ShippingMethod;
    addressBook: AddressBook;
    activeAccount: AccountDetails;
    shippingBranch: string;
    accountId: string;
    job: Job;
    PO: string;
    cartItems: CartItemV2[];
    orderNotes: string;
    onHold: boolean;
    formatedDate: string;
    time: string;
}) {
    const {
        shipment,
        addressBook,
        activeAccount,
        shippingBranch,
        accountId,
        job,
        PO,
        cartItems,
        orderNotes,
        onHold,
        formatedDate,
        time,
    } = m;

    const address = getAddress(shipment, addressBook, activeAccount);
    if (!address) {
        throw new AppError('Invalid address');
    }
    const request: PlaceOrderBase = {
        accountId: accountId,
        job: {
            jobName: job.jobName || '',
            jobNumber: job.jobNumber || '',
        },
        purchaseOrderNo: PO || '',
        orderStatusCode: 'N',
        apiSiteId: 'BPP',
        lineItems: cartItems.map((v) => {
            const item = {
                itemNumber: v.catalogRefId,
                quantity: v.quantity,
                unitOfMeasure: v.uom,
                description: v.itemOrProductDescription,
            };
            return item;
        }),
        sellingBranch: shippingBranch,
        specialInstruction: orderNotes,
        pickupDate: onHold ? undefined : formatedDate,
        pickupTime: onHold ? undefined : time,
        checkForAvailability: 'no',
        onHold: onHold,
        shipping: {
            shippingMethod: shipment,
            shippingBranch: shippingBranch,
            address: address,
        },
    };
    return request;
}

function getAddress(
    shipment: ShippingMethod,
    addressBook: AddressBook,
    activeAccount: AccountDetails
) {
    if (shipment === 'O') {
        return {
            address1: addressBook.addressBookInfo.address1,
            address2: addressBook.addressBookInfo.address2,
            city: addressBook.addressBookInfo.city,
            postalCode: addressBook.addressBookInfo.postalCode,
            state: addressBook.addressBookInfo.stateValue,
        };
    } else {
        if (activeAccount.branch && activeAccount.branch.address) {
            const address = activeAccount.branch.address;
            return {
                address1: address.address1 || '',
                address2: address.address2 || '',
                city: address.city || '',
                postalCode: address.postalCode || '',
                state: address.state || '',
            };
        }
    }
    return undefined;
}

export interface Time {
    value: string;
    key: string | number;
}
export interface State {
    value: string;
    key: string;
}

interface Errors {
    error: string;
    subError: string | null;
}
