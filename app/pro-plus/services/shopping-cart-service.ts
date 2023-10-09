import { OrderHistoryService } from './order-history.service';
// import { AnalyticsService } from './../../common-components/services/analytics.service';
import he from 'he';
import {
    ProPlusApiBase,
    ApiResponse,
    isApiResponse,
} from './pro-plus-api-base.service';
import {
    BasicResponse,
    DeleteItemCartRequest,
    UpdateCartRequest,
    UserService,
    Message,
} from './user.service';
import { Injectable } from '@angular/core';
import { PlaceOrderBase } from '../pages/shopping-cart/shopping-cart.component';
import {
    AppError,
    ApiError,
    ForbiddenError,
} from '../../common-components/classes/app-error';
import { stripTags } from '../../common-components/classes/html-utilities';
import { Job } from '../model/job';
import { ProductsService, SuggestiveSellingItem } from './products.service';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { CartStore } from './Cart';
import { debounceTime, map } from 'rxjs/operators';
import { GetOrderShippingInfoResponse } from './GetOrderShippingInfoResponse';
import { ContactInfo } from './GetOrderApprovalDetailResponse';
import { AddOrderShippingInfoRequest } from './AddOrderShippingInfoRequest';
import { SimpleStore } from '../stores/simple-store';
import {
    createShippingStore,
    ShippingInfoStore,
} from '../stores/shipping-info-store';
import { UserNotifierService } from '../../common-components/services/user-notifier.service';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/common-components/services/analytics.service';

@Injectable({
    providedIn: 'root',
})
export class ShoppingCartService {
    public cart$ = new CartStore();
    public cartPreview$ = new BehaviorSubject<string>('none');
    private cartCnt = new BehaviorSubject<number>(0);
    public cartCnt$ = this.cartCnt.asObservable();

    public approverInfo?: Approver;
    public readonly shippingStore: ShippingInfoStore;
    suggestedProducts$ = new BehaviorSubject<SuggestiveSellingItem[]>([]);
    public readonly orderShippingInfo =
        new SimpleStore<GetOrderShippingInfoResponse>();
    constructor(
        private readonly api: ProPlusApiBase,
        private readonly userService: UserService,
        private readonly userNotification: UserNotifierService,
        private readonly router: Router,
        private readonly productsService: ProductsService,
        private readonly analyticService: AnalyticsService,
        private readonly orderHistoryService: OrderHistoryService
    ) {
        this.shippingStore = createShippingStore();

        this.api.userSession.pipe(debounceTime(500)).subscribe((u) => {
            if (!u.isLoggedIn) {
                return;
            }

            // tslint:disable-next-line: no-floating-promises
            this.reloadCart();
        });
    }

    async switchAccount(
        account: { accountLegacyId?: string; accountName?: string },
        url: string[] = ['/proplus'],
        title?: string,
        message?: string
    ) {
        const currAcct = (this.api.userSession.value.accountId || 0).toString();

        if (currAcct === account.accountLegacyId) {
            await this.router.navigate(url);
            return;
        }

        if (!this.cart$.value.items.length) {
            await this.doCartSwitch(account, url);
            console.log('SwitchAccount.....');
            return;
        }

        this.userNotification.askUserToConfirm({
            title: title || 'Warning',
            question:
                message ||
                'You have items in your cart. If you switch accounts, you will lose your cart. Do you want to proceed?',
            whenYes: async () => {
                await this.doCartSwitch(account, url);
            },
        });
    }

    // This method would also have to moved to the service.
    private async doCartSwitch(
        account: { accountLegacyId?: string; accountName?: string },
        url: string[]
    ) {
        const accountId = account.accountLegacyId;
        const accountName = account.accountName;
        const response = await this.userService.switchAccount(accountId || '');

        if (response) {
            this.userNotification.alertError(
                `Switched to Account ${accountName}`
            );
            // The path we're passing in may need to become a method parameter (we can default it to /proplus)
            // We could also add the parameter to switchAccount.
            await this.router.navigate(url);
            this.cartCnt.next(0);
        }
    }

    public async clearCart(): Promise<void> {
        try {
            const { ok, body } = await this.api.postV2<BasicResponse>(
                'clearCart',
                {}
            );
            this.clearCartCnt();
            if (!ok || !body) {
                throw new Error('Failed to clear shopping cart');
            }
            this.reloadCart();
        } catch (err) {
            // tslint:disable-next-line: no-floating-promises
            this.reloadCart();
            throw err;
        }
    }

    public clearCartCnt() {
        console.log('clear cartCnt.......');
        this.cartCnt.next(0);
    }
    public async getSubmitOrderResult(
        orderId: string,
        savedOrderId: string
    ): Promise<SubmitOrderResult> {
        const { ok, body } = await this.api.postV2<
            ApiResponse<SubmitOrderResult>
        >('getSubmitOrderResult', { orderId, savedOrderId });
        if (!ok || !body) {
            throw new Error('Failed to get order');
        }
        this.cart$.dispatch.setSubmitOrderResult(body.result);
        return body.result;
    }

    public async reloadCart() {
        // tslint:disable-next-line: no-floating-promises
        await this.getCartsItems();
        this.cartCnt.next(this.cart$.value.items.length);
        // tslint:disable-next-line: no-floating-promises
        this.getCartDetail();
    }

    ignore(x: unknown) {}

    public async submitOrder(
        request: PlaceOrderBase
    ): Promise<SubmitOrderResponse> {
        const { ok, body } = await this.api.postV1<SubmitOrderResponse>(
            'submitOrder',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to place order');
        }
        return body;
    }

    public async getApproverList(
        hasPendingOrders = false
    ): Promise<ApproverResponse> {
        const { ok, body } = await this.api.getV2<ApproverResponse>(
            'approver',
            { hasPendingOrders: hasPendingOrders }
        );
        if (!ok || !body) {
            throw new Error('Failed to place order');
        }
        return body;
    }

    public async removeItemFromCart(
        request: DeleteItemCartRequest
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'removeItemFromCart',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to remove item from cart');
        }
        // tslint:disable-next-line: no-floating-promises
        this.reloadCart();
        return body;
    }
    public async updateCart(
        items: UpdateCartRequest[]
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'updateCart',
            {
                items,
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to update cart');
        }
        // tslint:disable-next-line: no-floating-promises
        this.reloadCart();
        return body;
    }
    public async getCartsItems(): Promise<void> {
        // console.log( 'getCartsItems.......' )
        try {
            const cart = await this.api
                .getApiObservable<CartItemV2Response>('v2', 'cartItems', {})
                .toPromise();

            if (cart.result?.cartLineItems) {
                this.cartCnt.next(cart.result.cartLineItems);
            }

            this.cart$.dispatch.setCartItems(cart);
            this.shippingStore.dispatch.updateCartState(cart);
            const items =
                (cart &&
                    cart.result &&
                    cart.result.items.map((i) => i.catalogRefId)) ||
                [];
            this.fetchSuggestions(items);
            return;
        } catch (err) {
            return;
        }
    }

    public getCurrentOrderReview(): Observable<
        ApiResponse<GetCurrentOrderReviewResponse>
    > {
        return this.api.getApiObservable<
            ApiResponse<GetCurrentOrderReviewResponse>
        >('v2', 'getCurrentOrderReview', {});
    }

    public async addSingleItemToCart(
        quantity: number,
        sku: string,
        unitOfMeasure: string
    ) {
        const account = await this.userService.ensureCurrentUserInfo();
        const accountId = account.lastSelectedAccount.accountLegacyId;
        const details = await this.productsService.getItemDetails({
            itemNumber: sku,
            accountId: accountId,
        });
        if (!details || !details.product) {
            throw new AppError(`Failed to add item ${sku} to the cart`);
        }
        const item: ItemsEntity = {
            catalogRefId: sku,
            productId: details ? details.product.productId || '' : '',
            quantity: quantity,
            uom: unitOfMeasure,
            catalogRefIdChanged: false,
        };
        /* TODO this should happen after promise is confirmed successful */
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
        return await this.addItemsToCart({
            accountId: accountId,
            addItemCount: 1,
            items: [item],
        });
    }

    public async addItemsToCart(
        request: CartItems
    ): Promise<ApiResponse<AddMultipleItemsToOrderResponse>> {
        console.log({ request });

        if (request.items == null || undefined) {
            throw new Error('Failed to add items to cart');
        }

        let lineItems = []; // TODO why are we getting this from Order History
        for (const line of request.items) {
            const y = mapToObject(line.variation);

            // tslint:disable-next-line: no-floating-promises
            // TODO why are we pinging order history to fetch a catalogRefId
            const orderHistory =
                await this.orderHistoryService.getProductDetail(
                    line.catalogRefId.toString()
                );
            const lineObject = {
                id: line.catalogRefId,
                name: orderHistory ? he.decode(orderHistory.productName) : null,
                price: line.price,
                quantity: line.quantity,
                variant: y || null,
            };
            console.log({ lineObject }, lineObject);

            lineItems.push(lineObject);
        }

        this.analyticService.addToCart(lineItems);

        const { ok, body } = await this.api.postV2<
            ApiResponse<AddMultipleItemsToOrderResponse>
        >('addMultipleItemsToOrder', request, { ignoreInvalidItems: true });
        if (!ok || !body) {
            throw new Error('Failed to add items to cart');
        }
        this.reloadCart();
        /* scroll page to top */

        return body;
    }

    public addMultiItemsToCart(accountId: string, items: any) {
        const payload = {
            accountId,
            addItemCount: items.length,
            items,
        };

        return from(
            this.api.postV2<any>('addMultipleItemsToOrder', payload, {
                ignoreInvalidItems: true,
            })
        )
            .pipe(
                map((m: any) => {
                    console.log({ m });
                    return m;
                })
            )
            .subscribe(
                (res) => {
                    if (
                        res.status === 200 &&
                        res.body.sucess &&
                        !res.allItemsUnavailable
                    ) {
                        this.analyticService.addToCart(items);
                        this.userNotification.alertError('items added to cart');
                        this.reloadCart();
                        console.log({ res });
                    }
                },
                (err) => {
                    if (!err.body.success) {
                        this.userNotification.alertError(err.message);
                    }
                    console.log({ err });
                },
                () => {
                    this.reloadCart();
                    console.log('completed.....');
                }
            );
    }

    public handleCartPreview(preview: string) {
        console.log({ preview });
        this.cartPreview$.next(preview);
    }

    public async addItemsToCartFromOrder(
        request: CartItems
    ): Promise<AddMultipleItemsToOrderResponse | null> {
        const { ok, body } = await this.checkItemsForCartInternal(
            request,
            true,
            true
        );
        if (!ok || !body) {
            throw new Error('Failed to add items to cart');
        }
        if (request.items) {
            // tslint:disable-next-line: no-floating-promises
            let lineItems = []; // TODO why are we getting this from Order History
            for (const line of request.items) {
                const y = mapToObject(line.variation);

                // tslint:disable-next-line: no-floating-promises
                // TODO why are we pinging order history to fetch a catalogRefId
                const orderHistory =
                    await this.orderHistoryService.getProductDetail(
                        line.catalogRefId.toString()
                    );
                const lineObject = {
                    id: line.catalogRefId,
                    name: orderHistory
                        ? he.decode(orderHistory.productName)
                        : null,
                    price: line.price,
                    quantity: line.quantity,
                    variant: y || null,
                };
                console.log({ lineObject }, lineObject);

                lineItems.push(lineObject);
            }

            this.analyticService.addToCart(lineItems);
        }
        this.reloadCart();
        this.handleCartPreview('block'); /* SCROLL */
        return body.result;
    }

    public async checkItemsForCart(
        request: CartItems
    ): Promise<AddMultipleItemsToOrderResponse | null> {
        const { ok, body } = await this.checkItemsForCartInternal(
            request,
            false,
            false
        );
        if (!ok || !body) {
            throw new Error('Failed to add items to cart');
        }
        return body.result;
    }

    private async checkItemsForCartInternal(
        request: CartItems,
        ignoreInvalidItems: boolean,
        throwErrors: boolean
    ): Promise<{
        ok: boolean;
        body: ApiResponse<AddMultipleItemsToOrderResponse | null> | null;
    }> {
        try {
            const { ok, body } = await this.api.postV2<
                ApiResponse<AddMultipleItemsToOrderResponse>
            >('addMultipleItemsToOrder', request, {
                ignoreInvalidItems: ignoreInvalidItems,
            });
            return { ok, body };
        } catch (err) {
            if (!throwErrors && err instanceof ApiError) {
                const { body } = err;
                return {
                    ok: true,
                    body: body as ApiResponse<AddMultipleItemsToOrderResponse | null> | null,
                };
            }
            throw err;
        }
    }

    public async getCartDetail(): Promise<CartOrderSummary> {
        try {
            const response = await this.api
                .getApiObservable<ApiResponse<CartOrderSummary>>(
                    'v2',
                    'orderSummary',
                    {}
                )
                .toPromise();
            this.cart$.dispatch.setSummary(response.result);
            return response.result;
        } catch (err) {
            if (err instanceof ForbiddenError) {
                return {
                    total: 0,
                    itemsTotal: 0,
                    tax: 0,
                    otherChanges: 0,
                    totalMsg: '',
                    displayOtherChargeTBD: false,
                    displayTotalMsg: false,
                };
            }
            if (
                err instanceof AppError &&
                err.message === 'Oops! Your cart is currently empty.'
            ) {
                const sum = {
                    displayTotalMsg: false,
                    displayOtherChargeTBD: false,
                    displayTaxTBD: false,
                    itemsTotal: 0,
                    otherChanges: 0,
                    tax: 0,
                    total: 0,
                    totalMsg: '',
                };
                this.cart$.dispatch.setSummary(sum);
                return sum;
            }
            throw err;
        }
    }

    public async updateCurrentOrderJobNumber(jobNumber: string): Promise<void> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'updateCurrentOrderJobNumber',
            {
                jobNumber: jobNumber,
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to update shopping cart with job number');
        }
        const { success, messages } = body;
        this.reloadCart();
        if (success) {
            return;
        }
        if (messages && messages.length) {
            const { code, type, value } = messages[0];
            const decodedValue = stripTags(value);
            throw new AppError(`${code} - ${type} - ${decodedValue}`);
        }
        throw new AppError('Failed to update job');
    }

    public async validateOrderByLocation(req: {
        orderId: string;
        branchId: string;
        address: string;
        postCode: string;
    }): Promise<ValidateOrderByLocationResponse> {
        const { ok, body } =
            await this.api.getV2<ValidateOrderByLocationResponse>(
                'validateOrderByLocation',
                req
            );
        if (!ok || !body) {
            throw new Error('Failed to validate order by location');
        }
        return body;
    }

    public async proceedToCheckout(): Promise<BasicResponse> {
        try {
            const { ok, body } = await this.api.postV2<BasicResponse>(
                'proceedToCheckout',
                {}
            );
            if (!ok || !body) {
                throw new Error('Failed to proceed to checkout');
            }

            const items = this.cart$.value.items.map((v) => {
                const i = {
                    id: v.catalogRefId,
                    name: v.itemOrProductDescription,
                    price: v.unitPrice,
                    quantity: v.quantity,
                    variant: v.vendorColorId, // try to get variant name
                };
                return i;
            });
            this.analyticService.proceedToCheckout(items);
            return body;
        } catch (err: any) {
            if (isNullOrderPriceInfo(err.body)) {
                return err.body;
            }
            throw err;
        }
    }

    public getOrderShippingInfo() {
        this.api
            .getApiObservable<ApiResponse<GetOrderShippingInfoResponse>>(
                'v2',
                'getOrderShippingInfo',
                {}
            )
            .subscribe((s) => {
                if (s.success) {
                    this.orderShippingInfo.setState(s.result);
                }
            });
    }

    public async addOrderShippingInfo(
        orderShipping: AddOrderShippingInfoRequest
    ): Promise<void> {
        const r = await this.api.postV2('addOrderShippingInfo', orderShipping);
        if (!r.ok) {
            throw new AppError('Failed to update shipping info');
        }
        this.getOrderShippingInfo();
    }

    public async submitCurrentOrder(
        req: SubmitCurrentOrderRequest
    ): Promise<SubmitCurrentOrderResponse | null> {
        const { ok, body } = await this.api.postV2<
            ApiResponse<SubmitCurrentOrderResponse>
        >('submitCurrentOrder', req);
        if (!ok || !body || !body.result) {
            throw new ApiError('Failed to submit order', body);
        }
        this.cart$.dispatch.setOrderResponse(body.result);
        return body.result;
    }

    public async submitCurrentOrderForApproval(
        req: SubmitCurrentOrderForApprovalRequest
    ): Promise<SubmitCurrentOrderResponse | null> {
        const { ok, body } = await this.api.postV2<
            ApiResponse<SubmitCurrentOrderResponse>
        >('submitCurrentOrder', req);
        if (!ok || !body || !body.result) {
            throw new ApiError('Failed to submit order', body);
        }
        this.cart$.dispatch.setOrderResponse(body.result);
        return body.result;
    }

    public fetchSuggestions(items: string[] | null = null) {
        items = items || this.cart$.value.items.map((i) => i.catalogRefId);
        const accountId = this.api.userSession.value.accountId;
        if (!accountId || !items || items.length === 0) {
            this.suggestedProducts$.next([]);
            return;
        }
        this.productsService
            .getSuggestiveSelling({
                account: accountId.toString(),
                pageNo: 1,
                pageSize: 10,
                itemNumber: items,
            })
            .subscribe((s) => {
                this.suggestedProducts$.next((s && s.result) || []);
            });
    }
}

export interface GetSubmitOrderResultResponse {
    orderNumber: string;
    orderNumberTips: string;
    orderConfirmationTips: string;
    state: string;
    orderHistoryDetailLinkUrl: string;
    orderHistoryListLinkUrl: string;
    mincronResponseError: boolean;
    ATGFailedStatus: string;
    ATGOrderError: boolean;
}

export type SubmitCurrentOrderRequest = {
    apiSiteId?: string;
    poName: string;
    jobName: string;
    jobNumber: string;
    additionalRecipients: string[];
    savedOrderName?: string;
    approverId?: string;
};

export interface OrderResponseLineItem {
    commerceItemId: string;
    url: string;
    productImageUrl: string;
    productOnErrorImageUrl: string;
    itemOrProductDescription: string;
    catalogRefId: string;
    productId: string;
    quantity: number;
    uom: string;
    vendorColorId: string | null;
    unitPrice: number;
    totalPrice: number;
    itemFromQuote: boolean;
}

export interface SubmitCurrentOrderResponse {
    deliveryOption: string;
    deliveryDate: string | null;
    deliveryTime: string | null;
    shippingMethod: string;
    instructions: string;
    jobNumber: string;
    jobName: string;
    additionalRecipients: string[] | null;
    poName: string | null;
    approverFirstName: string | null;
    approverLastName: string | null;
    approverEmail: string | null;
    shippingAddress: {
        address1: string;
        address2: string;
        address3: string | null;
        country: string | null;
        city: string | null;
        state: string;
        states:
            | {
                  displayName: string;
                  value: string;
                  selected: boolean;
              }[]
            | null;
        postalCode: string;
        nickName: string | null;
        branchName: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
    };
    contactInfo?: {
        firstName: null | string;
        lastName: null | string;
        nickName: null | string;
        phoneNumber: string;
    };
    items: OrderResponseLineItem[];
    orderSummary: {
        total: number;
        itemsTotal?: number;
        tax?: number;
        otherChanges?: number;
        displayTotalMsg: boolean;
        totalMsg: string;
    };
    nextPage: {
        nextUrl: string;
    };
}

function isNullOrderPriceInfo(body: unknown): body is BasicResponse {
    if (!isApiResponse(body)) {
        return false;
    }
    return !!(body.messages || []).find(
        (m) => m.value === 'NullOrderPriceInfo'
    );
}

export interface CartOrderSummary {
    displayOtherChargeTBD?: boolean;
    displayTaxTBD?: boolean;
    total: number;
    itemsTotal: number;
    tax: number;
    otherChanges: number;
    otherCharges?: number;
    displayTotalMsg: boolean;
    totalMsg: string;
}

export interface CartItems {
    addItemCount: number;
    accountId: string;
    specialInstructions?: string;
    jobNumber?: string;
    items?: ItemsEntity[] | null;
}
export interface ItemsEntity {
    catalogRefId: string;
    productId: string;
    quantity: number;
    uom: string;
    catalogRefIdChanged: boolean;
    name?: string;
    price?: string | number;

    variation?: Map<string, string>;
    productNumber?: string;

    [key: string]: string | undefined | number | boolean | Map<string, string>;
}

export interface CartItems {
    addItemCount: number;
    accountId: string;
    specialInstructions?: string;
    jobNumber?: string;
    items?: ItemsEntity[] | null;
}

export interface CartItemV2Response {
    success: boolean;
    message?: string;
    messages: {
        code: number | string;
        type: string;
        value: string;
    }[];
    result?: {
        atgOrderId: string;
        lastSelectedJob?: Job;
        cartLineItems: number;
        items: CartItemV2[];
    };
}
export interface CartItemV2 {
    catalogRefId: string;
    commerceItemId: string;
    itemOrProductDescription: string;
    productId: string;
    productImageUrl: string;
    productOnErrorImageUrl: string;
    quantity: number;
    totalPrice: number;
    unitPrice: number;
    uom: string;
    url: string;
    vendorColorId: null;
}

export interface SubmitOrderResponse {
    result: string;
    orderId: string;
    messageCode: string;
    message: string;
}
export interface ValidateOrderByLocationResponse {
    success: boolean;
    messages?: Message;
    result?: string;
}

export interface AddMultipleItemsToOrderResponse {
    allItemsUnavailable: boolean;
    unavailableItems: UnavailableItem[];
    addedToCartItems: string[] | null;
    vendorColorNotMatchedItems: VendorColorNotMatchedItem[];
}

interface VendorColorNotMatchedItem {
    id: string;
    matchColor: string;
    matchMFG: string;
}

interface UnavailableItem {
    id: string;
    failedReason: string;
}

export interface GetCurrentOrderReviewResponse {
    orderRelatedDocuments: any;
    deliveryOption: string;
    deliveryDate: string;
    deliveryTime: string;
    shippingMethod: string;
    shippingAddress: ShippingAddress;
    contactInfo?: ContactInfo;
    poJob: PoJob | null;
    instructions: string;
    additionalRecipients: string[];
    nextPage: NextPage;
}

interface NextPage {
    nextUrl: string;
}

export interface PoJob {
    poRequired: boolean;
    jobNameRequired: boolean;
    jobNumberRequired: boolean;
    showJobName: boolean;
    showJobNumber: boolean;
    poName: string;
    jobNumber: string;
    jobName: string;
    jobAccounts: JobAccounts;
}

export interface JobAccounts {
    unavailable: boolean;
    unavailableMsg: string;
    jobs: Job[];
}

interface ShippingAddress {
    address1: string;
    address2: string;
    address3: string;
    country: string;
    city: string;
    state: string;
    states: State[];
    postalCode: string;
    nickName: string;
    branchName: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}
interface State {
    displayName: string;
    value: string;
    selected: boolean;
}

export interface SubmitOrderResult {
    orderNumber: string | null;
    orderNumberTips: string | null;
    orderConfirmationTips: string;
    state: string;
    orderHistoryDetailLinkUrl: string | null;
    orderHistoryListLinkUrl: string;
    mincronResponseError: boolean;
    ATGFailedStatus: string | null;
    ATGOrderError: boolean;
}

function mapToObject<Value>(
    map: Map<string, Value> | undefined
): Record<string, Value> | null {
    if (map) {
        const obj: Record<string, Value> = {};
        for (const key of map.keys()) {
            const item = map.get(key);
            if (item) {
                obj[key] = item;
            }
        }
        return obj;
    } else {
        return null;
    }
}

export interface ApproverResponse {
    messages?: Message[];
    success: boolean;
    result?: Approver[];
}
export interface Approver {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
export interface SubmitCurrentOrderForApprovalRequest {
    savedOrderName: string;
    approverId: string;
}
