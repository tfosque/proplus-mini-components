export interface ShoppingResponse {
    messages: Message[];
    success: boolean;
    result: ObjectItem;
}

export interface ObjectItem {
    cartLineItems: number;
    items: Item[];
}

export interface Item {
    commerceItemId: string;
    url: string;
    productImageUrl: string;
    itemOrProductDescription: string;
    catalogRefId: string;
    productId: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    totalPrice: number;
}

export interface Message {
    type: string;
    value: string;
    code: string;
}
