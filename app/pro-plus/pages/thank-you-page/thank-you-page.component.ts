import { AnalyticsService } from '../../../common-components/services/analytics.service';
import {
    SubmitOrderResult,
    Approver,
} from '../../services/shopping-cart-service';
import { UserNotifierService } from '../../../common-components/services/user-notifier.service';
import { TemplatesService } from '../../services/templates.service';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CartStore, CartState } from '../../services/Cart';
import { ProductsService } from '../../services/products.service';
import { TemplateItemView } from '../templates/template-detail-page/template-item-view';
import { map, concatMap, takeWhile, take, filter, tap } from 'rxjs/operators';
import { interval, BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { AppError } from '../../../common-components/classes/app-error';
import { TemplateReference } from '../../model/template-list';
import { ConfirmationProduct } from '../../shared-components/confirm-available-products/confirm-available-products.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateTemplateDialogComponent } from '../templates/template-dialog/create-template-dialog/create-template-dialog.component';
import { SavedOrdersService } from '../../services/saved-orders.service';
import { SavedOrderConfirmationResponse } from '../../services/SavedOrderConfirmationResponse';
import { GetOrderApprovalDetailResponse } from '../../services/GetOrderApprovalDetailResponse';
import { PendingOrdersService } from '../../services/pending-orders.service';

export type ThankYouModel = ReturnType<typeof fromCartState>;

function fromCartState(c: CartState) {
    const o = c.orderResponse;
    const ci = o && o.contactInfo;
    const so = c.submitOrderResult;
    const os = (o && o.orderSummary) || null;
    const sa = (o && o.shippingAddress) || null;
    const atgOrderId = c.atgOrderId;
    return {
        atgOrderId,
        orderId: null as string | null,
        orderResponse: {
            deliveryDate: (o && o.deliveryDate) || null,
            deliveryTime: (o && o.deliveryTime) || null,
            instructions: (o && o.instructions) || null,
            jobName: (o && o.jobName) || null,
            shippingAddress:
                (sa && {
                    approverFirstName: '', // `${sa.approverFirstName} ${sa.approverLastName}`
                    address1: sa.address1,
                    address2: sa.address2,
                    address3: sa.address3,
                    city: sa.city,
                    state: sa.state,
                    postalCode: sa.postalCode,
                    country: sa.country,
                    phoneNumber: formatPhone(sa.phoneNumber),
                }) ||
                null,
            contactInfo: ci || null,
            additionalRecipients: (o && o.additionalRecipients) || null,
            poName: (o && o.poName) || null,
        },
        submitOrderResult: {
            orderNumber: (so && so.orderNumber) || null,
            orderConfirmationTips: (so && so.orderConfirmationTips) || null,
        },
        orderMethod:
            o && o.shippingMethod === 'Pick_up'
                ? 'Pick Up in Store'
                : 'Ship To Address',
        orderOption:
            o && o.deliveryOption === 'onHold'
                ? 'Place Order On Hold'
                : 'Schedule Delivery Or Pick-Up',
        orderOnHold: o && o.deliveryOption === 'onHold',
        getOrderTotal:
            os && os.total ? `$${os.total}` : (os && os.totalMsg) || '',
        items: c.items,
    };
}

export function fromOrderResponse(
    orderId: string,
    o: SavedOrderConfirmationResponse | null,
    so: SubmitOrderResult | null
): ThankYouModel {
    const sa = (o && o.shippingAddress) || null;
    const ci = (o && o.contactInfo) || null;
    return {
        atgOrderId: null,
        orderId: orderId,
        orderResponse: {
            deliveryDate: (o && o.deliveryDate) || null,
            deliveryTime: (o && o.deliveryTime) || null,
            instructions: (o && o.instructions) || null,
            jobName: (o && o.job.jobName) || null,
            shippingAddress:
                (sa && {
                    approverFirstName: '', // `${sa.approverFirstName} ${sa.approverLastName}`
                    address1: sa.address1,
                    address2: sa.address2,
                    address3: sa.address3,
                    city: sa.city,
                    state: sa.state,
                    postalCode: sa.postalCode,
                    country: sa.country,
                    phoneNumber: '',
                }) ||
                null,
            contactInfo: ci || null,
            additionalRecipients: (o && o.emailAddress) || null,
            poName: (o && o.po) || null,
        },
        submitOrderResult: {
            orderNumber: (so && so.orderNumber) || null,
            orderConfirmationTips: (so && so.orderConfirmationTips) || null,
        },
        orderMethod:
            o && o.shippingMethodValue === 'Pick_up'
                ? 'Pick Up in Store'
                : 'Ship To Address',
        orderOption:
            o && o.deliveryOptionValue === 'onHold'
                ? 'Place Order On Hold'
                : 'Schedule Delivery Or Pick-Up',
        orderOnHold:
            o &&
            (o.deliveryOption === 'Place Order On Hold' ||
                o.deliveryOption === 'onHold'),
        getOrderTotal:
            o && o.subTotal ? `$${o.subTotal}` : (o && o.subTotalMsg) || '',
        items: [],
    };
}

export function fromSubmitterOrderResponse(
    orderId: string,
    o: GetOrderApprovalDetailResponse | null
): ThankYouModel {
    const sa = (o && o.shippingAddress) || null;
    const ci = (o && o.contactInfo) || null;
    return {
        atgOrderId: null,
        orderId: orderId,
        orderResponse: {
            deliveryDate: (o && o.deliveryDate) || null,
            deliveryTime: (o && o.deliveryTime) || null,
            instructions: (o && o.instructions) || null,
            jobName: (o && o.job.jobName) || null,
            shippingAddress:
                (sa && {
                    approverFirstName: '', // `${sa.approverFirstName} ${sa.approverLastName}`
                    address1: sa.address1,
                    address2: sa.address2,
                    address3: sa.address3,
                    city: sa.city,
                    state: sa.state,
                    postalCode: sa.postalCode,
                    country: sa.country,
                    phoneNumber: '',
                }) ||
                null,
            contactInfo: ci || null,
            additionalRecipients: (o && o.additionalEmailRecipient) || null,
            poName: (o && o.po) || null,
        },
        submitOrderResult: {
            orderNumber: null,
            orderConfirmationTips: null,
        },
        orderMethod:
            o && o.shippingMethodValue === 'Pick_up'
                ? 'Pick Up in Store'
                : 'Ship To Address',
        orderOption:
            o && o.deliveryOptionValue === 'onHold'
                ? 'Place Order On Hold'
                : 'Schedule Delivery Or Pick-Up',
        orderOnHold: o && o.deliveryOption === 'onHold',
        getOrderTotal: o && o.subTotal ? `$${o.subTotal}` : '',
        items: [],
    };
}

@Component({
    selector: 'app-thank-you-page',
    templateUrl: './thank-you-page.component.html',
    styleUrls: ['./thank-you-page.component.scss'],
})
export class ThankYouPageComponent implements OnInit, OnDestroy {
    // orderDetailResponse: OrderDetailResponseV2 | null = null;
    // orderDate = '';
    // orderNote: string | null = null;
    loading!: boolean;
    cart!: CartStore;
    lineItems$ = new BehaviorSubject<TemplateItemView[]>([]);
    templateList?: TemplateReference[];
    accountId = '0';
    orderId: string | null = null;
    submitterOrderId: string | null = null;
    viewModel$ = new ReplaySubject<ThankYouModel>(1);
    statusFetcher?: Subscription;
    clearCartAffect?: Subscription;
    approverInfo: Approver = {
        id: '',
        email: '',
        firstName: '',
        lastName: '',
    };
    isApprover: boolean = true;
    isSubmitForpprover: boolean = true;

    constructor(
        private readonly productService: ProductsService,
        private readonly user: UserService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly cartService: ShoppingCartService,
        private readonly productsService: ProductsService,
        private readonly templateService: TemplatesService,
        private readonly userNotifier: UserNotifierService,
        private readonly savedOrdersService: SavedOrdersService,
        private readonly newTemplateDialog: MatDialog,
        private readonly analyticsService: AnalyticsService,
        private readonly pendingOrderService: PendingOrdersService
    ) {}

    get getterIsApprover() {
        return this.isApprover;
    }
    get getterIsSubmitForApprover() {
        return this.isSubmitForpprover;
    }

    // these items can be exposed like this and bound to the html w/ async
    public isSubmitForApprover$ = this.pendingOrderService.isSubmitForApprover$;
    public isApprover$ = this.pendingOrderService.isApprover$;

    async ngOnInit() {
        try {
            this.loading = true;
            await this.user.getSessionInfo();
            const account = this.user.session;
            const accountId = (account && account.accountIdInString) || null;

            // based on the methods, this getApproverPermissions call appears to be
            // calling another method to update the user info for the subsequent subscriptions to
            // set: isApprover and isSubmitForpprover.
            // I updated the service to handle that without a preliminary call. Simply requesting the data will fetch it.
            // I set up a couple of observables above and added some markup to the template to use them.
            // I didn't change any of the current functionality
            this.pendingOrderService.getApproverPermissions();
            this.pendingOrderService.getUserOrderCredentials();
            this.pendingOrderService.isApprover$.subscribe(
                (v) => (this.isApprover = v)
            );
            this.pendingOrderService.isSubmitForApprover$.subscribe(
                (v) => (this.isSubmitForpprover = v)
            );
            if (this.cartService.approverInfo) {
                this.approverInfo = this.cartService.approverInfo;
            }
            if (!accountId) {
                await this.router.navigateByUrl('/proplus/login');
                return;
            }
            this.accountId = accountId;

            const queryParams = this.route.snapshot.params;
            const orderId = tryGetString(queryParams['savedOrderId']);
            const submitterOrderId = tryGetString(
                queryParams['submitterOrderId']
            );
            this.orderId = orderId;
            this.submitterOrderId = submitterOrderId;

            if (!!orderId) {
                await this.loadOrder(orderId);
            } else if (!!submitterOrderId) {
                await this.loadSubmitterOrder(submitterOrderId);
            } else {
                this.loadCart();
            }

            await this.loadTemplates(accountId);
            if (!submitterOrderId) {
                this.statusFetcher = this.kickoffFetchOrderNum();
            }
        } finally {
            // TIM/CHEN REVIEW
            // please review - this doesn't appear to be doing anything
            // this.viewModel$.subscribe((x) => {
            //     // ({ x });
            // });
            // ('approverlist:', this.cartService.getApproverList());
            this.loading = false;
        }
    }

    private async loadOrder(orderId: string) {
        await this.cartService.getSubmitOrderResult('', orderId);
        const orderConfirmation =
            this.savedOrdersService.getSavedOrderConfirmationInfo({
                id: orderId,
            });
        this.clearCartAffect = this.cartService.cart$
            .getState()
            .pipe(
                map((c) => {
                    const submitOrderResult = c.submitOrderResult;
                    orderConfirmation
                        .pipe(
                            map((o) =>
                                fromOrderResponse(
                                    orderId,
                                    o.result,
                                    submitOrderResult
                                )
                            )
                        )
                        .subscribe((data) => {
                            this.viewModel$.next(data);
                        });
                })
            )
            .subscribe();

        orderConfirmation
            .pipe(
                map((r) => {
                    return (
                        (r && r.result && r.result.commerceItems) ||
                        []
                    ).map((i) =>
                        TemplateItemView.fromCommerceItem(
                            this.productService,
                            i
                        )
                    );
                })
            )
            .subscribe((lines) => {
                this.lineItems$.next(lines);
            });
    }

    private async loadSubmitterOrder(orderId: string) {
        const orderConfirmation =
            this.savedOrdersService.getOrderApprovalDetail(orderId);
        orderConfirmation
            .pipe(map((c) => fromSubmitterOrderResponse(orderId, c.result)))
            .subscribe(this.viewModel$);

        orderConfirmation
            .pipe(
                map((r) => {
                    return (
                        (r && r.result && r.result.commerceItems) ||
                        []
                    ).map((i) =>
                        TemplateItemView.fromCommerceItem(
                            this.productService,
                            i
                        )
                    );
                })
            )
            .subscribe((lines) => {
                this.lineItems$.next(lines);
            });
    }

    private loadCart() {
        const cart = this.cartService.cart$;
        this.cartService.cart$
            .getState()
            .pipe(map(fromCartState))
            .subscribe(this.viewModel$);
        cart.getState()
            .pipe(
                map((r) => {
                    return (
                        (r && r.orderResponse && r.orderResponse.items) ||
                        []
                    ).map((i) =>
                        TemplateItemView.fromOrderResponseItem(
                            this.productService,
                            i
                        )
                    );
                })
            )
            .subscribe((lines) => {
                this.lineItems$.next(lines);
            });
    }

    ngOnDestroy() {
        const statusFetcher = this.statusFetcher;
        const clearCartAffect = this.clearCartAffect;
        if (statusFetcher) {
            statusFetcher.unsubscribe();
            this.statusFetcher = undefined;
        }
        if (clearCartAffect) {
            clearCartAffect.unsubscribe();
            this.clearCartAffect = undefined;
        }
    }
    private async loadTemplates(accountId: string) {
        const templateResult = await this.templateService.getTemplatesByAccount(
            accountId
        );
        const templateList =
            (templateResult &&
                templateResult.result &&
                templateResult.result.templates) ||
            [];
        templateList.sort((a, b) => {
            if (a.templateName === b.templateName) {
                return 0;
            } else if (a.templateName < b.templateName) {
                return -1;
            } else {
                return 1;
            }
        });
        // tslint:disable-next-line: no-floating-promises
        this.templateList = templateList;
    }

    kickoffFetchOrderNum() {
        const orderId = this.orderId;
        const source = this.viewModel$.pipe(
            filter((c) => !!c.atgOrderId || !!orderId),
            take(1),
            concatMap((c) => {
                let orderNotProcessed = true;
                return interval(5000).pipe(
                    concatMap((x) => {
                        if (!!orderId) {
                            return this.cartService.getSubmitOrderResult(
                                '',
                                orderId
                            );
                        } else {
                            const result =
                                this.cartService.getSubmitOrderResult(
                                    c.atgOrderId || '',
                                    ''
                                );
                            return result;
                        }
                    }),
                    tap((t) => {
                        if (t.orderNumber && orderNotProcessed) {
                            const x = {
                                orderNumber: t.orderNumber,
                                revenue: c.getOrderTotal,
                                products: c.items.map((m) => {
                                    const items = {
                                        id: m.catalogRefId,
                                        name: m.itemOrProductDescription,
                                        price: m.unitPrice,
                                        quantity: m.quantity,
                                        variant: m.vendorColorId, //try to get variant name
                                    };
                                    return items;
                                }),
                            };
                            this.analyticsService.placeOrder(x);
                            orderNotProcessed = false;
                        }
                    }),
                    takeWhile((r) => {
                        return !r.orderNumber;
                    }),
                    take(24)
                );
            })
        );
        return source.subscribe();
    }

    async addItemsToTemplate(selectedTemplate: TemplateReference) {
        const orderItems = this.lineItems$.value;
        if (!orderItems || !orderItems.length) {
            return;
        }
        await this.addLineItemsToTemplate(orderItems, selectedTemplate);
    }

    private async addLineItemsToTemplate(
        orderItems: TemplateItemView[],
        selectedTemplate: TemplateReference
    ) {
        const items = orderItems.map((v) => {
            const item: ConfirmationProduct = {
                itemNumber: v.itemNumber,
                name: v.itemOrProductDescription || '',
                prodUrl: this.getProdUrl(v),
                productId: v.productOrItemNumber,
                productImageUrl: (v.imageUrl && v.imageUrl.thumbnail) || '',
            };

            return item;
        });
        await this.productsService.checkProductsBeforeAdding(
            items,
            'Template',
            async (itemToAdd) => {
                const itemSetToAdd = new Set(itemToAdd);
                const lineItems = orderItems
                    .filter((v) => itemSetToAdd.has(v.itemNumber))
                    .map((v) => {
                        return {
                            templateItemId: v.productOrItemNumber,
                            itemNumber: v.itemNumber,
                            unitOfMeasure: v.unitOfMeasure,
                            quantity: v.quantity,
                        };
                    });

                if (lineItems) {
                    const response =
                        await this.templateService.addTemplateItems(
                            selectedTemplate,
                            lineItems
                        );
                    if (response.success) {
                        this.userNotifier.itemsAddedToTemplate(
                            lineItems,
                            selectedTemplate
                        );
                    }
                } else {
                    throw new AppError('couldnt add items');
                }
            }
        );
    }

    async navigateHome() {
        await this.router.navigateByUrl('/proplus');
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

    public getProdUrl(lineItem: TemplateItemView) {
        if (lineItem && lineItem.productOrItemNumber && lineItem.itemNumber) {
            return [
                '/productDetail',
                lineItem.productOrItemNumber,
                lineItem.itemNumber,
            ];
        }
        if (lineItem && lineItem.productOrItemNumber) {
            return ['/productDetail', lineItem.productOrItemNumber];
        }
        return [];
    }

    async createTemplate(templateName: string) {
        const accountId = this.accountId;
        if (!accountId) {
            throw new Error('No account is selected');
        }

        const orderLineItems = this.lineItems$.value;
        if (!orderLineItems || !orderLineItems.length) {
            return;
        }
        await this.createTemplateFromItems(
            orderLineItems,
            templateName,
            accountId
        );
    }

    private async createTemplateFromItems(
        orderLineItems: TemplateItemView[],
        templateName: string,
        accountId: string
    ) {
        const items = orderLineItems.map((v) => {
            const item: ConfirmationProduct = {
                itemNumber: v.itemNumber,
                name: v.itemOrProductDescription || '',
                prodUrl: this.getProdUrl(v),
                productId: v.productOrItemNumber,
                productImageUrl: (v.imageUrl && v.imageUrl.thumbnail) || '',
            };

            return item;
        });
        await this.productsService.checkProductsBeforeAdding(
            items,
            'Template',
            async (itemToAdd) => {
                const itemSetToAdd = new Set(itemToAdd);

                const lineItems = orderLineItems
                    .filter((v) => itemSetToAdd.has(v.itemNumber))
                    .map((v) => {
                        return {
                            templateItemId: v.productOrItemNumber,
                            itemNumber: v.itemNumber,
                            unitOfMeasure: v.unitOfMeasure,
                            quantity: v.quantity,
                        };
                    });
                const templateResponse =
                    await this.templateService.createTemplate({
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
                        throw new AppError(
                            `Error creating template - ${templateName}`
                        );
                    }
                }
                this.userNotifier.itemsAddedToTemplate(
                    lineItems,
                    templateResponse.result
                );
            }
        );
    }
}

// tslint:disable-next-line: no-any
function tryGetString(value: any) {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' && !isNaN(value)) {
        return value.toString();
    }
    return null;
}

function formatPhone(phone: string) {
    if (phone) {
        return phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3');
    }
    return phone;
}
