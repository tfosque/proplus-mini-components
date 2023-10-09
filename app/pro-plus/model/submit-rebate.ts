export interface SubmitRebateRequest {
    rebateId: string;
    rebateInfo?: RebateInfo;
    rebateAddress?: RebateAddress;
    rebateCustomInfo?: any;
}

export interface RebateInfo {
    companyName: string;
    contactName: string;
    phoneNumber: string;
    email: string;
}

export interface RebateAddress {
    address: string;
    city: string;
    state: string;
    zip: string;
}

export interface SubmitRebateResponse {
    result: any;
    success: boolean;
    messages?: any;
}
