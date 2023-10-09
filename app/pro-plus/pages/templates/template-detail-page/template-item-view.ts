import {
    Variations,
    IAttrOption,
    getActiveVariations,
    applyVariationsFilter,
} from '../../../model/variations';
import {
    TemplateItem,
    CurrentVariation,
    VendorColor,
} from '../../../model/template-item';
import { ITemplateItem } from './template-view-model';
import { FacetSelector } from './facet-selector';
import { ImageUrl } from '../../../model/image-url';
import { PerfectOrderItem } from '../../../services/perfect-order.service';
import { ProductImp } from '../../../../global-classes/product-imp';
import { ProductsService } from '../../../services/products.service';
import { CommerceItem } from '../../../services/GetOrderApprovalDetailResponse';
import { toSet } from '../../../model/variations';
import { OrderResponseLineItem } from '../../../../pro-plus/services/shopping-cart-service';
import { NullPartial } from '../../../../common-components/classes/type-utilities';
import { ProplusUrls } from '../../../../enums/proplus-urls.enum';
import { EVItemWithVariation } from '../../eagle-view/smart-order/smart-order.component';

export interface ITemplateItemView {
    productOrItemNumber: string;
    imageUrl: ImageUrl | null;
    unitPrice: number | null;
    itemUnitPrice: number | null;
    unitOfMeasure: string;
    variations: Variations;
    itemOrProductDescription: string | undefined;
    currentSKU: string;
    needsSaving: boolean;
    selection: { attr: string; value: string }[];
    setFilter(attr: string, value: string): Promise<void>;
}

export class TemplateItemView implements ITemplateItem, ITemplateItemView {
    private readonly originalQuantity: number;
    private productInfo?: ProductImp;

    constructor(
        private readonly productService: ProductsService,
        public readonly itemFromQuote: boolean,
        public readonly lineItemId: string,
        public quantity: number,
        public readonly itemNumber: string,
        private readonly _productOrItemNumber: string,
        private readonly _imageUrl: ImageUrl | null,
        private readonly _imageOnErrorUrl: string | null,
        private readonly _unitPrice: number | null,
        private readonly _itemUnitPrice: number | null,
        private readonly _unitOfMeasure: string,
        private readonly _variations: Variations,
        private readonly _itemOrProductDescription: string | undefined,
        public nickName: string,
        public selectedFilters: Map<string, string>,
        public facetSelectors: FacetSelector[],
        public activeVariations: Record<string, IAttrOption[]>,
        public selectedSKU: string | null = null,
        public readonly isSelected: boolean = true,
        public readonly subtotal: number | null = null,
        public readonly currentVariations: CurrentVariation | null = null,
        public readonly vendorColors: VendorColor[] | null = null,
        public vendorColorId: string | null = null,
        public moreFacetOptions: boolean = false
    ) {
        this.originalQuantity = quantity;
    }

    public get productOrItemNumber(): string {
        const p = this.productInfo;
        if (!p) {
            return this._productOrItemNumber;
        }
        const sku = p.currentSKU;
        if (!sku) {
            return this._productOrItemNumber;
        }
        return p.productId;
    }
    public get imageUrl(): ImageUrl | null {
        const p = this.productInfo;
        if (!p) {
            return this._imageUrl;
        }
        const sku = p.currentSKU;
        if (!sku) {
            return this._imageUrl;
        }
        const i: ImageUrl = {
            large: sku.itemImage.heroSrc(),
            swatch: sku.itemImage.swatchSrc(),
            thumbnail: sku.itemImage.thumbSrc(),
        };
        return i;
    }
    public get unitPrice(): number | null {
        const p = this.productInfo;
        if (!p) {
            return this._unitPrice;
        }
        const sku = p.currentSKU;
        if (!sku) {
            return this._unitPrice;
        }
        return sku.unitPrice; //  TODO: Get Price
    }
    public get itemUnitPrice(): number | null {
        const p = this.productInfo;
        if (!p) {
            return this._itemUnitPrice;
        }
        const sku = p.currentSKU;
        if (!sku) {
            return this._itemUnitPrice;
        }
        return sku.unitPrice; //  TODO: Get Price
    }
    public get unitOfMeasure(): string {
        const p = this.productInfo;
        if (!p) {
            return this._unitOfMeasure;
        }
        const sku = p.currentSKU;
        if (!sku) {
            return this._unitOfMeasure;
        }
        return sku.currentUOM || this._unitOfMeasure;
    }
    public get variations(): Variations {
        const p = this.productInfo;
        if (!p) {
            return this._variations;
        }
        return p.variations;
    }
    public get itemOrProductDescription(): string | undefined {
        const p = this.productInfo;
        if (!p) {
            return this._itemOrProductDescription;
        }
        return p.productName;
    }

    public get imageOnErrorUrl(): string {
        const p = this.productInfo;
        if (!p) {
            return this._imageOnErrorUrl || '';
        }
        return p.productOnErrorImage;
    }

    get currentSKU(): string {
        return this.selectedSKU || this.itemNumber;
    }
    get needsSaving(): boolean {
        const differentSKU =
            this.selectedSKU && this.selectedSKU !== this.itemNumber;
        const differentQty = this.originalQuantity !== this.quantity;
        return differentSKU || differentQty;
    }

    public static fromTemplateItem(
        productService: ProductsService,
        item: TemplateItem,
        isSelected = true
    ) {
        const variations =
            (item.variations
                ? item.variations
                : item.multiVariationData
                ? item.multiVariationData.variations
                : null) || {};
        const selectedFilters = getSelectedFiltersForSku(
            item.itemNumber,
            variations
        );
        const { facetOptions } = getActiveVariations(
            selectedFilters,
            variations
        );
        return new TemplateItemView(
            productService,
            item.itemFromQuote,
            item.templateItemId,
            item.quantity || 0,
            item.itemNumber,
            item.productOrItemNumber || '',
            item.imageUrl || null,
            item.productOnErrorImageUrl || null,
            item.unitPrice || null,
            item.itemUnitPrice || null,
            item.unitOfMeasure || item.defaultUnitOfMeasure,
            variations,
            item.itemOrProductDescription,
            item.nickName || '',
            selectedFilters,
            [],
            facetOptions,
            null,
            isSelected,
            null,
            item.multiVariationData
                ? item.multiVariationData.currentVariations || null
                : null,
            item.multiVariationData
                ? item.multiVariationData.vendorColors
                    ? item.multiVariationData.vendorColors
                    : null
                : null,
            item.vendorColorId ? item.vendorColorId : null
        )
            .setFacetSelectors(true)
            .setMoreOptions();
    }

    public static fromCommerceItem(
        productService: ProductsService,
        item: NullPartial<CommerceItem>
    ) {
        const variations = {};
        const selectedFilters = new Map<string, string>();
        const { facetOptions } = getActiveVariations(
            selectedFilters,
            variations
        );
        return new TemplateItemView(
            productService,
            item.itemFromQuote!,
            item.id || '',
            item.quantity || 0,
            item.itemNumber || '0',
            item.itemNumber || '',
            { thumbnail: item.thumbImageUrl || '', large: item.imageUrl || '' },
            item.imageOnErrorUrl || null,
            item.price || null,
            item.price || null,
            item.uom || '',
            variations,
            item.description || '',
            item.nickName || '',
            selectedFilters,
            [],
            facetOptions,
            item.itemNumber
        )
            .setFacetSelectors(true)
            .setMoreOptions();
    }

    public static fromItem(
        productService: ProductsService,
        item: PerfectOrderItem,
        setFacetSelectors = false
    ) {
        const variations = item.variations || {};
        const selectedFilters = new Map<string, string>();
        const { facetOptions } = getActiveVariations(
            selectedFilters,
            variations
        );
        return new TemplateItemView(
            productService,
            item.itemFromQuote,
            item.productOrItemNumber,
            item.quantity || 0,
            item.itemNumber,
            item.productOrItemNumber || '',
            { thumbnail: item.productImageUrl },
            item.productOnErrorImageUrl,
            item.unitPrice || null,
            item.unitPrice || null,
            item.unitOfMeasure,
            variations,
            item.itemOrProductDescription,
            item.nickName || '',
            selectedFilters,
            [],
            facetOptions,
            item.itemNumber
        )
            .setFacetSelectors(setFacetSelectors)
            .setMoreOptions();
    }

    public static fromEVItem(
        productService: ProductsService,
        item: EVItemWithVariation,
        setFacetSelectors = false
    ) {
        const variations = item.variations || {};
        // const selectedFilters = new Map<string, string>();
        const selectedFilters = getSelectedFiltersForSku(
            item.itemNumber,
            variations
        );
        const { facetOptions } = getActiveVariations(
            selectedFilters,
            variations
        );
        return new TemplateItemView(
            productService,
            false,
            item.productId,
            item.quantity || 0,
            item.itemNumber,
            item.productId || '',
            { thumbnail: item.itemImage },
            '',
            item.price || null,
            item.price || null,
            item.uom,
            variations,
            item.itemName,
            '',
            selectedFilters,
            [],
            facetOptions,
            null,
            true,
            null,
            item.currentVariations || null,
            item.vendorColors ? item.vendorColors : null,
            item.currentVendorColorId ? item.currentVendorColorId : null
        )
            .setFacetSelectors(setFacetSelectors)
            .setMoreOptions();
    }

    //  OrderResponseLineItem
    public static fromOrderResponseItem(
        productService: ProductsService,
        item: OrderResponseLineItem
    ) {
        const variations = {};
        const selectedFilters = new Map<string, string>();
        const { facetOptions } = getActiveVariations(
            selectedFilters,
            variations
        );
        return new TemplateItemView(
            productService,
            item.itemFromQuote,
            item.commerceItemId,
            item.quantity || 0,
            item.catalogRefId,
            item.productId,
            {
                thumbnail: addUrlToImage(item.productImageUrl),
                large: addUrlToImage(item.productImageUrl),
            },
            item.productOnErrorImageUrl,
            item.unitPrice || null,
            item.unitPrice || null,
            item.uom,
            variations,
            item.itemOrProductDescription,
            '',
            selectedFilters,
            [],
            facetOptions,
            item.commerceItemId
        )
            .setFacetSelectors(true)
            .setMoreOptions();
    }

    private setFacetSelectors(setDefaultFacet: boolean): TemplateItemView {
        const variationSet = toSet(this.variations);
        const filteredVariation = variationSet.filter(
            (v) => v.sku === this.itemNumber
        );
        this.facetSelectors = Object.keys(this.variations)
            .filter((name) => (this.activeVariations[name] || []).length >= 1)
            .map((name) => {
                if (!setDefaultFacet) {
                    return new FacetSelector(this, name, '');
                }
                const variationsForName = filteredVariation.filter(
                    (fv) => fv.attr === name
                );
                const currVariation = this.currentVariations
                    ? this.currentVariations[name]
                    : null;
                const newValue =
                    variationsForName.length > 0
                        ? variationsForName.length === 1
                            ? variationsForName[0].attrValue
                            : currVariation
                            ? currVariation
                            : variationsForName[0].attrValue
                        : '';
                return new FacetSelector(this, name, newValue);
            });
        return this;
    }

    private setMoreOptions(): TemplateItemView {
        let moreOptions = false;
        if (this.variations) {
            if (this.facetSelectors.length) {
                moreOptions = this.facetSelectors.some(
                    (fs) => (this.activeVariations[fs.name] || []).length > 1
                );
            }
        }
        this.moreFacetOptions = moreOptions;
        return this;
    }

    async setFilter(attr: string, value: string): Promise<void> {
        const activeVariations = this.activeVariations;
        const selectedFilters = this.selectedFilters;
        const variations = this.variations;
        const facetSelectors = this.facetSelectors;

        //  1. Do calculations with no-side effects
        //  If the user picks a disabled option, clear our existing filters
        const { newFilters, facetOptions, selectedSKU } = applyVariationsFilter(
            variations,
            selectedFilters,
            activeVariations,
            attr,
            value
        );

        this.selectedFilters = newFilters;
        this.activeVariations = facetOptions;
        //  Facet selectors should match the selectedFilters
        facetSelectors.forEach((f) => {
            const newValue = newFilters.get(f.name) || '';
            f.setValue(newValue);
        });
        this.selectedSKU = selectedSKU;

        if (!selectedSKU) {
            return;
        }

        const product = await this.productService
            .getProduct(this.productOrItemNumber, selectedSKU)
            .toPromise();
        if (!product) {
            return;
        }
        this.productInfo = product;
    }

    get selection(): { attr: string; value: string }[] {
        return Array.from(this.selectedFilters.entries()).map(
            ([attr, value]) => ({
                attr,
                value,
            })
        );
    }
}
function addUrlToImage(image: string) {
    if (image.startsWith(ProplusUrls.root)) {
        return image;
    } else {
        return `${ProplusUrls.root}${image}`;
    }
}

function getSelectedFiltersForSku(sku: string, variations: Variations) {
    const selection = new Map<string, string>();
    Object.entries(variations).forEach((v) => {
        const [facetName, attributes] = v;
        for (const [facetValue, skus] of Object.entries(attributes)) {
            const hasSku = skus.some((s) => s === sku);
            if (hasSku) {
                selection.set(facetName, facetValue);
            }
        }
    });
    return selection;
}
