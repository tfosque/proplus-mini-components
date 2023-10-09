export interface RebateLandingResponse {
    result: RebateLanding[];
    success: boolean;
    messages?: string;
}

export interface RebateLanding {
    image?: string;
    rebateName?: string;
    action?: string;
    rebateId?: string;
    startDate?: string;
    endDate?: string;
    ableUpdate?: boolean;
    lastSubmittedDate?: string;
    submittedRebateInfoId?: string;
    brandName?: string;
}
