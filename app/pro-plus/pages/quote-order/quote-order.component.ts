import { QuoteOrderPricingResponse } from './../../services/quote-service';
import { AppError } from './../../../common-components/classes/app-error';
import { states } from './../../../global-classes/states';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import {
    UserService,
    DeleteItemCartRequest,
    AccountView,
} from '../../services/user.service';
import {
    AddressBook, AddressBookResponse,
} from '../../model/address-book-response';
import { JobsResponse } from '../../model/jobs-response';
import { Job, noJob } from '../../model/job';
import { FormControl, Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TemplateListResponse } from '../../model/template-list-response';
import { TemplatesService } from '../../services/templates.service';
import { TemplateReference } from '../../model/template-list';
import {
    CartItems,
    ItemsEntity,
    CartOrderSummary,
    ShoppingCartService,
    Approver,
} from '../../services/shopping-cart-service';
import { SkuSelection } from '../../shared-components/sku-selector/sku-selector.component';
import { TemplateDetailResponse } from '../../model/template-detail-response';
import { ApiError } from '../../services/api-error';
import { Variations } from '../../model/variations';
import { AttributeValues } from '../../model/attribute-values';
import { stripTags } from '../../../common-components/classes/html-utilities';
import moment from 'moment';
import { LocationsService } from '../../../services/locations.service';
import { Branch } from '../../model/branch';
import { CreateTemplateDialogComponent } from '../templates/template-dialog/create-template-dialog/create-template-dialog.component';
import {
    // ProductsService,
    SuggestiveSellingResponse,
    SuggestiveSellingItem,
} from '../../services/products.service';
import { Observable } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
import { Image } from '../../../global-classes/image';
import { standardPickupHours } from '../shopping-cart/shopping-cart.component';
import { DeleteDialogComponent } from '../shopping-cart/delete-dialog/delete-dialog.component';
import { SaveOrderDialogComponent } from '../shopping-cart/save-order-dialog/save-order-dialog.component';
import { DeleteItemDialogComponent } from '../shopping-cart/delete-item-dialog/delete-item-dialog.component';
import {
    LocationPicker,
    LocationMarker,
} from '../shopping-cart/location-picker';
import { MyErrorStateMatcher } from '../shopping-cart/MyErrorStateMatcher';
import { QuoteService } from '../../services/quote-service';
import { UserNotifierService } from '../../../common-components/services/user-notifier.service';
import { QuoteOrder, CommerceItem } from '../../services/quote-order';
import {
    QuoteOrderDetail,
    updateQuoteOrderShippingInfoRequest,
} from '../../services/quote-order';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { AllPermissions } from '../../services/UserPermissions';
import { ApproveDialogueComponent } from '../order-review/approve-dialogue/approve-dialogue.component';

@Component({
    selector: 'app-quote-order',
    templateUrl: './quote-order.component.html',
    styleUrls: ['./quote-order.component.scss'],
})
export class QuoteOrderComponent implements OnInit {
    @ViewChild('stepper') stepper!: MatStepper;
    @Input() checked = true;
    loading = true;
    successMsg = false;
    DeliveryMethod = false;
    matcher = new MyErrorStateMatcher();
    DeliveryOpt = true;
    saveAddress = false;
    time = '';
    private _date: Date = new Date('');
    availablePickupTimes: Time[] = [];
    mapInfo: LocationPicker;
    timeZoneOffet = 0;
    public suggestedProducts!: Observable<SuggestiveSellingResponse>;
    quoteOrder: QuoteOrder;
    get cartTotalDataSource() {
        return this.cartSummary ? [this.cartSummary] : [];
    }

    displayedColumns = [
        'product',
        'details',
        'price',
        'qty',
        'total',
        'action',
    ];
    displayedColumns2 = ['product', 'details', 'price', 'qty', 'total'];
    dislplayColumnTotal = ['orderSummary', 'empty'];
    activeAccount!: AccountView;
    get accountId() {
        if (this.userService.accountIdInString) {
            return this.userService.accountIdInString;
        } else {
            return null;
        }
    }
    saveOrderName = '';
    states: State[] = states;
    addressBooks!: AddressBookResponse;
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
        {
            text: '5 Miles',
            value: 5,
        },
        {
            text: '10 Miles',
            value: 10,
        },
        {
            text: '25 Miles',
            value: 25,
        },
        {
            text: '50 Miles',
            value: 50,
        },
        {
            text: '100 Miles',
            value: 100,
        },
    ];
    public showMore: Array<{ productId: string; show: boolean }> = [];
    private readonly _job: Job = noJob;
    //  TODO - We need to populate the list based on whether the user has a job or not
    jobs!: JobsResponse;
    PO = '';
    cartSummary: CartOrderSummary | null = null;
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
    cartItems: CommerceItem[] = [];
    cartItemsBegin: SimpleQuoteItem[] = [];
    originalCarItems: CommerceItem[] = [];
    templates!: TemplateListResponse;
    templateList: TemplateReference[] = [];
    templateSelect: TemplateReference | null = null;
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

    quoteOrderDetail!: QuoteOrderDetail;
    quoteFormControl = new FormControl('', [Validators.required]);
    //  TODO:  Let's rename this
    words2: { value: string }[] = [];
    firstFormGroup!: FormGroup;
    quoteOrderPricing: QuoteOrderPricingResponse | null = null;
    // Submitter approvers
    approvers?: Approver[];
    userPerm?: AllPermissions;

    get job() {
        return this._job;
    }

    set job(newJob: Job) {
        // tslint:disable-next-line: no-floating-promises
        this.selectJob(newJob.jobNumber);
    }

    get date() {
        return this._date;
    }
    set date(newDate: Date) {
        this._date = newDate;
        this.availablePickupTimes = this.getAvailablePickupTimes();
        // console.log('set date', this._date, this.availablePickupTimes);
    }
    get requiredForms() {
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
    get getTimesAvailable() {
        this.availablePickupTimes = this.getAvailablePickupTimes();
        return this.availablePickupTimes;
    }
    get isQtyZero() {
        if (this.cartItems.filter((item) => item.quantity === 0).length > 0) {
            return true;
        } else {
            return false;
        }
    }
    getAvailablePickupTimes() {
        const nowDate = new Date();
        if (this.date && !this.DeliveryMethod) {
            const now = this.currentDate;
            const offsetInMinutes = Math.round(this.timeZoneOffet / 60);
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
                    return standardPickupHours.map((h) => {
                        return {
                            key: h.key.toString(),
                            value: h.value,
                        };
                    });
                }
                return standardPickupHours
                    .filter((h) => h.key >= minimumHour + 2)
                    .map((h) => {
                        return {
                            key: h.key.toString(),
                            value: h.value,
                        };
                    });
            }
        }
        return [
            { key: 'Anytime', value: 'Anytime' },
            { key: 'Afternoon', value: 'Afternoon' },
            { key: 'Special Request', value: 'Special Request' },
            { key: 'Morning', value: 'Morning' },
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
        return this.cartItems.reduce(
            (total, item) => total + item.quantity * item.price,
            0
        );
    }

    get tax() {
        if (this.quoteOrderPricing) {
            return `$${this.quoteOrderPricing.taxes}`;
        } else {
            return 'Tax calculated at invoicing';
        }
    }
    get itemTotal() {
        if (this.quoteOrderPricing && this.quoteOrderPricing.subTotal) {
            return this.quoteOrderPricing.subTotal;
        } else {
            return 'Pending';
        }
    }
    get otherCharges() {
        if (this.quoteOrderPricing && this.quoteOrderPricing.otherCharges) {
            return this.quoteOrderPricing.otherCharges;
        } else {
            return 'Pending';
        }
    }
    get getTotal() {
        if (this.quoteOrderPricing && this.quoteOrderPricing.total) {
            return this.quoteOrderPricing.total;
        } else {
            return 'Will be calculated at the time of invoicing.';
        }
    }
    get getTax() {
        if (this.quoteOrderPricing && this.quoteOrderPricing.taxes) {
            return this.quoteOrderPricing.taxes;
        } else {
            return 'Pending';
        }
    }

    // Check submitter permission
    get userPermValueApprove() {
        if (
            this.userPerm &&
            (this.userPerm.order.approve ||
                !this.userPerm.order.submitForApproval)
        ) {
            return true;
        } else {
            return false;
        }
    }

    get cartQtyChanged() {
        if (this.cartItems.some((i) => i.quotedItemQtyChanged)) {
            return true;
        } else {
            return false;
        }
    }

    constructor(
        private readonly _snackBar: MatSnackBar,
        public templateService: TemplatesService,
        public deleteItemDialog: MatDialog,
        public saveOrderDialog: MatDialog,
        public newTemplateDialog: MatDialog,
        public saveDialog: MatDialog,
        private readonly router: Router,
        private readonly _formBuilder: FormBuilder,
        private readonly userService: UserService,
        private readonly quoteService: QuoteService,
        // private readonly productsService: ProductsService,
        private readonly locationsService: LocationsService,
        private readonly route: ActivatedRoute,
        private readonly userNotifier: UserNotifierService,
        private readonly safeHtmlPipe: SafeHtmlPipe,
        private readonly cartService: ShoppingCartService
    ) {
        this.mapInfo = new LocationPicker(this.locationsService);

        const quoteOrderId = this.route.snapshot.paramMap.get('quoteOrderId');

        this.quoteOrder = this.quoteService.getQuoteOrder(quoteOrderId || '');
    }

    async ngOnInit() {
        await this.loadUserInfo();
        this.availablePickupTimes = this.getAvailablePickupTimes();
        await this.refreshQuoteOrder();
        this.loadCartItemsBegin();
        this.setOrderDelivery();
        await this.reloadCart();
        // Get submitter approvers
        const approverResponse = await this.cartService.getApproverList();
        this.approvers = approverResponse.result;
        this.userPerm = await this.userService.getCurrentUserPermission();
    }

    setOrderDelivery() {
        if (!this.quoteOrderDetail) {
            throw new AppError('Failed to load Quote');
        }
        if (this.quoteOrderDetail.deliveryOptionValue) {
            if (this.quoteOrderDetail.deliveryOptionValue === 'scheduled') {
                this.DeliveryOpt = true;
            } else if (this.quoteOrderDetail.deliveryOptionValue === 'onHold') {
                this.DeliveryOpt = false;
            }
        }
        this.DeliveryMethod = true;
        if (this.quoteOrderDetail.shippingMethodValue) {
            if (this.quoteOrderDetail.shippingMethodValue === 'Pick_up') {
                this.DeliveryMethod = false;
            } else if (
                this.quoteOrderDetail.shippingMethodValue === 'Ship_to'
            ) {
                this.DeliveryMethod = true;
            }
        }
        // if (this.quoteOrderDetail.deliveryDate) {
        //     console.log('delivery date', this.quoteOrderDetail.deliveryDate);

        //     this.date = new Date(this.quoteOrderDetail.deliveryDate);
        // }
        if (this.quoteOrderDetail.deliveryTime) {
            const deliveryTime = this.quoteOrderDetail.deliveryTime;
            if (
                deliveryTime
                    .substring(deliveryTime.length - 2)
                    .toLowerCase() === 'am' ||
                deliveryTime
                    .substring(deliveryTime.length - 2)
                    .toLowerCase() === 'pm'
            ) {
                const amOrPm = deliveryTime
                    .substring(deliveryTime.length - 2)
                    .toLowerCase();
                const intDeliveryTime = parseInt(
                    deliveryTime.substring(0, deliveryTime.length - 2).trim(),
                    10
                );
                if (amOrPm === 'pm') {
                    this.time = `${intDeliveryTime + 12}`;
                } else {
                    this.time = `${intDeliveryTime}`;
                }
            } else {
                this.time = deliveryTime;
            }
        }
        this.addressBook.addressBookInfo.address1 =
            this.quoteOrderDetail.shippingAddress.address1;
        this.addressBook.addressBookInfo.address2 =
            this.quoteOrderDetail.shippingAddress.address2 || '';
        this.addressBook.addressBookInfo.city =
            this.quoteOrderDetail.shippingAddress.city || '';
        this.addressBook.addressBookInfo.country =
            this.quoteOrderDetail.shippingAddress.country || '';
        this.addressBook.addressBookInfo.phoneNumber =
            this.quoteOrderDetail.contactInfo.phoneNumber || '';
        this.addressBook.addressBookInfo.firstName =
            this.quoteOrderDetail.contactInfo.firstName || '';
        this.addressBook.addressBookInfo.lastName =
            this.quoteOrderDetail.contactInfo.lastName || '';
        this.addressBook.addressBookInfo.state =
            this.quoteOrderDetail.shippingAddress.state || '';
        this.addressBook.addressBookInfo.postalCode =
            this.quoteOrderDetail.shippingAddress.postalCode;

        if (this.quoteOrderDetail.job.jobNumber) {
            console.log('job number', this.quoteOrderDetail.job);

            this.selectJob(
                this.quoteOrderDetail.job.jobNumber,
                this.quoteOrderDetail.job.jobName
            );
        } else {
            this.job.jobName = '';
            this.job.jobNumber = '';
        }

        this.orderNotes =
            this.quoteOrderDetail.instructions.length > 234
                ? this.quoteOrderDetail.instructions.substring(0, 234)
                : this.quoteOrderDetail.instructions;
    }

    async refreshQuoteOrder() {
        const quoteDetail = await this.quoteOrder.getQuoteOrder();
        if (!quoteDetail.result) {
            throw new AppError('Failed to load Quote');
        }
        const quoteOrderPricing = await this.quoteService.getQuoteOrderPricing(
            quoteDetail.result.id,
            quoteDetail.result.job.jobNumber || ''
        );
        if (!quoteOrderPricing.result) {
            throw new AppError('Failed to load Quote Pricing');
        }
        this.quoteOrderPricing = quoteOrderPricing.result;
        this.quoteOrderDetail = quoteDetail.result;
    }

    async reloadCart(needRefresh = false) {
        try {
            this.loading = true;
            if (needRefresh) {
                await this.refreshQuoteOrder();
            }
            if (!this.quoteOrderDetail) {
                throw new AppError(`Can't load quote`);
            }
            const quoteOrderItems = this.quoteOrderDetail.commerceItems;
            this.cartItems = quoteOrderItems;
            for (const item of this.cartItems) {
                this.showMore.push({
                    productId: item.productId || '',
                    show: false,
                });
            }

            this.firstFormGroup = this._formBuilder.group({
                firstCtrl: ['', Validators.required],
            });

            const cartSummary = await this.quoteOrder.getCartDetail();

            /* Florali */
            /* this.suggestedProducts = of(this.cartItems).pipe(
                switchMap((items) => {
                    return this.productsService.getSuggestiveSelling({
                        account: this.activeAccount.accountLegacyId,
                        pageNo: 1,
                        pageSize: 10,
                        itemNumber: items.map((i) => i.itemNumber),
                    });
                })
            ); */

            this.cartSummary = cartSummary;
            console.log(cartSummary);
        } finally {
            this.loading = false;
        }
    }

    public findShowMore(productId: string) {
        return this.showMore.filter((s) => s.productId === productId)[0].show;
    }

    public flipShowMore(productId: string) {
        const currValue = this.findShowMore(productId);
        const updateItem = this.showMore.filter(
            (s) => s.productId === productId
        )[0];
        const index = this.showMore.indexOf(updateItem);
        this.showMore[index].show = !currValue;
    }

    public numKeys(attributes: AttributeValues) {
        return Object.keys(attributes).length;
    }

    private async loadUserInfo() {
        try {
            const alertUser = true;
            this.jobs = await this.userService.getUserJobs(alertUser);
            const accounts = this.userService.session.accountList
                .filter(a => a.accountLegacyId === (this.userService.accountId || 0).toString());
            if (accounts && accounts.length) {
                this.activeAccount = this.formatInfo(accounts[0]);
            }
            this.addressBooks = await this.userService.getAddressBook(true);
            this.timeZoneOffet = 0;
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
                            this.timeZoneOffet = geo.rawOffset + geo.dstOffset;
                        }
                    }
                }
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    async updateCart() {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 2000;
        if (!this.quoteOrderDetail) {
            throw new AppError('Failed to load Quote');
        }
        if (this.isQtyZero) {
            const removedItems = this.cartItems.filter(
                (item) => item.quantity === 0
            );
            //remove cart item if qty is zero
            this.cartItems = this.cartItems.filter((item) => item.quantity > 0);
            this._snackBar.open(
                `Removed item(s) ${removedItems
                    .map((item) => item.itemNumber)
                    .join(', ')}`,
                '',
                config
            );
        }
        const body = this.cartItems.map((v) => {
            const items: UpdateQuoteOrderItem = {
                id: v.id,
                itemNumber: v.itemNumber,
                quantity: v.quantity,
                uom: v.uom,
            };

            return items;
        });
        const response = await this.quoteOrder.updateCart(body);
        if (response.success) {
            this._snackBar.open(
                'QuoteOrder updated succesfully',
                'Close',
                config
            );
            await this.ngOnInit();
        }
    }

    async saveOrder(result: string) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 10000;
        const response = await this.userService.saveOrder(result);
        if (response.success) {
            this._snackBar.open(`Created order  ${result}`, 'Close', config);
        }
    }

    openDialogSaveOrder() {
        const dialogRef = this.saveOrderDialog.open(SaveOrderDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            await this.saveOrder(result);
        });
    }

    async addItemsToTemplate(template: TemplateReference) {
        if (!template) {
            return;
        }
        const cartResult = await this.getCartItems();
        const lineItems = cartResult.map((v) => {
            return {
                templateItemId: v.commerceItemId,
                itemNumber: v.catalogRefId,
                unitOfMeasure: v.uom,
                quantity: v.quantity,
            };
        });
        const response = await this.templateService.addTemplateItems(
            template,
            lineItems
        );
        if (response.success) {
            this.userNotifier.itemsAddedToTemplate(lineItems, template);
        }
    }

    async addItemsFromTemplate(template: TemplateReference) {
        try {
            this.loading = true;
            const selectedTemplateDetails =
                await this.templateService.getTemplateDetail(
                    template.templateId || '',
                    template.accountLegacyId || ''
                );
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            if (
                !selectedTemplateDetails ||
                !selectedTemplateDetails.result.templateItems
            ) {
                throw new Error('invalid items');
            }

            const body = this.buildRequest(selectedTemplateDetails);

            const { success, messages } = await this.quoteOrder.addItemsToCart(
                body
            );

            if (!success && messages && messages.length) {
                const { code, type, value } = messages[0];
                const decodedValue = stripTags(value);
                this._snackBar.open(
                    `${code} - ${type} - ${decodedValue}`,
                    'Close',
                    config
                );
            }
            await this.reloadCart();
        } finally {
            this.loading = false;
        }
    }

    buildRequest(selectedTemplateDetails: TemplateDetailResponse): CartItems {
        return {
            accountId: selectedTemplateDetails.result.accountLegacyId,
            addItemCount: selectedTemplateDetails.result.templateItems.length,
            items: selectedTemplateDetails.result.templateItems.map(
                (itemList) => {
                    const item: ItemsEntity = {
                        catalogRefId: itemList.itemNumber,
                        productId: itemList.productOrItemNumber || '',
                        quantity: itemList.quantity || 0,
                        uom: itemList.unitOfMeasure || '',
                        catalogRefIdChanged: false,
                    };
                    return item;
                }
            ),
        };
    }

    myFilter = (d: Date): boolean => {
        const day = d && d.getDay();
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
    openDialogOneItem(element: any) {
        const dialogRef = this.deleteItemDialog.open(DeleteItemDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await this.deleteProduct(element);
            }
        });
    }
    openDialog() {
        const dialogRef = this.saveOrderDialog.open(DeleteDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await this.clearCart();
            }
        });
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
    changeDeliveryethod(value: boolean) {
        this.time = '';
    }
    formatPhoneForApi(phone: string) {
        if (phone && phone.length > 0) {
            phone = phone.replace(
                /^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
                '$1$2$3'
            );
        }
        return phone;
    }

    async deleteProduct(product: CommerceItem) {
        try {
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            this.loading = true;
            const deleteItem: DeleteItemCartRequest = {
                commerceItemId: product.id,
            };
            const response = await this.quoteOrder.removeItemFromCart(
                deleteItem
            );
            if (response.success) {
                this._snackBar.open(
                    `${this.safeHtmlPipe.transform(
                        product.description
                            ? product.description
                            : product.atgItemDescription
                    )} Removed`,
                    'Close',
                    config
                );
            }
        } finally {
            await this.reloadCart(true);
            this.loadCartItemsBegin();
            this.loading = false;
        }
    }
    async clearCart() {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 10000;
        this.loading = true;
        const response = await this.quoteOrder.clearCart();
        await this.reloadCart();
        if (response.success) {
            this._snackBar.open('Shopping Cart Cleared', 'Close', config);
        }
    }
    formatInfo( activeAccount: AccountView ): AccountView {
        const branch = activeAccount.branch;
        if (branch) {
            /*const address = branch.address;*/
            /*if (address) {
                for (const state of this.states) {
                    if (state.key === address.state) {
                        address.state = state.value;
                        address.state = address.state.toUpperCase();
                    }
                }
            }*/
            if (branch.branchPhone) {
                branch.branchPhone = branch.branchPhone.replace(
                    /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                    '$1-$2-$3'
                );
            }
        }

        return activeAccount;
    }

    private async getCartItems() {
        const response = await this.quoteOrder.getCartsItems();
        const { success, message, messages, result } = response;
        if (
            !success &&
            messages &&
            messages.length &&
            messages[0].code === 1001
        ) {
            return [];
        }
        if (!success) {
            throw new ApiError(
                message || 'Unknown error while fetching cart items',
                response
            );
        }
        if (!result) {
            return [];
        }
        return result.items;
    }

    public async addProduct(sel: SkuSelection) {
        try {
            this.loading = true;
            if (sel && sel.sku.itemNumber && this.accountId) {
                const config = new MatSnackBarConfig();
                // check to see if the item already exists in the quote
                if (this.cartItems && this.cartItems.length > 0) {
                    const matchedItem = this.cartItems.find(
                        (i) => i.itemNumber === sel.sku.itemNumber
                    );
                    if (matchedItem) {
                        // If the item already exists in the quote, increment its quantity by 1
                        const matchedIndex =
                            this.cartItems.indexOf(matchedItem);
                        this.cartItems[matchedIndex].quantity =
                            matchedItem.quantity + 1;
                        this._snackBar.open(
                            `Item ${sel.sku.itemNumber} already exists in this quote. Its quantity is increased by 1.`,
                            'Close',
                            config
                        );
                        return;
                    }
                }
                const items: CartItems = {
                    addItemCount: 1,
                    accountId: this.accountId,
                    items: [
                        {
                            catalogRefId: sel.sku.itemNumber,
                            productId: sel.sku.itemNumber,
                            quantity: sel.quantity,
                            uom: sel.uom,
                            catalogRefIdChanged: false,
                        },
                    ],
                };
                const result = await this.quoteOrder.addItemsToCart(items);
                const { success, messages } = result;
                if (!success) {
                    const message = messages
                        ? `${messages[0].type} - ${messages[0].code} ${messages[0].value}`
                        : '';
                    this._snackBar.open(
                        `Error adding cart item ${sel.sku.itemNumber} - ${message} `,
                        'Close',
                        config
                    );
                } else {
                    this._snackBar.open(
                        `Added item ${sel.sku.itemNumber}`,
                        'Close',
                        config
                    );
                }
                await this.reloadCart(true);
                this.loadCartItemsBegin();
            }
        } finally {
            this.loading = false;
        }
    }

    async submitShippingInfo() {
        if (!this.quoteOrderDetail) {
            throw new AppError('Failed to load Quote');
        }

        let shippingAddress;
        let phoneNumber: string;

        if (this.DeliveryMethod) {
            shippingAddress = {
                address1: this.addressBook.addressBookInfo.address1,
                address2: this.addressBook.addressBookInfo.address2,
                address3: null,
                city: this.addressBook.addressBookInfo.city,
                state: this.addressBook.addressBookInfo.state,
                postalCode: this.addressBook.addressBookInfo.postalCode,
                country: this.addressBook.addressBookInfo.country,
            };
            phoneNumber = this.addressBook.addressBookInfo.phoneNumber;
        } else {
            const {
                address1 = '',
                address2 = '',
                city = '',
                state = '',
                postalCode = '',
                country = '',
            } = this.pickupBranch.address || {};
            shippingAddress = {
                address1,
                address2,
                address3: null,
                city,
                state,
                postalCode,
                country,
            };

            phoneNumber = this.pickupBranch.branchPhone || '';
        }

        const request: updateQuoteOrderShippingInfoRequest = {
            id: this.quoteOrderDetail.id,
            deliveryOption: this.DeliveryOpt ? 'scheduled' : 'onHold',
            deliveryDate: moment(this.date).format('MM-DD-YYYY'),
            deliveryTime: this.time,
            shippingMethod: this.DeliveryMethod ? 'Ship_to' : 'Pick_up',
            shippingAddress: shippingAddress,
            contactInfo: {
                firstName: this.addressBook.addressBookInfo.firstName,
                lastName: this.addressBook.addressBookInfo.lastName,
                nickName: this.addressBook.addressBookInfo.nickName,
                phoneNumber: this.formatPhoneForApi(phoneNumber),
            },
            instructions:
                this.orderNotes.length > 234
                    ? this.orderNotes.substring(0, 234)
                    : this.orderNotes,
            branchName: this.pickupBranch.branchName,
        };
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        const response = await this.quoteService.updateQuoteOrderShippingInfo(
            request
        );
        console.log('updateShippingInfo response: ', response);
        if (!response.success) {
            let errorMessage = 'Error updating the shipping info';
            if (response.messages && response.messages.length && response.messages[0].value) {
                errorMessage = response.messages[0].value;
            }
            this._snackBar.open(
                errorMessage,
                'Close',
                config
            );
            this.stepper.selectedIndex = 1;
        } else {
            // Refresh quote order detail
            const quoteDetail = await this.quoteOrder.getQuoteOrder();
            if (!quoteDetail.result) {
                throw new AppError('Failed to load Quote');
            }
            this.quoteOrderDetail = quoteDetail.result;
        }
    }

    async placeOrder() {
        if (!this.quoteOrderDetail) {
            throw new AppError('Failed to load Quote');
        }
        if (this.isQtyZero) {
            await this.updateCart();
        }
        const request: PlaceOrderRequest = {
            orderId: this.quoteOrderDetail.id,
            poName: this.quoteOrderDetail.po,
            jobName: this.job.jobName,
            jobNumber: this.job.jobNumber,
            additionalRecipients: [],
        };
        for (const element of this.words2) {
            request.additionalRecipients.push(element.value);
        }
        if (
            this.jobs.isJobAccountRequired &&
            (request.jobName === null ||
                request.jobName === undefined ||
                request.jobName === '')
        ) {
            const config = new MatSnackBarConfig();
            this._snackBar.open(`Job Name is required`, 'Close', config);
            return;
        }
        if (request.jobName.length > 15 || request.jobNumber.length > 15) {
            const config = new MatSnackBarConfig();
            this._snackBar.open(
                `Job Name cannot be more than 15 characters`,
                'Close',
                config
            );
            return;
        }
        try {
            this.loading = true;
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            const response = await this.quoteService.placeQuoteOrder(request);
            if (response.success) {
                this._snackBar.open(
                    `Quote order placed successfully`,
                    'Close',
                    config
                );
                await this.router.navigate([
                    `/proplus/accounts`,
                    this.accountId,
                    `quotes`,
                ]);
            } else {
                this._snackBar.open(
                    response.messages[0].value,
                    'Close',
                    config
                );
            }
        } finally {
            this.loading = false;
        }
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

    changePickupLocation(store: LocationMarker) {
        this.pickupBranch = store;
    }

    formatPhone(phone: string) {
        if (phone) {
            phone = phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3');
        }
        return phone;
    }

    isBranchSelected(branch: Branch) {
        if (branch.branchNumber === this.pickupBranch.branchNumber) {
            return true;
        }
        return false;
    }

    get canPlaceOrder() {
        const hasAddressBook = this.requiredForms;
        const hasDateAndTime = this.dateAndDate;
        const isShipping = this.DeliveryMethod;
        const selectedDate = this.date;
        const minDate = this.minDate;
        const isScheduled = this.DeliveryOpt;

        // console.log(hasAddressBook, hasDateAndTime, isShipping, selectedDate, minDate, isScheduled)
        if (isShipping && hasDateAndTime) {
        }

        return (
            (!isShipping && !isScheduled) ||
            (!isShipping && hasDateAndTime) ||
            (!isScheduled && hasAddressBook) ||
            (hasAddressBook && hasDateAndTime && selectedDate >= minDate)
        );
    }

    selectJob(jobNumber?: string, jobName?: string) {
        if (!jobNumber) {
            throw new AppError('Unable to load job');
        }

        const jobData = (this.jobs.jobs || []).filter(
            (job: Job) => job.jobNumber === jobNumber
        );
        if (jobData.length === 0) {
            this.job.jobName = jobName || '';
            this.job.jobNumber = jobNumber || '';
        } else {
            this.job.jobName = jobData[0].jobName;
            this.job.jobNumber = jobData[0].jobNumber;
        }
    }

    async createTemplate(templateName: string) {
        const accountId = this.accountId;
        if (accountId === null) {
            throw new Error('No account is selected');
        }
        const cartResult = await this.getCartItems();
        const lineItems = cartResult.map((v) => {
            return {
                itemNumber: v.catalogRefId,
                unitOfMeasure: v.uom,
                quantity: v.quantity,
                color: '',
                MFG: '',
            };
        });
        const templateResponse = await this.templateService.createTemplate({
            templateName: templateName,
            account: accountId,
            items: lineItems,
        });
        if (!templateResponse || !templateResponse.success) {
            if (templateResponse.messages && templateResponse.messages[0]) {
                const errorMessage = templateResponse.messages[0];
                if (errorMessage.value && errorMessage.value.indexOf('duplicate') > -1) {
                    this.userNotifier.alertError(`Template ${templateName} already exists, please enter a different name.`);
                } else {
                    this.userNotifier.alertError(`Error creating template - ${templateName}. ${errorMessage.value}`);
                }
                return;
            } else {
                throw new AppError(`Error creating template - ${templateName}`);
            }
        }
        this.userNotifier.itemsAddedToTemplate(
            lineItems,
            templateResponse.result
        );
    }

    openDialogNewTemplate() {
        const dialogRef = this.newTemplateDialog.open(
            CreateTemplateDialogComponent,
            {}
        );

        dialogRef.afterClosed().subscribe(async (templateName: string) => {
            if (templateName) {
                await this.createTemplate(templateName);
            }
        });
    }

    getImage(item: SuggestiveSellingItem): Image {
        return new Image(item.defaultItem.itemImage, item.productName, true);
    }

    async addToCart(item: SuggestiveSellingItem) {
        await this.quoteOrder.addSingleItemToCart(
            1,
            item.defaultItem.itemNumber,
            item.defaultItem.unitOfMeasure
        );
        await this.reloadCart();
    }

    // Submitter place order
    async placeSubmitterOrder(
        approver: Approver,
        orderName: string,
        request: SubmitterPlaceOrderRequest
    ) {
        try {
            if (orderName) {
                this.loading = true;
                const submitterRequest: SubmitterPlaceOrderRequest = {
                    ...request,
                    savedOrderName: orderName,
                };
                const submitterOrderResponse =
                    await this.quoteService.submitQuoteOrderForApproval(
                        submitterRequest
                    );
                if (
                    submitterOrderResponse.success &&
                    submitterOrderResponse.result &&
                    submitterOrderResponse.result.savedOrderId.length > 0
                ) {
                    this.loading = false;
                    await this.router.navigate([
                        '/proplus/order-for-approval',
                        submitterOrderResponse.result.savedOrderId,
                        'thank-you',
                    ]);
                }
            } else {
                throw new AppError(`order name is missing`);
            }
        } finally {
            this.loading = false;
        }
    }

    // Submitter approver dialog, add savedOrderName
    openDialogueApprove(approver: Approver) {
        if (!this.quoteOrderDetail) {
            throw new AppError('Failed to load Quote');
        }
        const dialogRef = this.saveDialog.open(ApproveDialogueComponent);
        const submitterRequest: SubmitterPlaceOrderRequest = {
            orderId: this.quoteOrderDetail.id,
            poName: this.quoteOrderDetail.po,
            jobName: this.job.jobName,
            jobNumber: this.job.jobNumber,
            additionalRecipients: [],
            savedOrderName: '',
            approverId: approver.id,
        };

        for (const element of this.words2) {
            submitterRequest.additionalRecipients.push(element.value);
        }

        dialogRef.afterClosed().subscribe(async (result) => {
            if (this.isQtyZero) {
                await this.updateCart();
            }
            this.cartService.approverInfo = approver;
            this.placeSubmitterOrder(approver, result, submitterRequest);
        });
    }

    formatState(state: string): string {
        if (state.length <= 2) return state;
        const matchingState = this.states.find(
            (s) => s.value.toLowerCase() === state.toLowerCase()
        );
        if (matchingState) {
            return matchingState.key;
        } else {
            return state;
        }
    }

    async goToCheckout() {
        if (!this.quoteOrderDetail) {
            throw new AppError('Failed to load Quote');
        }
        let saveItems = false;
        if (this.cartItemsBegin && this.cartItemsBegin.length) {
            // compare two arrays if they are different save the changes
            for (let i = 0; i < this.cartItemsBegin.length; i++) {
                const itemNumber = this.cartItemsBegin[i].itemNumber;
                const quantity = this.cartItemsBegin[i].quantity;
                const items = this.cartItems;
                const matches = items.filter(
                    (i) => i.itemNumber === itemNumber
                );
                if (
                    matches &&
                    matches.length > 0 &&
                    quantity !== matches[0].quantity
                ) {
                    saveItems = true;
                }
            }
        }
        if (saveItems) {
            const body = this.cartItems.map((v) => {
                const items: UpdateQuoteOrderItem = {
                    id: v.id,
                    itemNumber: v.itemNumber,
                    quantity: v.quantity,
                    uom: v.uom,
                };

                return items;
            });
            const response = await this.quoteOrder.updateCart(body);
            if (response.success) {
                await this.ngOnInit();
            }
        }
        this.stepper.selectedIndex = 1;
    }

    isQuantityChanged(item: CommerceItem) {
        const matches = this.cartItemsBegin.filter(
            (i) => i.itemNumber === item.itemNumber
        );
        if (matches && matches.length > 0) {
            if (item.quantity !== matches[0].quantity) {
                return true;
            }
        }
        return false;
    }

    loadCartItemsBegin() {
        if (this.quoteOrderDetail) {
            this.cartItemsBegin = this.quoteOrderDetail.commerceItems.map(
                (i) => {
                    return {
                        itemNumber: i.itemNumber,
                        quantity: i.quantity,
                    };
                }
            );
        }
    }
}

export interface Time {
    value: string;
    key: string | number;
}
export interface State {
    value: string;
    key: string;
}

export interface CartItem {
    product: string;
    details: {
        itemOrProductDescription: string;
        catalogRefId: string;
        commerceId: string;
        productId: string;
    };
    price: {
        unitPrice: number;
        uom: string;
    };
    qty: number;
    total: number;
    variations?: Variations;
}

export interface PlaceOrderBase {
    accountId: string;
    job: {
        jobName: string;
        jobNumber: string;
    };
    purchaseOrderNo: string;
    orderStatusCode: string;
    apiSiteId: string;
    lineItems: {
        itemNumber: string;
        quantity: number;
        unitOfMeasure: string;
        description: string;
    }[];
    shipping: {
        shippingMethod: string;
        shippingBranch: string;
        address: {
            address1: string;
            address2: string;
            city: string;
            postalCode: string;
            state: string;
        };
    };
    sellingBranch: string;
    specialInstruction: string;
    checkForAvailability: string;
    pickupDate?: string;
    pickupTime?: string;
    onHold: boolean;
}

export interface UpdateQuoteOrderItem {
    id: string;
    quantity: number;
    itemNumber: string;
    uom: string;
    matchColors?: string;
    matchMFG?: string;
}

export interface PlaceOrderRequest {
    orderId: string;
    poName: string;
    jobName: string;
    jobNumber: string;
    additionalRecipients: string[];
}

export interface SubmitterPlaceOrderRequest extends PlaceOrderRequest {
    savedOrderName: string;
    approverId: string;
}

interface SimpleQuoteItem {
    itemNumber: string;
    quantity: number;
}
