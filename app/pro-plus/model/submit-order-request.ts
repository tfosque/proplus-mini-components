/**
 * Beacon New Rest Service Ver 1.0
 * Release notes:  `4.8`  * Add `onHold` to request body of endpoint `/submitOrder`
 *
 * OpenAPI spec version: release/4.8
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { Shipping } from './shipping';
import { SubmitOrderRequestJob } from './submit-order-request-job';
import { SubmitOrderRequestLineItems } from './submit-order-request-line-items';

export interface SubmitOrderRequest {
    accountId?: string;
    job?: SubmitOrderRequestJob;
    purchaseOrderNo?: string;
    /**
     * Order Status
     */
    orderStatusCode?: SubmitOrderRequest.OrderStatusCodeEnum;
    /**
     * Api Site Id
     */
    apiSiteId?: SubmitOrderRequest.ApiSiteIdEnum;
    lineItems?: Array<SubmitOrderRequestLineItems>;
    shipping?: Shipping;
    sellingBranch?: string;
    specialInstruction?: string;
    checkForAvailability?: string;
    pickupDate?: string;
    pickupTime?: string;
    onHold?: boolean;
}
export namespace SubmitOrderRequest {
    export type OrderStatusCodeEnum = 'I' | 'R' | 'P' | 'C' | 'O' | 'K' | 'N';
    export const OrderStatusCodeEnum = {
        I: 'I' as OrderStatusCodeEnum,
        R: 'R' as OrderStatusCodeEnum,
        P: 'P' as OrderStatusCodeEnum,
        C: 'C' as OrderStatusCodeEnum,
        O: 'O' as OrderStatusCodeEnum,
        K: 'K' as OrderStatusCodeEnum,
        N: 'N' as OrderStatusCodeEnum,
    };
    export type ApiSiteIdEnum = 'HVR' | 'ALL';
    export const ApiSiteIdEnum = {
        HVR: 'HVR' as ApiSiteIdEnum,
        ALL: 'ALL' as ApiSiteIdEnum,
    };
}