import { AppError } from './../../../common-components/classes/app-error';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import {
    UserService,
    DeleteItemCartRequest,
    UpdateCartRequest,
} from '../../services/user.service';
import { AllPermissions } from '../../services/UserPermissions';
import { CurrentUser } from '../../model/get-current-user-response';
import { JobsResponse } from '../../model/jobs-response';
import { Job, noJob } from '../../model/job';
import { Router } from '@angular/router';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { SaveOrderDialogComponent } from './save-order-dialog/save-order-dialog.component';
import { TemplateListResponse } from '../../model/template-list-response';
import { TemplatesService } from '../../services/templates.service';
import { TemplateReference } from '../../model/template-list';
import {
    ShoppingCartService,
    CartItems,
    ItemsEntity,
    CartItemV2,
} from '../../services/shopping-cart-service';
import { CartStore } from '../../services/Cart';
import { SkuSelection } from '../../shared-components/sku-selector/sku-selector.component';
import { TemplateDetailResponse } from '../../model/template-detail-response';
import { AttributeValues } from '../../model/attribute-values';
import { stripTags } from '../../../common-components/classes/html-utilities';
import { CreateTemplateDialogComponent } from '../templates/template-dialog/create-template-dialog/create-template-dialog.component';
import {
    ProductsService,
    SuggestiveSellingItem,
} from '../../services/products.service';
import { Observable } from 'rxjs';
import { Image } from '../../../global-classes/image';
import { MyErrorStateMatcher } from './MyErrorStateMatcher';
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
import { ProplusUrls } from '../../../enums/proplus-urls.enum';
import { ProPlusApiBase } from '../../services/pro-plus-api-base.service';
import { debounceTime } from 'rxjs/operators';
import { SavedOrdersService } from '../../services/saved-orders.service';
import { CommerceItem } from '../../services/GetOrderApprovalDetailResponse';

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
    selector: 'app-shopping-cart',
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.scss'],
})
export class ShoppingCartComponent implements OnInit {
    @Input() checked = true;
    loading = true;
    successMsg = false;
    matcher = new MyErrorStateMatcher();
    public suggestedProds$: Observable<SuggestiveSellingItem[]>;
    cart: CartStore;
    permissions: AllPermissions;
    get cartTotalDataSource() {
        return this.cart.value.summary || [];
    }

    displayedColumns = [
        'product',
        'details',
        'price',
        'qty',
        'total',
        'action',
    ];
    dislplayColumnTotal = ['orderSummary', 'empty'];
    currentUser!: CurrentUser;
    get accountId() {
        if (this.userService.accountIdInString) {
            return this.userService.accountIdInString;
        } else {
            return null;
        }
    }
    saveOrderName = '';
    public showMore: { productId: string; show: boolean }[] = [];
    private _job: Job = noJob;
    //  TODO - We need to populate the list based on whether the user has a job or not
    jobInfo!: Promise<JobsResponse>;
    templates!: TemplateListResponse;
    templateList: TemplateReference[] = [];
    templateSelect: TemplateReference | null = null;
    selectedJobName = 'Select Job Account';
    atgOrderId = '';
    locationValidMsg = '';
    userPerm?: AllPermissions;

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
                value: this.currencyPipe.transform(summary.otherCharges, 'USD'),
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

    get userPermPlaceOrder() {
        if (this.userPerm && this.userPerm.order) {
            if (
                this.userPerm.order.submit ||
                this.userPerm.order.submitForApproval
            ) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        public templateService: TemplatesService,
        public deleteItemDialog: MatDialog,
        public saveOrderDialog: MatDialog,
        public newTemplateDialog: MatDialog,
        private readonly router: Router,
        private readonly userService: UserService,
        private readonly cartService: ShoppingCartService,
        private readonly productsService: ProductsService,
        private readonly currencyPipe: CurrencyPipe,
        private readonly userNotifier: UserNotifierService,
        private readonly api: ProPlusApiBase,
        private readonly savedOrdersService: SavedOrdersService
    ) {
        this.cart = this.cartService.cart$;
        // tslint:disable-next-line: no-floating-promises
        this.cartService.getCartsItems();
        this.suggestedProds$ = this.cartService.suggestedProducts$;
        this.permissions = this.api.permissions;
        this.api.userSession.pipe(debounceTime(500)).subscribe((u) => {
            if (!u.permissions.price) {
                this.displayedColumns = [
                    'product',
                    'details',
                    'price',
                    'qty',
                    'action',
                ];
            }
            this.permissions = u.permissions;
        });
    }

    async ngOnInit() {
        // summary tax
        /* TODO Remove if not needed */
        this.cart.getState().subscribe((car) => {});

        try {
            this.loading = true;
            this.userPerm = await this.userService.getCurrentUserPermission();
            await this.loadUserInfo();
            await this.cartService.reloadCart();
            this.loading = false;
            // tslint:disable-next-line: no-floating-promises
            this.loadTemplates();

            if (
                this.cart.value.lastSelectedJob &&
                this.cart.value.lastSelectedJob.jobNumber &&
                this.cart.value.lastSelectedJob.jobName
            ) {
                this.selectJob(this.cart.value.lastSelectedJob, false);
            }
        } finally {
            this.loading = false;
        }
    }

    // async getCartItemsDetail(cartItems: CartItem[]) {
    //   const newItems = cartItems.map(async (element: CartItem) => {
    //     const itemVariation = await this.productsService.getItemDetails({ productId: element.details.productId });
    //     if (!itemVariation) { return element; }
    //     return { ...element, variations: itemVariation.variations };
    //   });
    //   this.cartItems.next(await Promise.all(newItems));
    // }

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
        const currentUser = this.api.userSession.value.sessionInfo;
        if (!currentUser) {
            throw new Error('Failed to get user info');
        }
        this.currentUser = currentUser;
        const alertUser = true;
        this.jobInfo = this.userService
            .getUserJobs(alertUser, undefined, false)
            .then((j) => {
                return j;
            });
    }

    private async loadTemplates() {
        const accountId = this.accountId;
        if (!accountId) {
            throw new AppError('No account is selected');
        }
        this.templates = await this.templateService.getTemplatesByAccount(
            accountId
        );
        const templateList = (this.templates.result.templates || []).filter(
            (t) => t.accountLegacyId === accountId
        );
        templateList.sort((x, y) => {
            const xVal = x.templateName || '';
            const yVal = y.templateName || '';
            if (xVal === yVal) {
                return 0;
            } else if (xVal > yVal) {
                return 1;
            } else {
                return -1;
            }
        });
        this.templateList = templateList;
    }

    async updateCart() {
        try {
            this.loading = true;
            const response = await this.saveCart();
            if (response.success) {
                this.userNotifier.alertError('Cart updated succesfully');
            }
        } finally {
            this.loading = false;
        }
    }

    private async saveCart() {
        const body: UpdateCartRequest[] = this.cart.value.items.map((v) => {
            return {
                commerceItemId: v.commerceItemId,
                quantity: v.quantity,
            };
        });
        let emptyItems = false;
        const filteredBody = body.filter((v) => {
            if (v.quantity === 0) {
                emptyItems = true;
            }
            return v.quantity > 0;
        });

        if (emptyItems) {
            this.userNotifier.alertError(
                `Items with quantity 0 will be disregrded from the cart`
            );
        }
        let response;
        if (filteredBody.length !== 0) {
            response = await this.cartService.updateCart(body);
        } else {
            throw new AppError('No items in cart');
        }
        if (!response) {
            throw new AppError('Failed to save your cart - please try again');
        }
        return response;
    }

    buildRequestFromSavedOrderItems(lineItems: CommerceItem[]): CartItems {
        if (!this.accountId) {
            throw new AppError('Invalid account');
        }

        return {
            addItemCount: lineItems.length,
            accountId: this.accountId,
            items: lineItems.map((line) => {
                const item: ItemsEntity = {
                    catalogRefId: line.itemNumber,
                    productId: line.productId,
                    quantity: line.quantity,
                    uom: line.uom,
                    catalogRefIdChanged: false,
                };
                return item;
            }),
        };
    }

    async saveOrder(result: string, action: string) {
        try {
            const response = await this.userService.saveOrder(result);
            if (response.success) {
                if (action === 'emptyCart') {
                    this.cartService.reloadCart();
                    this.userNotifier.alertError(`Created order  ${result}`);
                } else {
                    if (response.result && response.result.savedOrderId) {
                        const savedOrderId = response.result.savedOrderId;
                        const savedOrderResponse =
                            await this.savedOrdersService.getOrderApprovalDetailPromise(
                                savedOrderId
                            );
                        if (savedOrderResponse.success) {
                            const items =
                                savedOrderResponse.result.commerceItems;
                            if (items) {
                                const body =
                                    this.buildRequestFromSavedOrderItems(items);
                                const addToCartResult =
                                    await this.cartService.addItemsToCartFromOrder(
                                        body
                                    );
                                if (
                                    addToCartResult &&
                                    addToCartResult.addedToCartItems
                                ) {
                                    this.cartService.reloadCart();
                                    this.userNotifier.alertError(
                                        'Your order has been saved, click on “My Account” and “Saved Orders” to access your saved order.'
                                    );
                                }
                            }
                        }
                    }
                }
            }
        } catch (err: any) {
            this.userNotifier.alertError(err.message);
        }
    }

    async openDialogSaveOrder() {
        const dialogRef = this.saveOrderDialog.open(SaveOrderDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result && result.orderName) {
                await this.saveOrder(result.orderName, result.action);
                if (result.action === 'emptyCart') {
                    await this.router.navigate(['/proplus/saved-orders']);
                }
            }
            // console.log(`Dialog result: ${result}`);
        });
    }

    async addItemsToTemplate(template: TemplateReference) {
        const selectedTemplate = template;
        if (!selectedTemplate) {
            return;
        }
        const cartResult = await this.cart.value.items;
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
            if (
                !selectedTemplateDetails ||
                !selectedTemplateDetails.result.templateItems
            ) {
                throw new Error('invalid items');
            }
            //  TODO - If the template item qty is zero, let's default it to one.
            //  If nothing is going to be added to the cart, let the user know why.

            if (selectedTemplateDetails.result.templateItems.length === 0) {
                this.userNotifier.alertError(
                    `Cannot pick items from template, ${selectedTemplateDetails.result.templateName}, because it is empty`
                );
            } else {
                const products =
                    selectedTemplateDetails.result.templateItems.map((item) => {
                        const prod = {
                            name: item.itemOrProductDescription || '',
                            productId: item.productOrItemNumber || '',
                            itemNumber: item.itemNumber,
                            prodUrl: this.getProdUrl(
                                item.productOrItemNumber,
                                item.itemNumber
                            ),
                            productImageUrl: item.productImageUrl,
                            unitOfMeasure: item.unitOfMeasure || '',
                            quantity: item.quantity || 0,
                        };
                        return prod;
                    });
                await this.productsService.checkProductsBeforeAdding(
                    products,
                    'Cart',
                    async (itemToAdd) => {
                        const itemSetToAdd = new Set(itemToAdd);
                        const items = products
                            .filter((v) => itemSetToAdd.has(v.itemNumber))
                            .map((v) => {
                                const item: ItemsEntity = {
                                    catalogRefId: v.itemNumber,
                                    productId: v.productId,
                                    quantity:
                                        v.quantity === 0 ? 1 : v.quantity || 1,
                                    uom: v.unitOfMeasure,
                                    catalogRefIdChanged: false,
                                };
                                return item;
                            });

                        const body = this.buildRequest(
                            selectedTemplateDetails,
                            items
                        );
                        if (!body.items) {
                            this.userNotifier.alertError(
                                `Cannot pick items from template, ${selectedTemplateDetails.result.templateName}, because it is empty`
                            );
                        } else {
                            const ItemsWithNonZeroQuantity = body.items.filter(
                                (i) => i.quantity > 0
                            );
                            if (ItemsWithNonZeroQuantity.length === 0) {
                                const templateName =
                                    selectedTemplateDetails.result.templateName;
                                this.userNotifier.alertError(
                                    `Cannot pick items from template, ${templateName}, all items with 0 quantity`
                                );
                            } else {
                                const { success, messages } =
                                    await this.cartService.addItemsToCart(body);

                                if (!success && messages && messages.length) {
                                    const { code, type, value } = messages[0];
                                    const decodedValue = stripTags(value);
                                    this.userNotifier.alertError(
                                        `${code} - ${type} - ${decodedValue}`
                                    );
                                } else {
                                    this.userNotifier.alertError(
                                        `Template ${selectedTemplateDetails.result.templateName} was added to your cart.`
                                    );
                                }
                            }
                        }
                    }
                );
            }
        } finally {
            this.loading = false;
        }
    }

    buildRequest(
        selectedTemplateDetails: TemplateDetailResponse,
        items: ItemsEntity[]
    ): CartItems {
        return {
            accountId: selectedTemplateDetails.result.accountLegacyId,
            addItemCount: selectedTemplateDetails.result.templateItems.length,
            items: items,
        };
    }

    async deleteOneItem(element: CartItemV2): Promise<void> {
        try {
            this.loading = true;
            if (this.cart.value.items.length > 1) {
                // if number of items in the cart is greater than one the cart needs to be saved
                await this.saveCart();
            }
            await this.deleteProduct(element);
        } finally {
            this.loading = false;
        }
    }
    eraseCart() {
        console.log('erase.....');
        const dialogRef = this.saveOrderDialog.open(DeleteDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await this.clearCart();
            }
        });
    }

    async deleteProduct(product: CartItemV2) {
        try {
            this.loading = true;
            let itemToDelete = product.commerceItemId;
            let itemName = product.itemOrProductDescription;
            //  If the product doesn't have a commerceId, let's get it
            if (!itemToDelete) {
                const items = this.cart.value.items;
                if (!items) {
                    this.userNotifier.alertError(`Nothing to delete`);
                    return;
                }
                for (const item of items) {
                    if (item.catalogRefId === product.catalogRefId) {
                        itemToDelete = item.commerceItemId;
                        itemName = item.itemOrProductDescription;
                    }
                }
            }
            const deleteItem: DeleteItemCartRequest = {
                commerceItemId: itemToDelete,
            };
            const response = await this.cartService.removeItemFromCart(
                deleteItem
            );
            if (response.success) {
                this.userNotifier.alertError(`${itemName} Removed`);
            }
        } finally {
            this.loading = false;
        }
    }
    async clearCart() {
        try {
            this.loading = true;
            await this.cartService.clearCart();
            // UPDATE update cart service
            this.cartService.clearCartCnt();
            this.userNotifier.alertError('Shopping Cart Cleared');
        } finally {
            this.loading = false;
        }
    }

    public async addProduct(sel: SkuSelection) {
        /* Don't show cart preview from cart */
        this.cartService.handleCartPreview('none');
        try {
            this.loading = true;
            if (this.cart.value.items.length > 0) {
                // Don't save the cart if the cart is currently empty.
                // Otherwise api error will occur and item cannot be added to the cart.
                await this.saveCart();
            }
            if (sel && sel.sku.itemNumber && this.accountId) {
                const x = sel.sku.getSelection();
                const items: CartItems = {
                    addItemCount: 1,
                    accountId: this.accountId,
                    items: [
                        {
                            catalogRefId: sel.sku.itemNumber,
                            productId: sel.productId.toString(),
                            quantity: sel.quantity,
                            uom: sel.uom,
                            catalogRefIdChanged: false,
                            name: sel.sku.skuShortDesc,
                            price: sel.sku.unitPrice,
                            variation: x,
                        },
                    ],
                };
                const result = await this.cartService.addItemsToCart(items);
                const { success, messages } = result;
                if (!success) {
                    const message = messages
                        ? `${messages[0].type} - ${messages[0].code} ${messages[0].value}`
                        : '';
                    this.userNotifier.alertError(
                        `Error adding cart item ${sel.sku.itemNumber} - ${message}`
                    );
                } else {
                    this.userNotifier.alertError(
                        `Added item ${sel.sku.itemNumber}`
                    );
                }
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

    async selectJob(job?: Job, notifyUser?: boolean) {
        //  Set default values up top
        job = job || noJob;
        //  Don't update if it's the same job
        if (this._job.jobNumber === job.jobNumber) {
            return;
        }
        this.selectedJobName = job.jobName;
        this._job = job;
        if (job.jobNumber) {
            await this.cartService.updateCurrentOrderJobNumber(job.jobNumber);
            if (notifyUser) {
                const message = `Job Account successfully set to ${job.jobName}`;
                this.userNotifier.alertError(message);
            }
        }
    }

    async createTemplate(templateName: string) {
        const accountId = this.accountId;
        if (accountId === null) {
            throw new Error('No account is selected');
        }
        const cartResult = this.cart.value.items;
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
                throw new AppError( `Error creating template - ${templateName}` );
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
        await this.cartService.addSingleItemToCart(
            1,
            item.defaultItem.itemNumber,
            item.defaultItem.unitOfMeasure
        );
    }

    async proceedToCheckout() {
        const response = await this.cartService.proceedToCheckout();
        const { messages, success } = response;
        if (success) {
            return success;
        }
        if (messages && messages.length) {
            const { code, type, value } = messages[0];
            //  Skip if we have a NullOrderPriceInfo response
            if (value === 'NullOrderPriceInfo') {
                return true;
            }
            const decodedValue = stripTags(value);
            this.userNotifier.alertError(`${code} - ${type} - ${decodedValue}`);
        } else {
            this.userNotifier.alertError(
                'Unknown error while proceed to checkout'
            );
        }
        return false;
    }

    public getPrdImageUrl(imageUrl: string) {
        if (!imageUrl) {
            return '';
        }
        return `${ProplusUrls.root}${imageUrl}`;
    }

    public getProdUrl(productId?: string, itemNumber?: string) {
        if (productId && itemNumber) {
            return ['/productDetail', productId, itemNumber];
        }
        if (productId) {
            return ['/productDetail', productId];
        }
        return [];
    }

    public async goToCheckoutPage() {
        try {
            this.loading = true;
            const response = await this.saveCart();
            if (response && (await this.proceedToCheckout())) {
                await this.router.navigateByUrl('/proplus/shipping-info');
            }
        } finally {
            /* TODO see if conditions need to be applied here | Analytics Proceed to Checkout */
            // this.analyticService.proceedToCheckout(this.cartService.cart$);
            this.loading = false;
        }
    }
}

export interface State {
    value: string;
    key: string;
}
