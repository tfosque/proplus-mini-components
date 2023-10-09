import { SkuAttributes } from './sku-attributes';

export interface SkusVariation {
    [sku: string]: SkuAttributes;
}
