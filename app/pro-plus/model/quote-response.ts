import { Message } from '../services/order-history.service';

export interface QuoteResponse {
    callBackParam: string;
    code: number;
    messageCode: number;
    messages: Message[];
    quote: QuoteInfo;
    result: string;
    success: boolean;
}

export interface QuoteInfo {
    id: string;
    mincronId: string;
    accountNumber: string;
    createdUser: string;
    createdUserName: string;
    creationDate: string;
    deleteStatus: boolean;
    displayName: string;
    quoteItems: QuoteItem[];
    expires: string;
    quoteNotes: string;
    lastModifiedDate: string;
    lastModifiedUser: string;
    lastModifiedUserEmail: string;
    siteID: string;
    status: string;
    phoneNumber: string;
    workType: string;
    workTypeName: string;
    jobNumber: string;
    jobName: string;
    address1: string;
    address2: string;
    postalCode: string;
    state: string;
    city: string;
    quoteTotalPrice: number;
    profileId: string;
    profileEmail: string;
    documentName: string;
    standardQuoteItems: QuoteItem[];
    addtionalQuoteItems: QuoteItem[];
    lastModifiedDate4Integration: string;
    creationDate4Integration: string;
    formatQuoteTotal: string;
    subTotal: number;
    otherCharges: number;
    tax: number;
    gst: number;
    total: number;
    formatSubTotal: string;
    formatTax: string;
    formatTotal: string;
}

export interface NewQuoteItem {
    id: string;
    itemType: string;
    quantity: number;
    unitOfMeasure: string;
    displayName: string;
}
export interface QuoteItem extends NewQuoteItem {
    itemNumber: string;
    productId: string;
    deleteStatus: boolean;
    imageURL: string;
    imageOnErrorUrl: string;
    PDPUrl: string;
    productNumber: string;
    unitPrice: number;
    itemDescription: string;
    itemTotalPrice: number;
    currencySymbol: string;
    stickerImageURL: string;
    formatUnitPrice: string;
    formatItemTotalPrice: string;
}
