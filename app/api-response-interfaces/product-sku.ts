import { Sku } from "../pro-plus/services/products.service";

/**
 * Interface that maps to an expected piece of the API returns
 */
export interface ProductSkuResponse {
  currentUOM: string;
  auxiliaryImages: AuxiliaryImage[];
  manufactureNumber?: string;
  productNumber?: string;
  skuShortDesc: string;
  itemNumber: string;
  uomlist?: string[];
  itemImage: string | any;
  isAddedToFavorites?: boolean;

  unitPrice: number;
  /**
   * Currently this is only used for color.  So it is of form
   * variations: {
   *  color: [
   *    "string"
   *  ]
   * }
   */
  variations: Record<string, string[]> | null;
}

export function fromSku2( sku: Sku ) {
  const newSku: ProductSkuResponse = {
    ...sku,
    auxiliaryImages: sku.auxiliaryImages || [],
    currentUOM: sku.currentUOM || "",
    manufactureNumber: sku.manufactureNumber || "",
    productNumber: sku.productNumber || "",
    skuShortDesc: sku.skuShortDesc || "",
    itemNumber: sku.itemNumber || "",
    itemImage: sku.itemImage || "",
    unitPrice: sku.unitPrice || 0,
    variations: sku.variations || null,
    isAddedToFavorites: sku.isAddedToFavorites,
  };
  return newSku;
}

export interface AuxiliaryImage {
  videoUrl?: string;
  image: string;
}
