import { Product, fromProductListItem } from './product';
import { ProductCategory } from './product-category';
import { FacetResponse } from './facet-response';
import { ItemListResponseV2 } from '../pro-plus/model/item-list-response';

/**
 * Interface that maps to an expected piece of the API returns
 */
export interface ItemListResponseV3 {
    message: string;
    totalNumRecs: number;
    pageNumRecs: number;
    items: Product[];
    categories: ProductCategory[];
    facets: {
        [key: string]: FacetResponse[];
    };
}

export function fromItemListResponseV2( res: ItemListResponseV2 ) {
    const newResV3: ItemListResponseV3 = {
        ...res,
        message: res.message || '',
        totalNumRecs: res.totalNumRecs || 0,
        pageNumRecs: res.pageNumRecs || 0,
        categories: res.categories || [],
        facets: res.facets || {},
        items: ( res.items || [] ).map( ( item ) => {
            return fromProductListItem( item );
        } ),
    };
    return newResV3;
}
