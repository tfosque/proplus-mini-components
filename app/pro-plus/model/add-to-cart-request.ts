export interface AddToCartRequest {
    addItemCount: number;
    accountId: string;
    items: Item[];
}
export interface Item {
    catalogRefId: string;
    productId: string;
    quantity: number;
    uom: string;
    catalogRefIdChanged: boolean;
}
