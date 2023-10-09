export interface SubmittedRebateFormResponse {
    result: SubmittedRebateFormResult;
    success: boolean;
    messages?: string;
}

export interface SubmittedRebateFormResult {
    rebateForm: SubmittedRebateFormContent;
    subscriptionDate?: string;
    rebateInfoId: string;
}

export interface SubmittedRebateFormContent {
    rebateName: string;
    ableSubmit?: boolean;
    rows: SubmittedRebateFormRow[];
    rebateId?: string;
}

export interface SubmittedRebateFormRow {
    fields?: SubmittedRebateFormField[];
}

export interface SubmittedRebateFormField {
    name?: string;
    label?: string;
    placeHolder?: string;
    value?: string;
    required?: boolean;
    type?: string;
    // infoGroup?: RebateFormInfoGroup;
    infoGroup?: string;
    maxLength?: number;
    minLength?: number;
    email?: boolean;
    phone?: boolean;
    zip?: boolean;
    numeric?: boolean;
    pattern?: string;
    css?: string;
    invalidMsg?: string;
    selectValues?: SelectOption[];
}

export interface SelectOption {
    displayName: string;
    value: string;
}

export interface SubmittedRebateFormRequest {
    accountId: string;
    submittedRebateInfoId: string;
}