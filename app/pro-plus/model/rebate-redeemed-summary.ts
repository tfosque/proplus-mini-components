export interface RebateRedeemedSummaryResponse {
    result: RebateRedeemedSummaryItem[];
    success: boolean;
    messages?: string;
}

export interface RebateRedeemedSummaryItem {
    promotionDates?: string;
    accountId?: string;
    submitDate?: string;
    id?: string;
    brand?: string;
    rebateId?: string;
    PDFUrl?: string;
    currencyUnit?: string;
    promotion?: string;
    projectedRebate?: string;
}

export interface RebateRedeemedSummaryRequest {
    searchBy?: string;
    searchTerm?: string;
    filter?: string
}
