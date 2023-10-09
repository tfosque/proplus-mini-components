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
import { DTInfo } from './dt-info';
import {
    OrderHistoryLineItemV1,
    OrderHistoryLineItemV2,
} from './order-history-line-item';
import { OrderHistory, OrderHistoryV2 } from './order-history';

export interface OrderDetailResponse {
    message?: string;
    order: OrderHistory;
    lineItems?: Array<OrderHistoryLineItemV1>;
    dTInfo?: DTInfo;
}

export interface OrderDetailResponseV2 {
    order: OrderHistoryV2;
    lineItems: OrderHistoryLineItemV2[];
    DTStatus: {
        displayName: string;
        contKey: string;
        contValue: string;
        statusEndDate: string;
        infos: [
            {
                defaultValue: string;
                imageUrl: string;
                active: true;
                key: string;
                value: string;
            }
        ];
    };
    // DTPhotos: {
    //     ThumbnailUrl: string;
    //     LargeUrl: string;
    //     Timestamp: string;
    // }[];
    branchDTEnabled: boolean;
    DTEnabled: boolean;
    EVReportId: number;
    EVEligibleForUpgrade: boolean;
    hasDTError: boolean;
}

export interface DTOrderDetailResponse {
    DTStatus: DTStatus;
    DTPhotos: DTPhoto[];
    branchDTEnabled: boolean;
    DTEnabled: boolean;
    hasDTError: boolean;
}

export interface DTStatus {
    displayName: string;
    contKey: string;
    contValue: string;
    statusEndDate: string;
    infos: [
        {
            defaultValue: string;
            imageUrl: string;
            active: true;
            key: string;
            value: string;
        }
    ];
}

export interface DTPhoto {
    thumbnailUrl: string;
    largeUrl: string;
    timestamp: string;
}

