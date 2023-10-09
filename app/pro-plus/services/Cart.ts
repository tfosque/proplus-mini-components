import {
    CartItemV2,
    CartOrderSummary,
    CartItemV2Response,
    SubmitCurrentOrderResponse,
    SubmitOrderResult,
} from './shopping-cart-service';
import { Store } from '../stores/store';
// import { map } from 'rxjs/operators';

export type CartState = {
    atgOrderId: string | null;
    items: CartItemV2[];
    subTotal: number;
    summary: CartOrderSummary | null;
    orderResponse: SubmitCurrentOrderResponse | null;
    submitOrderResult: SubmitOrderResult | null;
    lastSelectedJob?: {
        jobName: string;
        jobNumber: string;
    }
};

const initialState = {
    atgOrderId: null,
    items: [],
    subTotal: 0,
    summary: null,
    orderResponse: null,
    submitOrderResult: null,
    lastSelectedJob: {
        jobName: '',
        jobNumber: ''
    }
};

class CartActions {
    setCartItems(
        s: CartState,
        cart: CartItemV2Response | null | undefined
    ): CartState {
        if (!cart || !cart.result) {
            return {
                ...s,
                items: [],
                subTotal: 0,
                atgOrderId: null,
                summary: null,
            };
        }
        const items = (cart.result && cart.result.items) || [];
        const newItems = items;
        const subTotal = newItems.reduce(
            (total, item) => total + item.quantity * item.unitPrice,
            0
        );
        return {
            ...s,
            atgOrderId: cart.result.atgOrderId,
            items: newItems,
            subTotal,
            lastSelectedJob: cart.result.lastSelectedJob
        };
    }
    setOrderResponse(
        s: CartState,
        orderResponse: SubmitCurrentOrderResponse | null
    ): CartState {
        return { ...s, orderResponse };
    }

    setSubmitOrderResult(
        s: CartState,
        submitOrderResult: SubmitOrderResult | null
    ): CartState {
        return { ...s, submitOrderResult };
    }
    setSummary(s: CartState, summary: CartOrderSummary | null): CartState {
        return { ...s, summary };
    }
}

export class CartStore extends Store<CartState, CartActions> {
    constructor() {
        super(initialState, CartActions);
    }
}
