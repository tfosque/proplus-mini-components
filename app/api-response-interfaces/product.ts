import { ProductCategory } from './product-category';
import { ProductHoverAttributes } from './product-hover-attributes';
import { ProductSkuResponse, fromSku2 } from './product-sku';
import {
    ProductDetailsResponse,
    Sku,
} from '../pro-plus/services/products.service';
import { ProductListItem } from '../pro-plus/model/product-item-list';

/**
 * Interface that maps to an expected piece of the API returns
 */
export interface Product {
    productImage: string;
    productOnErrorImage: string;
    productAdditionalOnErrorImage: string;
    relatedProducts: any;
    categories: ProductCategory[];
    shortDesc: string;
    longDesc: string;
    itemNumber: string;
    manufactureNumber: string;
    hoverAttributes?: ProductHoverAttributes;
    productName: string;
    productId: string;
    baseProductName: string;
    brand: string;
    internalProductName: string;
    skuList: ProductSkuResponse[];
    isAddedToFavorites?: boolean;
}

export function fromProductDetailResponse(
    itemResponse: ProductDetailsResponse
) {
    const p = itemResponse.product;
    const newProduct: Product = {
        ...p,
        skuList: ( itemResponse.skuList || [] ).map( ( s ) => fromSku( s ) ),
    };
    return newProduct;
}

function fromSku( s: Sku ): ProductSkuResponse {
    return {
        ...s,
        auxiliaryImages: s.auxiliaryImages || [],
        skuShortDesc: s.skuShortDesc || '',
        itemImage: s.itemImage || '',
        variations: s.variations || null,
    };
}

export function fromProductListItem( item: ProductListItem ) {
    const newItem: Product = {
        ...item,
        relatedProducts: [],
        productImage: item.productImage || '',
        productOnErrorImage: item.productOnErrorImage || '',
        productAdditionalOnErrorImage: item.productAdditionalOnErrorImage || '',
        categories: item.categories || [],
        shortDesc: item.shortDesc || '',
        longDesc: item.longDesc || '',
        itemNumber: item.itemNumber || '',
        manufactureNumber: item.manufactureNumber || '',
        hoverAttributes: undefined,
        productName: item.productName || '',
        productId: item.productId || '',
        baseProductName: item.baseProductName || '',
        brand: item.brand || '',
        internalProductName: item.internalProductName || '',
        skuList: ( item.skuList || [] ).map( fromSku2 ),
    };
    return newItem;
}
