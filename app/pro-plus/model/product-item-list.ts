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
 */ import { Category } from './category';
import { HoverAttributes } from './hover-attributes';
import { Sku } from '../services/products.service';

export interface ProductListItem {
    productImage?: string;
    productOnErrorImage?: string;
    productAdditionalOnErrorImage?: string;
    longDesc?: string;
    brand?: string;
    manufactureNumber?: string;
    categories?: Array<Category>;
    shortDesc?: string;
    itemNumber?: string;
    itemFromQuote?: boolean;
    hoverAttributes?: HoverAttributes;
    productName?: string;
    productId?: string;
    baseProductName?: string;
    internalProductName?: string;
    url?: string;
    skuList?: Array<Sku>;
}
