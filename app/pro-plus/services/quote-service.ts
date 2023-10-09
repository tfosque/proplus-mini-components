import { PlaceOrderRequest, SubmitterPlaceOrderRequest } from './../pages/quote-order/quote-order.component';
import { Injectable } from '@angular/core';
import { ProPlusApiBase, ApiResponse } from './pro-plus-api-base.service';
import { QuoteRequest } from '../model/quote-request';
import { QuoteResponse } from '../model/quote-response';
import { QuoteBrowseResponse } from '../model/quote-browse-response';
import { QuoteOrder, updateQuoteOrderShippingInfoRequest } from './quote-order';
import { ProductsService } from './products.service';
import { BasicResponse } from './user.service';
import { ForbiddenError } from '../../common-components/classes/app-error';

@Injectable({
    providedIn: 'root',
})
export class QuoteService {
    constructor(
        private readonly api: ProPlusApiBase,
        private readonly products: ProductsService
    ) {}
    async getQuotes(request: QuoteRequest) {
        const requestB: QuoteRequest = {
            ...request,
            pageNo: request.pageNo + 1,
        };
        const { ok, body } = await this.api.getV2<QuoteBrowseResponse>(
            'quote',
            requestB
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch quotes');
        }
        return body;
    }

    async getQuoteDetailAtg(
        accountId: string,
        quoteId: string
    ): Promise<QuoteResponse> {
        const { ok, body } = await this.api.getV2<QuoteResponse>(
            'getAtgQuoteDetail',
            {
                quoteId: quoteId,
                account: accountId,
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch quote details');
        }
        return body;
    }
    async getQuoteOrderPricing(
        quoteId: string,
        job?: string
    ): Promise<ApiResponse<QuoteOrderPricingResponse>> {
        try {
            const { ok, body } = await this.api.getV2<
                ApiResponse<QuoteOrderPricingResponse>
            >('getQuoteOrderPrice', {
                orderId: quoteId,
                jobNumber: job,
            });
            if (!ok || !body) {
                throw new Error('Failed to fetch quote details');
            }
            return body;
        } catch (err) {
            if (err instanceof ForbiddenError) {
                return {
                    success: false,
                    result: {
                        id: '',
                        subTotal: 0,
                        taxes: 0,
                        otherCharges: 0,
                        total: 0,
                        displayTaxTBD: false,
                        displayOtherChargeTBD: false,
                        commerceItems: []
                    }
                };
            }
            throw err;
        }
    }
    async getQuoteDetailMincron(
        accountId: string,
        quoteId: string
    ): Promise<QuoteResponse> {
        const { ok, body } = await this.api.postV2<QuoteResponse>(
            'getMincronQuoteDetail',
            {
                quoteId: quoteId,
                account: accountId,
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch quote details');
        }
        return body;
    }

    async downloadQuoteAsPDF(
        accountId: string,
        quoteId: string,
        showPrice: string
    ): Promise<string | ArrayBuffer | null> {
        return await this.api
            .getApiDataUrl('v2', 'downloadQuoteAsPDF', {
                quoteId: quoteId,
                account: accountId,
                showPrice: showPrice,
            })
            .toPromise();
    }

    async downloadQuoteAsPDFBlob(
        accountId: string,
        quoteId: string,
        showPrice: string
    ): Promise<Blob> {
        return await this.api
            .getApiDataUrlBlob('v2', 'downloadQuoteAsPDF', {
                quoteId: quoteId,
                account: accountId,
                showPrice: showPrice,
            })
            .toPromise();
    }

    async updateQuote(
        request: UpdateQuoteRequest
    ): Promise<UpdateQuoteResponse | null> {
        const { ok, body } = await this.api.postV2<UpdateQuoteResponse>(
            'updateQuote',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to update quote');
        }
        return body;
    }

    async rejectQuote(request: RejectQuoteRequest): Promise<any | null> {
        const { ok, body } = await this.api.postV2<any>('rejectQuote', request);
        if (!ok || !body) {
            throw new Error('Failed to reject quote');
        }
        return body;
    }

    async reviseQuote(request: ReviseQuoteRequest): Promise<any | null> {
        const { ok, body } = await this.api.postV2<any>('reviseQuote', request);
        if (!ok || !body) {
            throw new Error('Failed to revise quote');
        }
        return body;
    }

    async convertQuoteToOrder(quoteId: string): Promise<ApiResponse<string>> {
        const { ok, body } = await this.api.postV2<ApiResponse<string>>(
            'convertQuoteOrder',
            { quoteId }
        );
        if (!ok || !body) {
            throw new Error('Failed to convert quote');
        }
        return body;
    }

    async manageItemsForQuote(
        request: CreateItemsRequest
    ): Promise<UpdateQuoteResponse | null> {
        const { ok, body } = await this.api.postV2<UpdateQuoteResponse>(
            'updateQuote',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to add items to quote');
        }
        return body;
    }

    async updateItems(
        request: UpdateItemsRequest | CreateItemsRequest
    ): Promise<UpdateQuoteResponse | null> {
        const { ok, body } = await this.api.postV2<UpdateQuoteResponse>(
            'updateQuote',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to update quote');
        }
        return body;
    }

    async deleteItems(
        request: DeleteItemsRequest
    ): Promise<UpdateQuoteResponse | null> {
        const { ok, body } = await this.api.postV2<UpdateQuoteResponse>(
            'updateQuote',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to delete items from quote');
        }
        return body;
    }
    async createQuote(request: CreateQuoteRequest): Promise<any | null> {
        const { ok, body } = await this.api.postV2<any>('createQuote', request);
        if (!ok || !body) {
            throw new Error('Failed to create quote');
        }
        return body;
    }
    async deleteQuote(request: DeleteQuoteRequest): Promise<QuoteResponse> {
        const { ok, body } = await this.api.postV2<QuoteResponse>(
            'deleteQuote',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to delete quote');
        }
        return body;
    }
    async submitQuote(request: RequestQuoteRequest): Promise<QuoteResponse> {
        const { ok, body } = await this.api.postV2<QuoteResponse>(
            'submitQuote',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to submit quote');
        }
        return body;
    }
    async submitQuoteForm(
        request: SubmitQuoteFormRequest
    ): Promise<QuoteResponse> {
        const formData = new FormData();
        formData.append('userName', request.userName);
        formData.append('contactNumber', request.contactNumber);
        formData.append('uploadDocument', request.uploadDocument.blob, request.uploadDocument.filename);
        formData.append('jobNumber', request.jobNumber);
        formData.append('workType', request.workType);
        formData.append('quoteNotes', request.quoteNotes);
        const { ok, body } = await this.api.postV2<QuoteResponse>(
            'submitQuoteForm',
            formData
        );
        if (!ok || !body) {
            throw new Error('Failed to submit quote');
        }
        return body;
    }
    async placeQuoteOrder(request: PlaceOrderRequest): Promise<any> {
        const { ok, body } = await this.api.postV2<any>(
            'placeQuoteOrder',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to place order');
        }
        return body;
    }

    async submitQuoteOrderForApproval(request: SubmitterPlaceOrderRequest): Promise<any> {
        const { ok, body } = await this.api.postV2<any>(
            'submitQuoteOrderForApproval',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to place order');
        }
        return body;
    }

    async updateQuoteOrderShippingInfo(
        req: updateQuoteOrderShippingInfoRequest
    ) {
        const { ok, body } = await this.api.postV2WithError<BasicResponse>(
            'updateQuoteOrderShippingInfo',
            req
        );
        if (!ok || !body) {
            throw new Error('Failed to update shipping info of quote order');
        }
        return body;
    }

    getQuoteOrder(orderId: string) {
        return new QuoteOrder(this.api, this.products, orderId);
    }
}

export interface DeleteItemsRequest {
    id: string;
    deleteItems: string[];
    action: 'DELETE_ITEM';
}
// export interface CreateQuoteRequest {
//     quoteName: string;
//     phoneNumber: string;
//     address1: string;
//     address2: string;
//     city: string;
//     state: string;
//     workType: string;
//     jobName: string;
//     jobNumber: string;
//     quoteNotes: string;
//     // quoteItems: QuoteItem[];
// }

export interface CreateQuoteRequest {
    quoteName: string;
    phoneNumber?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    workType?: string;
    jobName?: string;
    jobNumber?: string;
    quoteNotes?: string;
    mailingAddress1?: string;
    mailingAddress2?: string;
    mailingAddress3?: string;
    mailingState?: string;
    mailingCity?: string;
    mailingZip?: string;
    expires?: string;
    quoteItems?: NewItemCreateQuoteItemRequest[];
}

export interface NewItemCreateQuoteItemRequest {
    itemId: string;
    displayName: string;
    itemType: string;
    quantity: number;
    uom: string;
    color?: string;
    dimensions?: string;
}

export interface RequestQuoteRequest {
    id: string | null;
    quoteName: string;
    phoneNumber: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    workType: string;
    jobName: string;
    jobNumber: string;
    quoteNotes: string;
    quoteItems: QuoteItemRequest[];
}

export interface SubmitQuoteFormRequest {
    userName: string;
    contactNumber: string;
    uploadDocument: {
        blob: Blob;
        filename: string;
    };
    jobNumber: string;
    workType: string;
    quoteNotes: string;
}
export interface QuoteItemRequest {
    itemId: string;
    itemType: string;
    quantity: number;
    uom: string;
    displayName: string;
}

export interface DeleteQuoteRequest {
    quoteId: string;
}
export interface QuoteItem {
    itemId: string;
    itemType: string;
    quantity: number;
    uom: string;
}

export interface UpdateItemsRequest {
    id: string;
    quoteName: string;
    quoteItems: { id: string; quantity: number }[];
    action: 'UPDATE_ITEM';
}

interface UpdateQuoteResponse {
    messages: Message[];
    messageCode: number;
    success: boolean;
}

export interface Message {
    type: string;
    value: string;
    code: string;
}

type UpdateQuoteActionType =
    | 'UPDATE_QUOTE'
    | 'CREATE_ITEM'
    | 'UPDATE_ITEM'
    | 'DELETE_ITEM';

export interface UpdateQuoteRequest {
    id: string;
    quoteName: string;
    phoneNumber: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    workType: string;
    jobName?: string;
    jobNumber?: string;
    quoteNotes: string;
    action: UpdateQuoteActionType;
}

export interface CreateItemsRequest {
    id: string;
    quoteItems: CreateQuoteItem[];
    action: 'CREATE_ITEM';
}

export interface CreateQuoteItem {
    itemNumber: string | null;
    itemType: string | null;
    uom: string | null;
    quantity: number | null;
    displayName: string | undefined;
}
export interface RejectQuoteRequest {
    quoteId: string;
    reason: string;
}

export interface ReviseQuoteRequest {
    quoteId: string;
    quoteNotes: string;
}

export interface QuoteOrderPricingResponse {
    id: string;
    subTotal: number;
    taxes: number;
    otherCharges: number;
    total: number;
    displayTaxTBD: boolean;
    displayOtherChargeTBD: boolean;
    commerceItems: CommerceItem[];
}

interface CommerceItem {
    id: string;
    price: number;
    subTotal: number;
}
