import { UpdateQuoteOrderItem } from './../pages/quote-order/quote-order.component';
import { ProPlusApiBase, ApiResponse } from './pro-plus-api-base.service';
import {
    CartOrderSummary,
    SubmitOrderResponse,
} from './shopping-cart-service';
import { BasicResponse, Message } from './user.service';
import { ProductsService, ProductDetailsResponse } from './products.service';

export class QuoteOrder {
    async addSingleItemToCart(
        qty: number,
        itemNumber: string,
        uom: string
    ): Promise<BasicResponse> {
        const newBody: UpdateQuoteOrderRequest = {
            id: this.orderId,
            action: 'CREATE_ITEM',
            commerceItems: [
                {
                    itemNumber: itemNumber,
                    quantity: qty,
                    uom: uom,
                },
            ],
        };
        return toBasicResponse(await this.updateQuoteOrder(newBody));
    }
    async updateCurrentOrderJobNumber(jobNumber: string): Promise<void> {
        throw new Error("We don't support changing the job number yet");
    }
    submitOrder(
        request: import('../pages/quote-order/quote-order.component').PlaceOrderBase
    ): Promise<SubmitOrderResponse> {
        throw new Error("We don't support submitting an order yet");
    }
    async addItemsToCart(items: import('./shopping-cart-service').CartItems) {
        const newItems = items.items || [];
        const newBody: UpdateQuoteOrderRequest = {
            id: this.orderId,
            action: 'CREATE_ITEM',
            commerceItems: newItems.map((i) => {
                const item: CreatedItem = {
                    itemNumber: i.productId,
                    quantity: i.quantity,
                    uom: i.uom,
                };
                return item;
            }),
        };
        return toBasicResponse(await this.updateQuoteOrder(newBody));
    }
    clearCart(): Promise<BasicResponse> {
        throw new Error("We don't support clearing the cart");
    }
    async removeItemFromCart(
        deleteReq: import('./user.service').DeleteItemCartRequest
    ) {
        const commerceItemId = parseInt(deleteReq.commerceItemId, 10);
        if (!commerceItemId) {
            throw new Error(`Failed to remove item from cart`);
        }
        const newBody: UpdateQuoteOrderRequest = {
            id: this.orderId,
            action: 'DELETE_ITEM',
            commerceItems: [{ id: commerceItemId }],
        };
        return toBasicResponse(await this.updateQuoteOrder(newBody));
    }

    public async getCartsItems(): Promise<Q2OCartItemV2Response> {
        const quoteOrder = await this.getQuoteOrder();
        const messages = quoteOrder.messages || [];
        const result = quoteOrder.result;
        const response: Q2OCartItemV2Response = {
            ...quoteOrder,
            messages: messages,
            result: {
                atgOrderId: '',
                cartLineItems: 0,
                items: result.commerceItems.map(fromCommerceItem),
            },
        };
        return response;

        function fromCommerceItem(item: CommerceItem): Q2OCartItemV2 {
            return {
                catalogRefId: item.itemNumber,
                commerceItemId: item.itemNumber,
                itemOrProductDescription: item.description,
                productId: item.productId,
                productImageUrl: item.thumbImageUrl,
                productOnErrorImageUrl: item.imageOnErrorUrl,
                quantity: item.quantity,
                totalPrice: item.subTotal,
                unitPrice: item.price,
                uom: item.uom,
                url: item.pdpUrl,
                vendorColorId: null,
            };
        }
    }
    public async updateCart(
        body: UpdateQuoteOrderItem[]
    ): Promise<BasicResponse> {
        const newBody: UpdateQuoteOrderRequest = {
            id: this.orderId,
            action: 'UPDATE_ITEM',
            commerceItems: body.map((i) => {
                const newItem: UpdateItem = {
                    id: parseInt(i.id, 10),
                    quantity: i.quantity,
                    itemNumber: i.itemNumber,
                    uom: i.uom,
                };
                return newItem;
            }),
        };

        const resp = await this.updateQuoteOrder(newBody);
        return toBasicResponse(resp);
    }
    getItemDetails(productId: string): Promise<ProductDetailsResponse | null> {
        return this.products.getItemDetails({ productId: productId });
        // return this.cartService.getItemDetails(productId);
    }
    public async getCartDetail(): Promise<CartOrderSummary> {
        // return await this.cartService.getCartDetail();
        const quoteOrder = await this.getQuoteOrder();
        if (!quoteOrder.success || !quoteOrder.result) {
            return {
                total: 0,
                itemsTotal: 0,
                tax: 0,
                otherChanges: 0,
                displayTotalMsg: true,
                totalMsg: 'PLACEHOLDER - ZZZZ - Failed to get order info',
            };
        }
        const r = quoteOrder.result;

        //  TODO - We have extra pricing warnings coming back from the
        //  quote that changes how we display summaries to the user.
        //  Ex:  Taxes TBD
        const summary: CartOrderSummary = {
            total: r.total,
            itemsTotal: r.subTotal,
            tax: r.taxes,
            otherChanges: r.otherCharges,
            displayTotalMsg: false,
            totalMsg: '',
        };
        return summary;
        //  TODO - Map to updateQuoteOrder
    }
    constructor(
        private readonly api: ProPlusApiBase,
        private readonly products: ProductsService,
        private readonly orderId: string
    ) {}
    public async getQuoteOrder() {
        const orderId = this.orderId;
        const { ok, body } = await this.api.getV2<
            ApiResponse<QuoteOrderDetail>
        >('getQuoteOrderDetail', { orderId });
        if (!ok || !body || !body.success) {
            throw new Error('Failed to submit quote');
        }
        return body;
    }

    public async updateQuoteOrder(req: UpdateQuoteOrderRequest) {
        const { ok, body } = await this.api.postV2<
            ApiResponse<UpdateQuoteOrderResponse>
        >('updateQuoteOrder', req);
        if (!ok || !body || !body.success) {
            throw new Error('Failed to updated quote order');
        }
        return body;
    }

    public async updateQuoteOrderShippingInfo(req: updateQuoteOrderShippingInfoRequest) {
        const { ok, body } = await this.api.postV2<BasicResponse
        >('updateQuoteOrderShippingInfo', req);
        if (!ok || !body) {
            throw new Error('Failed to update shipping info of quote order');
        }
        return body;
    }

    public async placeQuoteOrder(req: PlaceQuoteOrderRequest) {
        const { ok, body } = await this.api.postV2<string>(
            'placeQuoteOrder',
            req
        );
        if (!ok || !body) {
            throw new Error('Failed to place a quote order');
        }
        return body;
    }
}

export interface QuoteOrderDetail {
    id: string;
    mincronId: string;
    displayName: string;
    accountNumber: string;
    accountName: string;
    creationDate: string;
    createdUser: string;
    createdUserEmail: string;
    lastModifiedDate: string;
    lastModifiedUser: string;
    lastModifiedUserEmail: string;
    placeOrderDate: string;
    placeOrderUser: string;
    placeOrderEmail: string;
    job: Job;
    jobAccounts: JobAccounts;
    shippingMethod: string;
    shippingMethodValue: string;
    shippingMethods: ShippingMethod[];
    shippingAddress: ShippingAddress;
    shippingAddressTitle: string;
    branchName: string;
    contactInfo: ContactInfo;
    branchAddress: BranchAddress;
    instructions: string;
    commerceItems: CommerceItem[];
    requiredFields: RequiredFields;
    po: string;
    emailAddress: string[];
    deliveryOption: string;
    deliveryOptionValue: string;
    deliveryOptions: ShippingMethod[];
    deliveryDate: string;
    deliveryTime: string;
    deliveryTimes: ShippingMethod[];
    expressDeliveryTimes: ShippingMethod[];
    addressBook: AddressBookOrder;
    storeLocatorItemId: string;
    total: number;
    subTotal: number;
    taxes: number;
    otherCharges: number;
    displayTaxTBD: boolean;
    displayOtherChargeTBD: boolean;
    atgOrderId: string;
    quoteStatus: string;
    atgQuoteId: string;
    action: string;
    timeZoneId: string;
    serverTime: number;
    postponeDeliveryHour: number;
    accountBranchState: string;
    branchAddressTimeZoneId: string;
    showDeliveryNotification: boolean;
    showOrderSummary: boolean;
}

export interface AddressBookOrder {
    id: string;
    displayName: string;
    shippingAddress: ShippingAddress;
    contactInfo: ContactInfo;
}

interface RequiredFields {
    deliveryOption: boolean;
    deliveryDate: boolean;
    deliveryTime: boolean;
    shippingMethod: boolean;
    shippingAddress: boolean;
    postalCode: boolean;
    state: boolean;
    address1: boolean;
    address2: boolean;
    address3: boolean;
    country: boolean;
    city: boolean;
    branchName: boolean;
    contactInfo: boolean;
    firstName: boolean;
    lastName: boolean;
    nickName: boolean;
    phoneNumber: boolean;
    instructions: boolean;
    po: boolean;
    jobName: boolean;
    jobAccounts: boolean;
}

export interface CommerceItem {
    atgItemDescription?: string;
    id: string;
    imageUrl: string;
    imageOnErrorUrl: string;
    thumbImageUrl: string;
    pdpUrl: string;
    description: string;
    itemNumber: string;
    price: number;
    quantity: number;
    uom: string;
    subTotal: number | null;
    deleteStatus: boolean;
    vendorColorId: string;
    productId: string;
    itemGrayOutLevel: string;
    itemFromQuote: boolean;
    itemChanged: boolean;
    quotedItemQtyChanged: boolean;
}

interface BranchAddress {
    displayName: string;
    address1: string;
    address2: string;
    address3: string;
    country: string;
    city: string;
    state: string;
    stateValue: string;
    postalCode: string;
    phoneNumber: string;
    branchNumber: string;
}

interface ContactInfo {
    firstName: string;
    lastName: string;
    nickName: string;
    phoneNumber: string;
}

interface ShippingAddress {
    address1: string;
    address2: string;
    address3: string;
    country: string;
    city: string;
    state: string;
    states: ShippingMethod[];
    postalCode: string;
}

interface ShippingAddressForUpdate {
    address1: string;
    address2: string;
    address3?: string | null;
    country: string;
    city: string;
    state: string;
    states?: ShippingMethod[];
    postalCode: string;
}

interface ShippingMethod {
    displayName: string;
    value: string;
    selected: boolean;
}

interface JobAccounts {
    unavailable: boolean;
    unavailableMsg: boolean;
    jobs: Job[];
}

interface Job {
    jobNumber: string;
    jobName: string;
    jobNameMandatory: boolean;
    jobNumberMandatory: boolean;
    jobNumberDisplayName: string;
}

export type UpdateQuoteOrderRequest = {
    id: string;
} & (
    | { action: 'CREATE_ITEM'; commerceItems: CreatedItem[] }
    | { action: 'UPDATE_ITEM'; commerceItems: UpdateItem[] }
    | { action: 'DELETE_ITEM'; commerceItems: DeleteItem[] }
);

export type UpdateQuoteOrderResponse = {
    id: string;
    commerceItems: UpdateItem[];
};

interface CreatedItem {
    quantity: number;
    itemNumber: string;
    uom?: string;
    matchColor?: string;
    matchMFG?: string;
}

interface DeleteItem {
    id: number;
}

interface UpdateItem {
    id: number;
    quantity: number;
    itemNumber: string;
    uom: string;
    matchColors?: string;
    matchMFG?: string;
}

interface PlaceQuoteOrderRequest {
    orderId: string;
    poName: string;
    jobName: string;
    jobNumber: string;
    additionalRecipients: string[];
}

export interface updateQuoteOrderShippingInfoRequest {
    id: string;
    deliveryOption: string;
    deliveryDate?: string;
    deliveryTime?: string;
    shippingMethod: string;
    shippingAddress?: ShippingAddressForUpdate;
    branchName?: string | null;
    contactInfo: ContactInfo;
    instructions?: string;
}

function toBasicResponse(resp: {
    success: boolean;
    messages?: Message[];
}): BasicResponse | PromiseLike<BasicResponse> {
    return {
        success: resp.success,
        messageCode: 200,
        messages: resp.messages || [],
    };
}

interface Q2OCartItemV2Response {
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
        items: Q2OCartItemV2[];
    };
}

interface Q2OCartItemV2 {
    catalogRefId: string;
    commerceItemId: string;
    itemOrProductDescription: string;
    productId: string;
    productImageUrl: string;
    productOnErrorImageUrl: string;
    quantity: number;
    totalPrice: number | null;
    unitPrice: number;
    uom: string;
    url: string;
    vendorColorId: null;
}
