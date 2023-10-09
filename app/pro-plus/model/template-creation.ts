export interface CreateTemplateRequest {
    templateName: string;
    account: string;
    items?: Item[];
}

interface Item {
    itemNumber: string;
    unitOfMeasure: string;
    quantity: number;
    color?: string;
    MFG?: string;
}

export interface CreateTemplateResponse {
    result: CreationResult;
    success: boolean;
    messages?: any;
}

interface CreationResult {
    templateId: string;
    templateName: string;
    lastModifiedDate: string;
    accountLegacyId: string;
    accountName: string;
    allItemsUnavailable: boolean;
    itemTotal: number;
    itemSuccessTotal: number;
    detailUrl: string;
    callBackParam: string;
}
