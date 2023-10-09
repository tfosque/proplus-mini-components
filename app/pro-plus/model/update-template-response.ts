export interface UpdateTemplateResult {
    code: null;
    accountName: string;
    lastModifiedDate: Date;
    templateId: string;
    allItemsUnavailable: boolean;
    itemSuccessTotal: number;
    itemTotal: number;
    callBackParam: null;
    templateName: string;
    success: boolean;
    accountLegacyId: string;
    messageCode: null;
    messages: Message[];
    detailUrl: string;
}

export interface Message {
    code: null;
    type: string;
    value: string;
}
