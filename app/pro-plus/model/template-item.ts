import { SkusVariation } from './sku-variation';
import { Variations } from './variations';
import { ImageUrl } from './image-url';
import { AttributeValues } from './attribute-values';

export interface TemplateItem {
    productImageUrl?: any;
    productOnErrorImageUrl?: string;
    unitPrice?: number;
    itemNumber: string;
    itemUnitPrice?: number | null;
    quantity?: number;
    itemOrProductDescription?: string;
    nickName?: string | null;
    unitOfMeasure?: string | null;
    vendorColorId?: any;
    templateItemId: string;
    available?: boolean;
    description?: any;
    productOrItemNumber?: string;
    subTotal?: number;
    defaultUnitOfMeasure: string;
    itemFromQuote: boolean;
    internalProductName?: string;
    skusVariation?: SkusVariation;
    itemSubTotal?: number;
    variations?: Variations;
    imageUrl?: ImageUrl | null;
    color?: AttributeValues | null;
    MFG?: AttributeValues | null;
    pdpUrl?: string | null;
    multiVariationData?: MultiVariationData;
}

export interface MultiVariationData {
    currentVariations?: CurrentVariation;
    variations?: Variations;
    vendorColors?: VendorColor[];
}

export interface CurrentVariation {
    [attribute: string]: string;
}

export interface VendorColor {
    MFG: string;
    color: string;
    id: string;
    name: string;
    sku: string;
}
