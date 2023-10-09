import { Product } from './product';
import { ProductSpecifications } from './product-specifications';
import { ProductResources } from './product-resources';
import { ProductSkuResponse } from './product-sku';

/**
 * Interface that maps to an expected piece of the API returns
 */
export interface ItemResponse {
    product: Product;
    message: string;
    specification: ProductSpecifications;
    resource: ProductResources;
    currentSKU: ProductSkuResponse;
    skuList: ProductSkuResponse[];
    variations: {
        [key: string]: {
            [key: string]: string[];
        };
    };
}
