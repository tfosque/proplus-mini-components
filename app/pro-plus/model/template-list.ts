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
import { Profile } from './profile';
import { TemplateListItem } from './template-list-item';

export interface TemplateReference {
    templateId: string;
    templateName: string;
    lastModifiedDate?: string;
    lastModifiedUser?: Profile;
    accountLegacyId: string;
    accountName: string;
    createdByUser?: Profile;
    templateItems?: Array<TemplateListItem>;
    isAccountClosed?: boolean;
}
