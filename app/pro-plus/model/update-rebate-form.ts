import { RebateAddress, RebateInfo } from './submit-rebate';
import { Message } from './shopping-cart-response';

export interface UpdateRebateFormRequest {
    rebateInfoId: string;
    rebateInfo?: RebateInfo;
    rebateAddress?: RebateAddress;
    rebateCustomInfo?: any;
}

export interface UpdateRebateFormResponse {
    result?: any;
    success: boolean;
    messageCode?: number | null;
    messages?: Message[];
}

export interface UnenrollRebateResponse {
    result?: any;
    success: boolean;
    messages?: UnenrollMessage[];
}

interface UnenrollMessage {
    type: string;
    value: string;
    code: string | null;
    key: string | null;
}