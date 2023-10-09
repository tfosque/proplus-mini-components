export interface RebateFormVendorDetail {
    formName: string;
    rebateImage?: string;
    rebateFlyer?: string;
}

export interface RebateFormResponse {
    result: RebateFormContent;
    success: boolean;
    messages?: string;
}

export interface RebateFormContent {
    rebateName?: string;
    ableSubmit?: boolean;
    rows: RebateFormRow[];
    rebateId?: string;
}

export interface RebateFormRow {
    fields?: RebateFormField[];
}

export interface RebateFormField {
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

// export enum RebateFormInfoGroup {
//     displayOnly = 'rebateDisplayOnly',
//     info = 'rebateInfo',
//     address = 'rebateAddress',
//     customInfo = 'rebateCustomInfo'
// }
