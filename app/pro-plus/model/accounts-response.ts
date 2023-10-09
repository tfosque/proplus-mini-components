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
 */ import { AccountDetails } from './account-with-branch';

export interface AccountsResponse {
    message?: string;
    messageCode?: number;
    result: string;
    totalNumRecs?: number;
    pageNumRecs?: number;
    accounts: Array<AccountDetails>;
}
export const DefaultAccountResponse = {
    message: '',
    messageCode: 0,
    result: '',
    totalNumRecs: 0,
    pageNumRecs: 0,
    accounts: [
        {
            accountName: '',
            accountEnabled: false,
            accountLegacyId: '',
            accountViewPrices: false,
            branch: {
                address: {
                    postalCode: '',
                    state: '',
                    address1: '',
                    address2: '',
                    address3: '',
                    country: '',
                    city: '',
                },
                branchNumber: '',
                branchName: '',
                branchPhone: '',
                branchRegionId: '',
            },
        },
    ],
};
