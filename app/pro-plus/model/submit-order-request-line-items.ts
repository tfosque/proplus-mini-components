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

export interface SubmitOrderRequestLineItems {
    itemNumber?: string;
    quantity?: number;
    unitOfMeasure?: string;
    description?: string;
}
