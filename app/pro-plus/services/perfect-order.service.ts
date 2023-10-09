import { Injectable } from '@angular/core';
import { ProPlusApiBase, ApiResponse } from './pro-plus-api-base.service';
import { ApiError } from './api-error';

@Injectable({
    providedIn: 'root',
})
export class PerfectOrderService {
    constructor(private readonly api: ProPlusApiBase) {}

    async getPerfectStyles(
        request: GetPerfectStylesRequest
    ): Promise<PerfectStylesResponse | null> {
        const { ok, body } = await this.api.getV2<PerfectStylesResponse>(
            'getPerfectStyleGroups',
            request
        );
        if (!ok || !body) {
            return null;
        }
        return body;
    }
    async getPerfectOrderLanding(
        request: PerfectOrderLandingRequest
    ): Promise<PerfectOrderLandingResponse | null> {
        const { ok, body } = await this.api.getV2<PerfectOrderLandingResponse>(
            'getPerfectOrderLanding',
            request
        );
        if (!ok || !body) {
            return null;
        }
        return body;
    }
    async getPerfectOrderDetail(
        request: GetPerfectOrderDetailRequest
    ): Promise<GetPerfectOrderDetailResponse> {
        const { ok, body } = await this.api.getV2<
            ApiResponse<GetPerfectOrderDetailResponse>
        >('getPerfectOrderDetail', request);
        if (!ok || !body) {
            throw new Error('Problem fetching perfect order.');
        }
        if (!body.success) {
            throw new ApiError('Failed to fetch perfect order', body);
        }
        return body.result;
    }

    async addToTemplate(
        request: AddToTemplateRequest
    ): Promise<AddToTemplateResponse> {
        const { ok, body } = await this.api.postV2<AddToTemplateResponse>(
            'addPerfectOrderToTemplate',
            request
        );
        if (!ok || !body) {
            throw new Error('Problem creating template.');
        }
        return body;
    }
}

export interface AddToTemplateRequest {
    templateName: string;
    account: string;
    perfectOrderId: string;
    brandName: string;
}

export interface AddToTemplateResponse {
    templateId: string;
    templateName: string;
    lastModifiedDate: string;
    accountLegacyId: string;
    accountName: string;
    messageCode: string;
    message: string;
}

export interface PerfectStylesResponse {
    result: Result;
}

interface Result {
    pagination: Pagination;

    items: Items[];
}

interface Items {
    brandName: string;
    displayRank: string;
    styleId: string;
    productStyleImage: string;
    productStyleName: string;
}

export interface GetPerfectStylesRequest {
    brand: string;
    pageNo: number;
    pageSize: number;
}

export interface PerfectOrderLandingRequest {
    brandName: string;
    pageNo: number;
    pageSize: number;
}

export interface PerfectOrderLandingResponse {
    message: string;
    success: boolean;
    result: Result2;
}

interface Result2 {
    pagination: Pagination;
    items: ItemLanding[];
}

interface ItemLanding {
    landingRank: number;
    displayName: string;
    imgUrl: string;
    id: string;
}

interface Pagination {
    next: Next;
    previous: Next;
    pageSize: number;
    currentPage: number;
    totalCount: number;
    results: Result[];
}

interface Result {
    enable: boolean;
    page: number;
    currentPage: boolean;
    type: string;
}

interface Next {
    available: boolean;
    label: string;
    page: number;
}

export interface GetPerfectOrderDetailRequest {
    account: string;
    perfectOrderId: string;
    brandName: string;
    jobNumber?: string;
    showPricing?: string;
}

export interface GetPerfectOrderDetailResponse {
    message: string;
    perfectOrders: PerfectOrder[];
}

export interface PerfectOrder {
    displayName: string;
    items: PerfectOrderItem[];
}

export interface PerfectOrderItem {
    unitPrice: number;
    itemNumber: string;
    itemFromQuote: boolean;
    unitOfMeasure: string;
    variations: Record<string, Record<string, string[]>>;
    skusVariation: Record<string, Record<string, string[]>>;
    quantity: number;
    productOrItemNumber: string;
    productImageUrl: string;
    productOnErrorImageUrl: string;
    internalProductName: string;
    itemOrProductDescription: string;
    nickName?: string | null;
}
