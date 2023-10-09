import { RebateRedeemedSummaryItem } from './rebate-redeemed-summary';

export interface RebateRedeemedDetailResponse {
    result: RebateRedeemedDetailAll;
    success: boolean;
    messages?: string;
}

export interface RebateRedeemedDetailAll {
    pagination: Pagination;
    header: RebateRedeemedSummaryItem;
    body: RebateRedeemedDetail[];
}

export interface RebateRedeemedDetail {
    orderNumber?: string;
    itemStockUnitOfMeasure?: string;
    invoiceDate?: string;
    showSalesAmountAsPrice?: boolean;
    customerName?: string;
    projectedRebate?: string;
    promotionDates?: string;
    accountId?: string;
    quantityShipped?: number;
    salesAmount?: number;
    id?: string;
    itemDescription?: string;
    category?: string;
    projectedPromotionRebate?: string;
    rebateId: string;
    currencyUnit?: string;
    promotion?: string;
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
