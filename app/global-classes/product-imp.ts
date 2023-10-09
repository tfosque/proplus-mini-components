import { Image } from './image';
import { ProductCategory } from '../api-response-interfaces/product-category';
import { ProductHoverAttributes } from '../api-response-interfaces/product-hover-attributes';
import { ProplusUrls } from '../enums/proplus-urls.enum';
import { ProductSpecifications } from '../api-response-interfaces/product-specifications';
import { ProductResources } from '../api-response-interfaces/product-resources';
import { Product } from '../api-response-interfaces/product';
import { ProductSku } from './product-sku';
import {
    Variations,
    getActiveVariations,
    getUniqueColors,
} from '../pro-plus/model/variations';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemResponse } from '../api-response-interfaces/item-response';
import { ProductSkuResponse } from '../api-response-interfaces/product-sku';
import {
    ProductDetailsResponse,
    ProductsService,
    SkuPrices,
    PricingResponse,
} from '../pro-plus/services/products.service';
import { SessionInfo } from '../pro-plus/services/SessionInfo';
/**
 * Class that adds functionality to product data from beacon services
 */
export class ProductImp {
    public productImage: Image;
    public productOnErrorImage: string;
    public productAdditionalOnErrorImage: string;
    public relatedProducts: any;
    public categories: ProductCategory[];
    public shortDesc: string;
    public longDesc: string;
    public itemNumber: string;
    public itemItemNumber?: string;
    public manufactureNumber: string;
    public hoverAttributes?: ProductHoverAttributes;
    public productName: string;
    public productId: string;
    public name: string;
    public proplusUrl: string;
    public specification?: ProductSpecifications;
    public resource?: ProductResources;
    public currentSKU?: ProductSku;
    public skuList: ProductSku[];
    public brand: string;
    public variations: Variations = {};
    public thumbnails: Thumbnail[] = [];
    public unitPrice: number;
    public currentUOM: string | null;
    public unavailableSkuList: Set<string>;
    private proPlusProducts?: ProductsService;
    private accountId?: string;
    public isAddedToFavorites?: boolean;
    private readonly priceInfo: Map<
        string,
        Map<string, UnitPrice | 'not-available'>
    >;

    private constructor(
        forAccount: string | null,
        productData: Product,
        pricingResponse?: PricingResponse,
        specs?: ProductSpecifications,
        resourceData?: ProductResources,
        currentSku?: ProductSku,
        skuList?: ProductSku[],
        variations?: Variations,
        isAddedToFavorite?: boolean
    ) {
        this.productImage = new Image(
            productData.productImage,
            productData.productName,
            true
        );
        this.isAddedToFavorites = isAddedToFavorite;

        this.productOnErrorImage = productData.productOnErrorImage;
        this.productAdditionalOnErrorImage =
            productData.productAdditionalOnErrorImage;
        this.relatedProducts = productData.relatedProducts;
        this.categories = productData.categories;
        this.shortDesc = productData.shortDesc;
        this.longDesc = productData.longDesc;
        this.itemNumber = productData.itemNumber;
        this.manufactureNumber = productData.manufactureNumber;
        this.hoverAttributes = productData.hoverAttributes;
        this.productName = productData.productName;
        this.productId = productData.productId;
        this.specification = specs;
        this.resource = resourceData;
        this.currentSKU = currentSku;
        this.skuList = skuList || [];
        this.brand = productData.brand;
        this.variations = variations || {};
        this.unitPrice = 0;
        this.currentUOM = ( () => {
            //  First try to get the UOM from the current SKU
            const currentUOM = currentSku ? currentSku.currentUOM : null;
            if ( currentUOM ) {
                return currentUOM;
            }
            //  If that field try to get it from our pricing records
            const currentItemId = currentSku
                ? currentSku.itemNumber
                : productData.itemNumber;
            if ( !pricingResponse ) {
                return null;
            }
            const pricingRecords = pricingResponse.orderPricing[currentItemId];
            const uom = Object.keys( pricingRecords ).find( ( i ) => !!i );
            //  QUESTION:  Is there ever a legitimate reason where we should except
            //             that we're not getting a valid UOM
            if ( !uom ) {
                return null;
            }
            return uom;
        } )();
        this.unavailableSkuList = new Set();
        this.priceInfo = new Map();

        /**
         * TODO: Once we get the finalized new API we should be able to remove this check
         */
        this.name = productData.internalProductName
            ? productData.internalProductName
            : productData.baseProductName;

        /**
         * If color variations exist for product but not on the current sku, set the current color to the first color in the sku list.
         * Else don't set the color.
         */
        if (
            this.currentSKU &&
            this.currentSKU.variations &&
            this.currentSKU.variations.color
        ) {
            const color = this.currentSKU.variations.color[0];

            this.proplusUrl = `${ProplusUrls.root}${ProplusUrls.productDetail}${productData.productId}?skuId=${productData.itemNumber}&Color=${color}`;
        } else {
            // Build out a predefined sku id based on the product data from the constructor
            this.proplusUrl = `${ProplusUrls.root}${ProplusUrls.productDetail}${productData.productId}?skuId=${productData.itemNumber}`;
        }
        this.thumbnails = this.calcSkuThumbnails();
        if ( !this.skuList.length && this.currentSKU ) {
            this.skuList.push( this.currentSKU );
        }
    }

    static fromProduct(
        forAccount: string | null,
        product: Product,
        pricingResponse?: PricingResponse
    ) {
        return new ProductImp( forAccount, product, pricingResponse );
    }

    static fromItemResponse(
        forAccount: string | null,
        itemResponse: ItemResponse,
        pricingResponse?: PricingResponse
    ): ProductImp | null {
        if ( !itemResponse || !itemResponse.product ) {
            return null;
        }

        const currentSku: ProductSkuResponse = itemResponse.currentSKU;
        const currentSkuImage: Image = new Image(
            currentSku.itemImage,
            itemResponse.product.internalProductName,
            true
        );
        const currentSkuClass = ProductSku.fromSkuResponse(
            currentSkuImage,
            currentSku
        );
        return new ProductImp(
            forAccount,
            itemResponse.product,
            pricingResponse,
            itemResponse.specification,
            itemResponse.resource,
            currentSkuClass,
            itemResponse.skuList.map( ( curSku ) => {
                const curSkuImage = new Image(
                    curSku.itemImage,
                    itemResponse.product.internalProductName,
                    true
                );
                return ProductSku.fromSkuResponse( curSkuImage, curSku );
            } ),
            itemResponse.variations
        );
    }

    includeProPlusDetails( details: ProductDetailsResponse ) {
        if ( details && details.currentSKU ) {
            this.unitPrice = details.currentSKU.unitPrice;
            this.currentUOM = details.currentSKU.currentUOM;
            if ( this.currentSKU ) {
                this.currentSKU.uomlist = details.currentSKU.uomlist || [];
            }
        }
        return this;
    }

    public addProductService(
        proPlusProducts: ProductsService,
        accountId: number
    ) {
        this.proPlusProducts = proPlusProducts;
        this.accountId = accountId ? accountId.toString() : undefined;
    }
    setItemNo( newItemNo: string ) {
        const foundSku = this.skuList.find( ( s ) => s.itemNumber === newItemNo );
        if ( foundSku ) {
            this.itemNumber = newItemNo;
            this.currentSKU = foundSku;
        }
        this.thumbnails = this.calcSkuThumbnails();
    }

    private calcSkuThumbnails(): Thumbnail[] {
        const selectedSku = this.itemNumber;
        const skus = new Map(
            this.skuList.map( ( { itemNumber, itemImage, variations } ) => {
                const colors = ( variations || {} ).color || [];
                const color = colors.length ? colors[0] : null;

                const thumb: Thumbnail = {
                    itemNumber,
                    itemImage,
                    color,
                    colors,
                    isActive: selectedSku === itemNumber,
                    enabled: true,
                };
                return [color, thumb] as [string, Thumbnail];
            } )
        );

        return Array.from( skus.values() );
    }

    public get defaultFacetSelection(): Map<string, string> {
        return this.currentSKU ? this.currentSKU.getSelection() : new Map();
    }

    public getUniqueColors() {
        return getUniqueColors( this.variations );
    }

    public get UOMList() {
        if ( !this.currentSKU ) {
            return [];
        }
        return this.currentSKU.uomlist || [];
    }

    public async getPriceInfo(
        skuId: string,
        searchUom: string,
        session?: SessionInfo,
        productService?: ProductsService
    ): Promise<UnitPrice | null> {
        const accountId =
            ( session && session.accountId && session.accountId.toString() ) ||
            this.accountId;
        productService = productService || this.proPlusProducts;
        // Don't even try if we're not logged in
        if ( !accountId || !productService ) {
            return null;
        }

        // Make an attempt to check the cache first
        const skuUOMs = this.priceInfo.get( skuId );
        if ( skuUOMs ) {
            const unitPrice = skuUOMs.get( searchUom );
            if ( unitPrice === 'not-available' ) {
                return null;
            }
            if ( unitPrice ) {
                return unitPrice;
            }
        }

        //  Ask the service for the price
        const result = await productService.getPricingForUOM( skuId, accountId );
        if ( !result || !result.priceInfo ) {
            return this.setUOMResult( skuId, searchUom, 'not-available' );
        }

        const skuPrices = Object.entries( result.priceInfo ).flatMap(
            ( [_, units] ) => {
                const orderPricing = getUOMList( result.orderPricing, skuId );
                const priceInfo = getUOMList( result.priceInfo, skuId );
                return Object.entries( units ).map( ( [UOM, price] ) => ( {
                    UOM,
                    price,
                    orderPricing,
                    priceInfo,
                } ) );
            }
        );
        if ( !skuPrices || !skuPrices.length ) {
            return this.setUOMResult( skuId, searchUom, 'not-available' );
        }
        return this.setUOMResult( skuId, searchUom, skuPrices[0] );
    }

    private setUOMResult(
        skuId: string,
        uom: string,
        unitprice: UnitPrice | 'not-available'
    ) {
        let skuUOMs = this.priceInfo.get( skuId );
        if ( !skuUOMs ) {
            skuUOMs = new Map();
            this.priceInfo.set( skuId, skuUOMs );
        }
        skuUOMs.set( uom, unitprice );
        if ( unitprice === 'not-available' ) {
            return null;
        }
        return unitprice;
    }
}

export class ProductSelector {
    private readonly selectedFilters!: BehaviorSubject<Map<string, string>>;
    public readonly facets!: Observable<FacetSelector[]>;

    constructor( private readonly product: ProductImp ) {
        const currentSku = this.product.currentSKU;
        const newSelection = currentSku
            ? currentSku.getSelection()
            : new Map<string, string>();
        this.selectedFilters = new BehaviorSubject( newSelection );
        this.facets = this.selectedFilters.pipe(
            map( ( sel ) => this.calcFacets( sel ) )
        );
    }

    public setSKU( newSKU: string ) {
        if ( this.product.itemNumber === newSKU ) {
            return;
        }
        this.product.setItemNo( newSKU );
        const currentSku = this.product.currentSKU;
        const newSelection = currentSku
            ? currentSku.getSelection()
            : new Map<string, string>();
        if ( currentSku ) {
            this.selectedFilters.next( newSelection );
        } else {
            this.selectedFilters.next( new Map() );
        }
    }

    setFilter( name: string, value: string ) {
        const newMap = new Map( this.selectedFilters.value.entries() );
        newMap.set( name, value );
        this.selectedFilters.next( newMap );
    }

    private calcFacets( selectedFilters: Map<string, string> ): FacetSelector[] {
        const selector = this;
        if ( !this.product || !this.product.variations ) {
            return [];
        }

        const variations = this.product.variations || {};

        const { facetOptions } = getActiveVariations(
            selectedFilters,
            variations
        );

        return Object.entries( variations ).map( ( [name] ) => {
            const selected = selectedFilters.get( name ) || '';

            const options = ( facetOptions[name] || [] ).map( ( o ) => ( {
                ...o,
                isActive: o.value === selected,
            } ) );

            return {
                name,
                get value() {
                    return selected;
                },
                set value( newValue: string ) {
                    selector.setFilter( name, newValue );
                },
                selected: selected,
                isActive: true,
                options: options,
                setFilter( newValue: string ) {
                    selector.setFilter( name, newValue );
                },
            };
        } );
    }
}

interface Thumbnail {
    itemNumber: string;
    itemImage: Image;
    color: string | null;
    colors: string[];
    isActive: boolean;
    enabled: boolean;
}

interface FacetSelector {
    name: string;
    value: string;
    selected: string;
    isActive: boolean;
    options: {
        isActive: boolean;
        value: string;
        enabled: boolean;
    }[];
    setFilter( value: string ): void;
}

export interface UnitPrice {
    UOM: string;
    price: number;
    orderPricing: { uom: string; price: number }[];
    priceInfo: { uom: string; price: number }[];
}

function getUOMList( prices: SkuPrices, skuId: string ) {
    return Object.entries( prices ).flatMap( ( [sku, items] ) => {
        if ( sku !== skuId ) {
            return [];
        }
        return Object.entries( items ).map( ( [uom, price] ) => ( { uom, price } ) );
    } );
}
