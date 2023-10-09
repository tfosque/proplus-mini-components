import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { AnalyticsService } from '../../common-components/services/analytics.service';
import { Router } from '@angular/router';

// import { SavedOrdersService } from '../../pro-plus/services/saved-orders.service';
// import { ShoppingCartService } from '../../pro-plus/services/shopping-cart-service';
import { FormControl, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../../pro-plus/pages/shopping-cart/MyErrorStateMatcher';
import { LocationsService, Branch } from '../../services/locations.service';
import { LocationPicker } from '../../pro-plus/pages/shopping-cart/location-picker';
// import { AppError } from '../../common-components/classes/app-error';
import moment from 'moment';
import momentBusinessDays from 'moment-business-days';

import { UserService } from '../../pro-plus/services/user.service';
import { emptyAddressBookEntry } from '../../pro-plus/model/address-book-response';
import { BehaviorSubject, of } from 'rxjs';
import { State, states } from '../../global-classes/states';

// import { ShippingInfoStore } from '../../../stores/shipping-info-store';
// import { ShippingInfoStore } from '../../pro-plus/stores/shipping-info-store';

// import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
// import { UserNotifierService } from '../../common-components/services/user-notifier.service';

// import { InstantAddressApiService } from '../../../services/instant-address-api.service';
import { InstantAddressApiService } from '../../pro-plus/services/instant-address-api.service';

import { Observable } from 'rxjs';
// import { debounceTime, tap, switchMap } from 'rxjs/operators';
/* import {
    InstantAddress,
    InstantAddressGetAddressRequest,
} from '../../../model/instant-address'; */
import {
    InstantAddress,
    InstantAddressGetAddressRequest,
} from '../../pro-plus/model/instant-address';

import { MatDialog } from '@angular/material/dialog';

// import { ConfirmationDialogComponent } from '../../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';\
import { ConfirmationDialogComponent } from '../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import {
    CommercialService,
    // CommercialService,
    ShippingInfo,
} from '../services/commercial.service';
import { SessionInfo } from 'src/app/pro-plus/services/SessionInfo';
import { AccountBranch } from 'src/app/pro-plus/model/get-current-user-response-v2';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { Record, String, Boolean, Static } from 'runtypes';

const blankBranch = {
    address: {
        address1: '',
        address2: '',
        address3: '',
        city: '',
        country: '',
        postalCode: '',
        state: '',
    },
    branchName: '',
    branchNumber: '',
    branchPhone: '',
    branchRegionId: '',
};

const distanceOptions = [
    { text: '5 Miles', value: 5 },
    { text: '10 Miles', value: 10 },
    { text: '25 Miles', value: 25 },
    { text: '50 Miles', value: 50 },
    { text: '100 Miles', value: 100 },
];
const PickTime = Record({
    displayName: String,
    disabled: Boolean,
    value: String,
    selected: Boolean,
});
type PickTime = Static<typeof PickTime>;

@Component({
    selector: 'app-shipping',
    templateUrl: './shipping.component.html',
    styleUrls: ['./shipping.component.scss'],
})
export class ShippingComponent implements OnInit {
    @ViewChild('newAddress1') newAddress1!: ElementRef;
    @ViewChild('newAddress2') newAddress2!: ElementRef;
    @ViewChild('newCity') newCity!: ElementRef;
    @ViewChild('newState') newState!: ElementRef;
    @ViewChild('newZipCode') newZipCode!: ElementRef;
    // @ViewChild('newCountry', {static:true}) newCountry!: ElementRef;
    loading = false;
    public pickupBranch: Branch = blankBranch;
    public states: State[] = states;
    public distanceOptions = distanceOptions;
    public changeLocation = false;
    public toSave = new BehaviorSubject<unknown>({});
    public edited!: ShippingInfo;
    public mapInfo: LocationPicker;
    public emptyAddressBookEntry = emptyAddressBookEntry;
    dateAndTimeFormControl = new FormControl('', [Validators.required]);
    timeFormControl = new FormControl('', [Validators.required]);
    lastNameFormControl = new FormControl('', [Validators.required]);
    cityFormControl = new FormControl('', [Validators.required]);
    zipFormControl = new FormControl('', [Validators.required]);
    phoneFormControl = new FormControl('', [Validators.required]);
    addressFormControl = new FormControl('', [Validators.required]);
    stateFormControl = new FormControl('', [Validators.required]);
    jobFormControl = new FormControl('', [Validators.required]);
    orderNotesFormControl = new FormControl('', [Validators.maxLength(234)]);
    matcher = new MyErrorStateMatcher();
    orderId: string | null = null;
    isSavedOrder = false;
    delAddress1 = '';
    reviewBtnClicked = false;
    streets: string[] = [];
    iaStreets$!: Observable<InstantAddress[]>;
    searchAddress$ = new BehaviorSubject<string>('');
    addressValid = true;
    initialDate = new Date();

    minDate: Date = new Date(
        this.initialDate.getFullYear(),
        this.initialDate.getMonth(),
        this.initialDate.getDate()
    );
    maxDate: Date = new Date(
        this.initialDate.getFullYear() + 1,
        this.initialDate.getMonth(),
        this.initialDate.getDate()
    );
    standardPickupHours = [
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
    standardDeliveryHours = [
        { key: 'Anytime', value: 'Anytime' },
        { key: 'Afternoon', value: 'Afternoon' },
        { key: 'Special Request', value: 'Special Request' },
        { key: 'Morning', value: 'Morning' },
    ];

    isWorkDay = (d: Date): boolean => {
        if (!d) return false;
        const day = d.getDay();
        return day !== 0 && day !== 6;
    };
    user!: SessionInfo;
    timeZoneOffset: number = 0;
    availablePickupTimes: PickTime[] = [];

    get deliveryTime() {
        return this.edited.time;
    }
    set deliveryTime(newTime: string | number | null | undefined) {
        const newT =
            (newTime &&
                (typeof newTime === 'string' ? newTime : newTime.toString())) ||
            '';
        this.edited.time = newT;
    }
    constructor(
        private readonly userService: UserService,
        // private readonly cartService: ShoppingCartService,
        private readonly locationsService: LocationsService,
        private readonly router: Router,
        // private readonly route: ActivatedRoute,
        // private readonly savedOrderService: SavedOrdersService,
        // private readonly userNotifier: UserNotifierService,
        // private readonly analyticsService: AnalyticsService,
        public instantAddressApiService: InstantAddressApiService,
        public addressValidationDialog: MatDialog,
        private commercialService: CommercialService
    ) {
        this.setInitialValue();

        //  THIS SETS WHICH STORE TO USE

        this.userService.sessionBehavior.subscribe(async (u) => {
            this.user = u;
            if (u.session.user) {
                this.edited.selectedPickupBranch = u.session.user
                    .accountBranch as AccountBranch;
            }
            //  If we don't have a postal code, we can't get a pickup location
            if (
                !u.sessionInfo ||
                !u.sessionInfo.accountBranch ||
                !u.sessionInfo.accountBranch.address ||
                !u.sessionInfo.accountBranch.address.postalCode
            ) {
                return;
            }
            //  If we have a postal code, we can get a pickup location
            const geo = await this.locationsService.getTimeZoneFromAddress(
                u.sessionInfo.accountBranch.address.postalCode
            );
            //  If we got the location, update the store
            if (geo) {
                this.timeZoneOffset = geo.rawOffset + geo.dstOffset;
            }
        });
        //  Whenever our address book changes, let the store know
        // this.userService.addressBooks$.subscribe((a) => {
        //     this.edited.dispatch.loadAddressBooks(a);
        // });

        //  Creates a location picker that will be used to find a pickup location
        this.mapInfo = new LocationPicker(this.locationsService);

        //  Updates the location picker with the postal code of the default branch

        const searchResults = this.searchAddress$.pipe(
            debounceTime(800),
            switchMap((search) => {
                if (search.length <= 3) return of([]);
                return this.instantAddressApiService.getStreetWildSearch(
                    search
                );
            }),
            map(async (results) => {
                if (
                    !this.edited ||
                    !this.edited.selectedPickupBranch ||
                    !this.edited.selectedPickupBranch.address
                ) {
                    return;
                }
                if (!this.edited.selectedPickupBranch.address.postalCode) {
                    return;
                }
                if (
                    this.mapInfo.zipSearch !==
                    this.edited.selectedPickupBranch.address.postalCode
                ) {
                    await this.mapInfo.setZipCode(
                        this.edited.selectedPickupBranch.address.postalCode
                    );
                }
                return results.map(
                    (ia) =>
                        `${ia.StandardizedAddress.Street1}, ${ia.StandardizedAddress.CityStateZip}`
                );
            }),
            tap((addresses) => console.table(addresses))
        );
        searchResults.subscribe();

        // this.iaStreets$ = searchResults;
    }

    // public getShippingStore() {
    //     // console.log(`Get the store from the cart service`);
    //     return this.cartService.shippingStore;
    // }

    async ngOnInit() {
        // tslint:disable-next-line: no-floating-promises
        // const addressBook = await this.userService.getAddressBook(true);
        // const userPerm = await this.userService.getCurrentUserPermission();
        // const user = await this.userService.getCurrentUserInfo();
        // console.log('user: ', user);
        // console.log('user permission: ', userPerm);
        // console.log('address book: ', addressBook);
        // if (user) {
        //     this.edited.selectedPickupBranch = user.accountBranch;
        //     console.log('edited: ', this.edited);
        // }
        // const queryParams = this.route.snapshot.params;
        // const orderId = queryParams['savedOrderId'];
        // if ( typeof orderId === 'string' ) {
        //   this.isSavedOrder = true;
        //   this.orderId = orderId;
        //   const savedOrdeShippingInfo = await this.savedOrderService
        //     .getShippingInfo( orderId )
        //     .toPromise();
        //   this.edited$.dispatch.loadSavedOrder( savedOrdeShippingInfo.result );
        // } else {
        //   // Call getOrderShippingInfo api only if it is regular shopping cart order
        //   this.cartService.getOrderShippingInfo();
        //   this.cartService.orderShippingInfo.state$.subscribe( ( e ) => {
        //     this.edited$.dispatch.load( e );
        //   } );
        //   const atgOrderId = this.edited$.value.atgOrderId;
        //   if ( atgOrderId ) {
        //     this.orderId = atgOrderId;
        //   }
        // }
        // await this.checkAvailability();
    }

    setInitialValue() {
        this.edited = {
            shippingMethod: 'Ship_to',
            shippingOnHold: 'scheduled',
            date: new Date(),
            time: '',
            job: {
                jobNumber: '',
                jobName: '',
            },
            selectedPickupBranch: {
                branchNumber: '',
                branchName: '',
                branchPhone: '',
                branchRegionId: '',
                address: {
                    address1: '',
                    address2: '',
                    address3: '',
                    city: '',
                    country: '',
                    postalCode: '',
                    state: '',
                },
                market: '',
                companyName: '',
                divisionName: '',
            },
            specialInstructions: '',
            shippingAddress: {
                address1: '',
                address2: '',
                city: '',
                stateValue: '',
                zip: '',
                countryValue: '',
                phone: '',
                lastName: '',
                firstName: '',
                state: '',
                nickName: '',
            },
        };
    }
    canPickExpress(today: moment.Moment, selectedDate: string) {
        const lastDayFortimes = momentBusinessDays(today).businessAdd(
            4,
            'days'
        );
        const diff = lastDayFortimes.diff(selectedDate, 'days');
        const canPickExpressHours = diff > 0;
        return canPickExpressHours;
    }
    getMinimumHour(
        now: Date,
        deliveryDate: Date | null,
        timeZoneOffet: number
    ) {
        // if minutes >= 30 minutes then offset is 3 rounding up;
        const expressLaneOffset = now.getMinutes() === 0 ? 0 : 1;

        // const expressLaneOffset = 1;
        // console.log('getMinimumHour', {
        //     now,
        //     deliveryDate,
        //     timeZoneOffet,
        //     expressLaneOffset,
        // });

        const todaysDayOffMonth: number = now.getDate();
        const isDeliveryToday =
            (deliveryDate && deliveryDate.getDate() === todaysDayOffMonth) ||
            false;

        //  The minimum hour is nothing if the delivery isn't today or we don't have any useful info about
        if (!deliveryDate || timeZoneOffet === 0 || !isDeliveryToday) {
            return 0;
        }
        //  Convert timeZoneOffset to minutes
        const offsetInMinutes = Math.round(timeZoneOffet / 60);
        const minimumHour = moment(now).utcOffset(offsetInMinutes).hour();

        const dateDiffms = deliveryDate.getTime() - now.getTime();
        const maxFutureDays = 3;
        const msInADay = 1000 * 60 * 60 * 24;
        const dateDiff = dateDiffms / msInADay;
        // const nowDate = new Date();

        // console.log('getMinimumHour', { offsetInMinutes, minimumHour, dateDiff, maxFutureDays })

        if (dateDiff <= maxFutureDays) {
            if (
                deliveryDate.setHours(0, 0, 0, 0) !== now.setHours(0, 0, 0, 0)
            ) {
                return 0;
            }

            return minimumHour + expressLaneOffset;
        }
        return 0;
    }

    getAvailablePickupTimes(): PickTime[] {
        const m = this.edited;
        // if (m.shippingMethod === 'Ship_to') {
        //     return [];
        // }

        /* Display strings['anytime', 'afternoon', 'special request', etc.]
           if user's date selection is within 5 days */

        const selectedDate = m && m.date && m.date.toDateString();

        if (!selectedDate) {
            return [];
        }

        const today = moment();

        // determine if 5 days from today
        const canPickExpressHours = this.canPickExpress(today, selectedDate);

        if (m.shippingMethod === 'Pick_up' && canPickExpressHours) {
            // available hours if date is today's date, exclude weekends
            const minHour = this.getMinimumHour(
                new Date(),
                m.date,
                this.timeZoneOffset
            );

            return this.standardPickupHours.map((v): PickTime => {
                return {
                    displayName: v.value.toUpperCase(),
                    disabled: v.key <= minHour,
                    value: v.key.toString(),
                    selected: false,
                };
            });
        } else {
            return this.standardDeliveryHours.map((t) => {
                const newTime = {
                    displayName: t.value.toUpperCase(),
                    disabled: false,
                    value: t.key || '',
                    selected: false,
                };
                return newTime;
            });
        }
    }

    // async checkAvailability() {
    //     if (this.orderId) {
    //         // check the item stock for default branch
    //         try {
    //             const pickupBranch = this.edited$.value.selectedPickupBranch;
    //             const response = await this.cartService.validateOrderByLocation(
    //                 {
    //                     orderId: this.orderId,
    //                     branchId: pickupBranch
    //                         ? pickupBranch.branchNumber || ''
    //                         : '',
    //                     address: pickupBranch
    //                         ? pickupBranch.address
    //                             ? pickupBranch.address.address2 || ''
    //                             : ''
    //                         : '',
    //                     postCode: pickupBranch
    //                         ? pickupBranch.address
    //                             ? pickupBranch.address.postalCode || ''
    //                             : ''
    //                         : '',
    //                 }
    //             );
    //             const { success, result } = response;
    //             if (success) {
    //                 this.edited$.dispatch.setPickupLocationMessage(
    //                     result || null
    //                 );
    //             } else {
    //                 throw new ApiError(
    //                     'Unknown error while validating order by location',
    //                     response
    //                 );
    //             }
    //         } finally {
    //         }
    //     }
    // }

    addDash() {
        const number = this.edited.shippingAddress.phone.replace(/\D+/g, '');
        return (this.edited.shippingAddress.phone = number.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }
    toggleChangeLocation() {
        this.changeLocation = !this.changeLocation;
    }

    formatPhone(phone: string) {
        if (phone) {
            phone = phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3');
        }
        return phone;
    }

    public isBranchSelected(branch: Branch) {
        return (
            branch.branchNumber ===
            this.edited.selectedPickupBranch.branchNumber
        );
    }
    ngOnChanges() {}
    setScheduledOption(event: any) {
        this.edited.shippingOnHold = event;
        this.commercialService.setShippingInfo(this.edited);

        return event;
    }
    setShippingMethod(event: any) {
        this.edited.shippingMethod = event;
        this.commercialService.setShippingInfo(this.edited);
        this.availablePickupTimes = this.getAvailablePickupTimes();
        return event;
    }
    get shippingInfoFullfilment() {
        const shippingInfo = this.edited;
        if (
            shippingInfo &&
            shippingInfo.shippingMethod !== '' &&
            shippingInfo.shippingOnHold !== '' &&
            shippingInfo.date &&
            shippingInfo.time !== '' &&
            shippingInfo.shippingAddress.address1 !== '' &&
            shippingInfo.shippingAddress.city !== '' &&
            shippingInfo.shippingAddress.stateValue !== '' &&
            shippingInfo.shippingAddress.zip !== '' &&
            shippingInfo.shippingAddress.phone !== '' &&
            shippingInfo.shippingAddress.lastName !== ''
        ) {
            this.commercialService.setShippingInfo(this.edited);

            return true;
        } else {
            return false;
        }
    }
    get isScheduled() {
        if (this.edited && this.edited.shippingOnHold === 'scheduled') {
            return true;
        } else {
            return false;
        }
    }
    get isDelivery() {
        if (this.edited && this.edited.shippingMethod === 'Ship_to') {
            return true;
        } else {
            return false;
        }
    }
    setScheduledDate(event: any) {
        this.edited.date = event;
        this.commercialService.setShippingInfo(this.edited);
        this.availablePickupTimes = this.getAvailablePickupTimes();
    }
    setInstructions(event: any) {
        this.edited.specialInstructions = event.target.value;
        this.commercialService.setShippingInfo(this.edited);
    }

    async changePickupLocation(loc: any) {
        try {
            this.loading = true;
            const branch: AccountBranch = {
                branchNumber: loc.branchNumber || '',
                branchName: loc.branchName || '',
                branchPhone: loc.branchPhone || '',
                branchRegionId: loc.branchRegionId || '',
                address: {
                    address1: loc.address.address1 || '',
                    address2: loc.address.address2 || '',
                    address3: loc.address.address3 || '',
                    city: loc.address.city || '',
                    country: loc.address.country || '',
                    postalCode: loc.address.postalCode || '',
                    state: loc.address.state || '',
                },
                market: loc.market || '',
                companyName: loc.companyName || '',
                divisionName: loc.divisionName || '',
            };
            this.edited.selectedPickupBranch = branch;
            this.commercialService.setShippingInfo(this.edited);
        } finally {
            this.changeLocation = false;
            this.loading = false;
        }
    }

    public encodeUri(value: string): string {
        return encodeURIComponent(value);
    }

    // public async saveShipping() {
    //     const edited = this.edited;
    //     const { saveCartShippingInfoRequest, savedOrderShippingInfoRequest } =
    //         edited;
    //     if (savedOrderShippingInfoRequest) {
    //         const response =
    //             await this.savedOrderService.updateSavedOrderShippingInfo(
    //                 savedOrderShippingInfoRequest
    //             );
    //         if (response.messages && response.messages.length) {
    //             const message = response.messages[0].value;
    //             this.userNotifier.alertError(message);
    //         }
    //     } else if (saveCartShippingInfoRequest) {
    //         await this.cartService.addOrderShippingInfo(
    //             saveCartShippingInfoRequest
    //         );
    //     }
    //     await this.userService.getAddressBook(true);
    // }

    async goBack() {
        await this.router.navigateByUrl('/proplus/shopping-cart');
    }

    public validateDeliveryAddress() {
        // console.log('address 1 from model: ', this.edited$.value.address.address1);
        // console.log('address 1: ', this.newAddress1.nativeElement.value);
        // console.log('address 2: ', this.newAddress2.nativeElement.value);
        // console.log('city: ', this.newCity.nativeElement.value);
        // console.log('state: ', this.newState.nativeElement ? this.newState.nativeElement.value : '');
        // console.log('state from edited: ', this.edited$.value.address.stateValue);
        // console.log('zip code: ', this.newZipCode.nativeElement.value);
        // console.log("address form control: ", this.addressFormControl);
        if (
            !this.edited.shippingAddress.address1 &&
            this.newAddress1.nativeElement.value
        ) {
            this.edited.shippingAddress.address1 =
                this.newAddress1.nativeElement.value;
        }
        if (
            !this.edited.shippingAddress.address2 &&
            this.newAddress2.nativeElement.value
        ) {
            this.edited.shippingAddress.address2 =
                this.newAddress2.nativeElement.value;
        }
        if (
            !this.edited.shippingAddress.city &&
            this.newCity.nativeElement.value
        ) {
            this.edited.shippingAddress.city = this.newCity.nativeElement.value;
        }
        if (
            !this.edited.shippingAddress.stateValue &&
            this.newState.nativeElement &&
            this.newState.nativeElement.value
        ) {
            this.edited.shippingAddress.stateValue =
                this.newState.nativeElement.value;
        }
        if (
            !this.edited.shippingAddress.zip &&
            this.newZipCode.nativeElement.value
        ) {
            this.edited.shippingAddress.zip =
                this.newZipCode.nativeElement.value;
        }
    }

    public selectCustom() {
        // this.edited.dispatch.emptyForm(true);
        // reloadMapping();
    }

    public convertMsg(inputStr: string) {
        // console.log('error array: ', inputStr.split('\n'));
        return inputStr.split('\n');
    }

    public testAlertInput(input: string) {
        // console.log('input change from address1, ', input);
    }

    public testAlertInputChange(input: string) {
        // console.log('input change from address1 change event, ', input);
    }

    public testAlertInputModelChange(input: string) {
        // console.log('input change from address1 model change event, ', input);
    }

    // public testAlertClick(input: string) {
    // console.log('input change from address1 click event model, ', this.edited$.value.address.address1);
    // console.log('input change from address1 click event, ', this.newAddress1.nativeElement.value);
    //     this.edited.value.address.address1 =
    //         this.newAddress1.nativeElement.value;
    // }

    // public getStreetWildSearch(input: string) {
    //     // this.instantAddressApiService.getStreetWildSearch(input)
    //     // const x = this.testObjUi$.value;
    //     // console.log({x});
    //     // return this.instantAddressApiService.getStreetWildSearch(input)
    //     this.searchAddress$.next(input);
    // }

    public displayFn(address: InstantAddress) {
        if (address && address.StandardizedAddress) {
            return `${address.StandardizedAddress.Street1}`;
        } else {
            return '';
        }
    }

    selectedAddress(address: InstantAddress) {
        // this.edited$.value.address.address1 = address.StandardizedAddress.Street1;
        // this.edited$.value.address.address2 = address.StandardizedAddress.Street2;
        // this.edited$.value.address.city = address.StandardizedAddress.City;
        // this.edited$.value.address.stateValue = address.StandardizedAddress.State;
        // this.edited$.value.address.postalCode = address.StandardizedAddress.ZipCode;
        // this.edited$.dispatch.setAddressField({
        //     name: 'address1',
        //     value: address.StandardizedAddress.Street1,
        // });
        // this.edited$.dispatch.setAddressField({
        //     name: 'address2',
        //     value: address.StandardizedAddress.Street2,
        // });
        // this.edited$.dispatch.setAddressField({
        //     name: 'city',
        //     value: address.StandardizedAddress.City,
        // });
        // this.edited$.dispatch.setAddressField({
        //     name: 'stateValue',
        //     value: address.StandardizedAddress.State,
        // });
        // this.edited$.dispatch.setAddressField({
        //     name: 'postalCode',
        //     value: address.StandardizedAddress.ZipCode,
        // });
        // console.log('street 1 from edited$: ', this.edited$.value.address.address1);
        // this.edited.dispatch.pickAddress({
        //     address1: address.StandardizedAddress.Street1,
        //     address2: address.StandardizedAddress.Street2,
        //     city: address.StandardizedAddress.City,
        //     state: address.StandardizedAddress.State,
        //     postalCode: address.StandardizedAddress.ZipCode,
        //     country: address.StandardizedAddress.Country,
        // });
        // this.searchAddress$.next('');
    }

    public async validateAddressFromInitium() {
        // Call Initium api GetAddress to validate the address
        let validationResult = true;
        const request: InstantAddressGetAddressRequest = {
            Street1: this.edited.shippingAddress.address1,
            Street2: this.edited.shippingAddress.address2 || '',
            City: this.edited.shippingAddress.city || '',
            State: this.edited.shippingAddress.stateValue || '',
            ZipCode: this.edited.shippingAddress.zip || '',
            Country: this.edited.shippingAddress.countryValue || 'USA',
            ResponseType: 'Standardized',
        };

        const response = await this.instantAddressApiService.getAddress(
            request
        );
        if (
            response &&
            response.InstantAddressResult &&
            response.InstantAddressResult.length > 0
        ) {
            const iaResult = response.InstantAddressResult;
            if (
                iaResult.every(
                    (a: any) =>
                        a.Flags.ResponseFlag === 'U' ||
                        a.Flags.ResponseFlag === 'M' ||
                        a.Flags.ResponseFlag === 'N' ||
                        a.Flags.ResponseFlag === 'P' ||
                        a.Flags.ResponseFlag === 'R'
                )
            ) {
                validationResult = false;
            }
        }
        return validationResult;
    }

    // streetClick(street: InstantAddress) {
    //     this.edited.dispatch.pickAddress({
    //         address1: street.StandardizedAddress.Street1,
    //         address2: street.StandardizedAddress.Street2,
    //         city: street.StandardizedAddress.City,
    //         state: street.StandardizedAddress.State,
    //         postalCode: street.StandardizedAddress.ZipCode,
    //         country: street.StandardizedAddress.Country,
    //     });
    //     this.addressValid = true;
    // }

    address1Change() {
        this.addressValid = true;
    }

    async askUserToConfirm<T>(config: {
        title: string;
        yesButton?: string;
        noButton?: string;
        question: string;
    }): Promise<boolean> {
        const dialogRef = this.addressValidationDialog.open(
            ConfirmationDialogComponent,
            {
                data: {
                    confimation: config.yesButton || 'Yes',
                    no: config.noButton || 'No',
                    question: config.question,
                    title: config.title,
                },
            }
        );
        return dialogRef
            .afterClosed()
            .toPromise()
            .then((result) => {
                if (result) {
                    return true;
                } else {
                    return false;
                }
            });
    }
}
