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
import { AccountSummary } from './account';
import { Branch } from './branch';
import { DeliveryTrackingSettings } from './dt-settings';
import {
    ContactAddress,
    GetCurrentUserInfoResponseV2,
} from './get-current-user-response-v2';

export type CurrentUser =
    | GetCurrentUserInfoResponse
    | GetCurrentUserInfoResponseV2;

export interface GetCurrentUserInfoResponse {
    message?: string;
    accountBranch?: Branch;
    lastName?: string;
    cartLineItems?: number;
    profileId?: string;
    roleType?: string;
    firstName?: string;
    lastSelectedAccount: AccountSummary;
    deliveryTrackingSettings?: DeliveryTrackingSettings;
    internalUser?: boolean;
    userType?: string;
    email: string;
    firstLoggedInDate?: string; // TODO
    login?: string;
    contactPhoneNumber?: string | null;
    officePhoneNumber?: string | null;
    mobilePhoneNumber?: string | null;
    contactAddress?: ContactAddress | null;
    hasPrivateEVAccount?: boolean;
    lastActivity?: string;
    profileEagleViewPurchaseStatus?: boolean;
}

export const isLoggedIn = (user: GetCurrentUserInfoResponse | null) => {
    return user != null && user.profileId != null;
};
