import { AnalyticsService } from './../../../../common-components/services/analytics.service';
import { SavedOrdersService } from './../../../services/saved-orders.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ShoppingCartService } from '../../../services/shopping-cart-service';
import { FormControl, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../../shopping-cart/MyErrorStateMatcher';
import {
    LocationsService,
    Branch,
} from '../../../../services/locations.service';
import {
    LocationPicker,
    LocationMarker,
} from '../../shopping-cart/location-picker';
import {
    AppError,
    ApiError,
} from '../../../../common-components/classes/app-error';
import { UserService } from '../../../services/user.service';
import { emptyAddressBookEntry } from '../../../model/address-book-response';
import { BehaviorSubject, of } from 'rxjs';
import { State, states } from '../../../../global-classes/states';
import { ShippingInfoStore } from '../../../stores/shipping-info-store';
import { Router, ActivatedRoute } from '@angular/router';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { InstantAddressApiService } from '../../../services/instant-address-api.service';
import { Observable } from 'rxjs';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import {
    InstantAddress,
    InstantAddressGetAddressRequest,
} from '../../../model/instant-address';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';

const distanceOptions = [
    { text: '5 Miles', value: 5 },
    { text: '10 Miles', value: 10 },
    { text: '25 Miles', value: 25 },
    { text: '50 Miles', value: 50 },
    { text: '100 Miles', value: 100 },
];

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
// declare function reloadMapping(): void;
@Component({
    selector: 'app-shipping-form',
    templateUrl: './shipping-form.component.html',
    styleUrls: ['./shipping-form.component.scss'],
})
export class ShippingFormComponent implements OnInit {
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
    public edited$: ShippingInfoStore;
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
    pickupBranchChangedStockLevelMsg = '';

    isWorkDay = (d: Date): boolean => {
        if (!d) return false;
        const day = d.getDay();
        return day !== 0 && day !== 6;
    };

    get deliveryTime() {
        return this.edited$.value.deliveryTime;
    }
    set deliveryTime(newTime: string | number | null | undefined) {
        const newT =
            (newTime &&
                (typeof newTime === 'string' ? newTime : newTime.toString())) ||
            '';
        this.edited$.dispatch.setScheduledTime(newT);
    }
    constructor(
        private readonly userService: UserService,
        private readonly cartService: ShoppingCartService,
        private readonly locationsService: LocationsService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly savedOrderService: SavedOrdersService,
        private readonly userNotifier: UserNotifierService,
        private readonly analyticsService: AnalyticsService,
        public instantAddressApiService: InstantAddressApiService,
        public addressValidationDialog: MatDialog
    ) {
        //  THIS SETS WHICH STORE TO USE
        this.edited$ = this.getShippingStore();

        this.userService.sessionBehavior.subscribe(async (u) => {
            this.edited$.dispatch.setUserInfo(u);
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
                this.edited$.dispatch.setTimeZoneOffet(
                    geo.rawOffset + geo.dstOffset
                );
            }
        });
        //  Whenever our address book changes, let the store know
        this.userService.addressBooks$.subscribe((a) => {
            this.edited$.dispatch.loadAddressBooks(a);
        });

        //  Creates a location picker that will be used to find a pickup location
        this.mapInfo = new LocationPicker(this.locationsService);

        //  Updates the location picker with the postal code of the default branch
        this.edited$.form$.subscribe(async (e) => {
            if (!e || !e.defaultBranch || !e.defaultBranch.address) {
                return;
            }
            if (!e.defaultBranch.address.postalCode) {
                return;
            }
            if (this.mapInfo.zipSearch !== e.defaultBranch.address.postalCode) {
                await this.mapInfo.setZipCode(
                    e.defaultBranch.address.postalCode
                );
            }
        });

        const searchResults = this.searchAddress$.pipe(
            debounceTime(800),
            switchMap((search) => {
                if (search.length <= 3) return of([]);
                return this.instantAddressApiService.getStreetWildSearch(
                    search
                );
            }),
            // map((results) => {
            //     return results.map(ia =>
            //         `${ia.StandardizedAddress.Street1}, ${ia.StandardizedAddress.CityStateZip}`
            //         );
            // }),
            tap((addresses) => console.table(addresses))
        );
        // searchResults.subscribe();
        this.iaStreets$ = searchResults;
    }

    public getShippingStore() {
        // console.log(`Get the store from the cart service`);
        return this.cartService.shippingStore;
    }

    async ngOnInit() {
        // tslint:disable-next-line: no-floating-promises
        this.userService.getAddressBooks();
        this.userService.getCurrentUserPermission();

        const queryParams = this.route.snapshot.params;

        const orderId = queryParams['savedOrderId'];

        if (typeof orderId === 'string') {
            this.isSavedOrder = true;
            this.orderId = orderId;
            const savedOrdeShippingInfo = await this.savedOrderService
                .getShippingInfo(orderId)
                .toPromise();

            this.edited$.dispatch.loadSavedOrder(savedOrdeShippingInfo.result);
        } else {
            // Call getOrderShippingInfo api only if it is regular shopping cart order
            this.cartService.getOrderShippingInfo();
            this.cartService.orderShippingInfo.state$.subscribe((e) => {
                this.edited$.dispatch.load(e);
            });
            const atgOrderId = this.edited$.value.atgOrderId;
            if (atgOrderId) {
                this.orderId = atgOrderId;
            }
        }
        await this.checkAvailability();
    }

    async checkAvailability() {
        if (this.orderId) {
            // check the item stock for default branch
            try {
                const pickupBranch = this.edited$.value.selectedPickupBranch;
                const response = await this.cartService.validateOrderByLocation(
                    {
                        orderId: this.orderId,
                        branchId: pickupBranch
                            ? pickupBranch.branchNumber || ''
                            : '',
                        address: pickupBranch
                            ? pickupBranch.address
                                ? pickupBranch.address.address2 || ''
                                : ''
                            : '',
                        postCode: pickupBranch
                            ? pickupBranch.address
                                ? pickupBranch.address.postalCode || ''
                                : ''
                            : '',
                    }
                );
                const { success, result } = response;
                if (success) {
                    this.edited$.dispatch.setPickupLocationMessage(
                        result || null
                    );
                } else {
                    throw new ApiError(
                        'Unknown error while validating order by location',
                        response
                    );
                }
            } finally {
            }
        }
    }

    addDash() {
        const number = this.edited$.value.address.phoneNumber.replace(
            /\D+/g,
            ''
        );
        return (this.edited$.value.address.phoneNumber = number.replace(
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
        return branch.branchNumber === this.pickupBranch.branchNumber;
    }

    async changePickupLocation(loc: LocationMarker) {
        try {
            this.loading = true;
            this.edited$.dispatch.changePickupLocation(loc);
            let orderId;
            const queryParams = this.route.snapshot.params;
            const savedOrderId = queryParams['savedOrderId'];
            if (typeof savedOrderId === 'string') {
                // saved order
                if (!savedOrderId) {
                    throw new AppError(`Cannot change the pickup location`);
                }
                orderId = savedOrderId;
                // console.log('saved order id: ', this.edited$.value.savedOrderId);
            } else {
                // cart order
                const atgOrderId = this.edited$.value.atgOrderId;
                if (!atgOrderId) {
                    throw new AppError(`Cannot change the pickup location`);
                }
                orderId = atgOrderId;
            }
            const response = await this.cartService.validateOrderByLocation({
                orderId: orderId,
                branchId: loc.branchNumber || '',
                address: loc.address ? loc.address.address2 || '' : '',
                postCode: loc.address ? loc.address.postalCode || '' : '',
            });
            const { success, result } = response;
            if (success) {
                this.edited$.dispatch.setPickupLocationMessage(result || null);
                this.changeLocation = false;
                this.pickupBranchChangedStockLevelMsg =
                    'Please Note: Pick Up Branch altered, active stock levels for items selected may differ.';
            } else {
                throw new ApiError(
                    'Unknown error while validating order by location',
                    response
                );
            }
        } finally {
            this.loading = false;
        }
    }

    public encodeUri(value: string): string {
        return encodeURIComponent(value);
    }

    public async saveShipping() {
        const edited = this.edited$.value;
        const { saveCartShippingInfoRequest, savedOrderShippingInfoRequest } =
            edited;
        if (savedOrderShippingInfoRequest) {
            const response =
                await this.savedOrderService.updateSavedOrderShippingInfo(
                    savedOrderShippingInfoRequest
                );
            if (response.messages && response.messages.length) {
                const message = response.messages[0].value;
                this.userNotifier.alertError(message);
            }
        } else if (saveCartShippingInfoRequest) {
            await this.cartService.addOrderShippingInfo(
                saveCartShippingInfoRequest
            );
        }
        await this.userService.getAddressBooks();
    }

    async goBack() {
        await this.router.navigateByUrl('/proplus/shopping-cart');
    }

    public async goToOrderReview() {
        try {
            // console.log('error message: ', this.edited$.value.errorMessage);
            this.reviewBtnClicked = true;
            // console.log('address 1 type: ', typeof(this.edited$.value.address.address1));
            if (typeof this.edited$.value.address.address1 === 'object') {
                // console.log ('address 1: ', this.edited$.value.address.address1);
                const address1 = this.edited$.value.address.address1;
                this.edited$.value.address.address1 = (<InstantAddress>(
                    address1
                )).StandardizedAddress.Street1;
            }
            if (this.edited$.value.DeliveryMethod) {
                this.validateDeliveryAddress();
            }
            if (!this.edited$.value.canProceed) {
                return;
            }
            if (this.edited$.value.DeliveryMethod) {
                const validationResult =
                    await this.validateAddressFromInitium();
                if (!validationResult) {
                    const toProceed = await this.askUserToConfirm({
                        title: 'Address cannot be validated',
                        question:
                            'Address cannot be validated, do you wish to proceed?',
                        yesButton: 'Yes',
                        noButton: 'No',
                    });
                    if (!toProceed) {
                        this.addressValid = false;
                        return;
                    }
                } else {
                    if (!this.addressValid) {
                        this.addressValid = true;
                    }
                }
            }

            this.edited$.value.address.phoneNumber =
                this.edited$.value.address.phoneNumber.replace(/\D+/g, '');

            this.loading = true;
            const edited = this.edited$.value;
            const {
                saveCartShippingInfoRequest,
                savedOrderShippingInfoRequest,
            } = edited;
            if (savedOrderShippingInfoRequest) {
                const response =
                    await this.savedOrderService.updateSavedOrderShippingInfo(
                        savedOrderShippingInfoRequest
                    );
                if (!response) {
                    throw new AppError('Failed to save order');
                }
                if (
                    !response.success &&
                    response.messages &&
                    response.messages.length
                ) {
                    const message = response.messages[0].value;
                    throw new AppError(message);
                }
                await this.router.navigate([
                    '/proplus/saved-orders',
                    edited.savedOrderId,
                    'review',
                ]);
            } else if (saveCartShippingInfoRequest) {
                await this.cartService.addOrderShippingInfo(
                    saveCartShippingInfoRequest
                );
                await this.router.navigate(['/proplus/order-review']);
            }
        } catch (err) {
            if (err instanceof AppError || err instanceof ApiError) {
                this.userNotifier.alertError(err.message);
                console.log({ err });
            }
        } finally {
            const items = this.cartService.cart$.store.value.items.map((v) => {
                const i = {
                    id: v.catalogRefId,
                    name: v.itemOrProductDescription,
                    price: v.unitPrice,
                    quantity: v.quantity,
                    variant: v.vendorColorId, // try to get variant name
                };
                return i;
            });

            // TODO add Google Analytics
            this.analyticsService.orderReview(items);
            this.loading = false;
        }
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
            !this.edited$.value.address.address1 &&
            this.newAddress1.nativeElement.value
        ) {
            this.edited$.value.address.address1 =
                this.newAddress1.nativeElement.value;
        }
        if (
            !this.edited$.value.address.address2 &&
            this.newAddress2.nativeElement.value
        ) {
            this.edited$.value.address.address2 =
                this.newAddress2.nativeElement.value;
        }
        if (
            !this.edited$.value.address.city &&
            this.newCity.nativeElement.value
        ) {
            this.edited$.value.address.city = this.newCity.nativeElement.value;
        }
        if (
            !this.edited$.value.address.stateValue &&
            this.newState.nativeElement &&
            this.newState.nativeElement.value
        ) {
            this.edited$.value.address.stateValue =
                this.newState.nativeElement.value;
        }
        if (
            !this.edited$.value.address.postalCode &&
            this.newZipCode.nativeElement.value
        ) {
            this.edited$.value.address.postalCode =
                this.newZipCode.nativeElement.value;
        }
    }

    public selectCustom() {
        this.edited$.dispatch.emptyForm(true);
        // reloadMapping();
    }

    public convertMsg(inputStr: string) {
        // console.log('error array: ', inputStr.split('\n'));
        return inputStr.split('\n');
    }

    // public getStateFilter() {
    //     if (this.userService.sessionInfo) {
    //         if (this.userService.sessionInfo.accountBranch) {
    //             if (this.userService.sessionInfo.accountBranch.address) {
    //                 return (this.userService.sessionInfo.accountBranch.address.state || '')
    //             }
    //         }
    //     }
    //     return '';
    // }

    // public getCityFilter() {
    //     if (this.userService.sessionInfo) {
    //         if (this.userService.sessionInfo.accountBranch) {
    //             if (this.userService.sessionInfo.accountBranch.address) {
    //                 return (this.userService.sessionInfo.accountBranch.address.city || '')
    //             }
    //         }
    //     }
    //     return '';
    // }

    // public getZipcodeFilter() {
    //     if (this.userService.sessionInfo) {
    //         if (this.userService.sessionInfo.accountBranch) {
    //             if (this.userService.sessionInfo.accountBranch.address) {
    //                 return (this.userService.sessionInfo.accountBranch.address.postalCode || '')
    //             }
    //         }
    //     }
    //     return '';
    // }

    public testAlertInput(input: string) {
        // console.log('input change from address1, ', input);
    }

    public testAlertInputChange(input: string) {
        // console.log('input change from address1 change event, ', input);
    }

    public testAlertInputModelChange(input: string) {
        // console.log('input change from address1 model change event, ', input);
    }

    public testAlertClick(input: string) {
        // console.log('input change from address1 click event model, ', this.edited$.value.address.address1);
        // console.log('input change from address1 click event, ', this.newAddress1.nativeElement.value);
        this.edited$.value.address.address1 =
            this.newAddress1.nativeElement.value;
    }

    // private _normalizeValue(value: string): string {
    //     return value.toLowerCase().replace(/\s/g, '');
    // }

    // private _iaFilteredStreet(value: string): string[] {
    //     const iaFilteredStreetValue = this._normalizeValue(value);
    //     return this.streets.filter(street =>
    //         this._normalizeValue(street).includes(iaFilteredStreetValue));
    // }

    public getStreetWildSearch(input: string) {
        // this.instantAddressApiService.getStreetWildSearch(input)
        // const x = this.testObjUi$.value;
        // console.log({x});
        // return this.instantAddressApiService.getStreetWildSearch(input)
        this.searchAddress$.next(input);
    }

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
        this.edited$.dispatch.pickAddress({
            address1: address.StandardizedAddress.Street1,
            address2: address.StandardizedAddress.Street2,
            city: address.StandardizedAddress.City,
            state: address.StandardizedAddress.State,
            postalCode: address.StandardizedAddress.ZipCode,
            country: address.StandardizedAddress.Country,
        });

        this.searchAddress$.next('');
    }

    public async validateAddressFromInitium() {
        // Call Initium api GetAddress to validate the address
        let validationResult = true;
        const request: InstantAddressGetAddressRequest = {
            Street1: this.edited$.value.address.address1,
            Street2: this.edited$.value.address.address2 || '',
            City: this.edited$.value.address.city || '',
            State: this.edited$.value.address.stateValue || '',
            ZipCode: this.edited$.value.address.postalCode || '',
            Country: this.edited$.value.address.countryValue || 'USA',
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
                    (a) =>
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
        // console.log({validationResult});
        return validationResult;
    }

    streetClick(street: InstantAddress) {
        this.edited$.dispatch.pickAddress({
            address1: street.StandardizedAddress.Street1,
            address2: street.StandardizedAddress.Street2,
            city: street.StandardizedAddress.City,
            state: street.StandardizedAddress.State,
            postalCode: street.StandardizedAddress.ZipCode,
            country: street.StandardizedAddress.Country,
        });
        this.addressValid = true;
    }

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
