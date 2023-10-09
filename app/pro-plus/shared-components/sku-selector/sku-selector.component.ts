import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Image } from '../../../global-classes/image';
import { ProductImp, UnitPrice } from '../../../global-classes/product-imp';
import { ProductSku } from '../../../global-classes/product-sku';
import { ProductsService } from '../../services/products.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, flatMap, tap, finalize } from 'rxjs/operators';
import { Variations } from '../../model/variations';

export type SkuSelection = {
    quantity: number;
    productId: string;
    sku: ProductSku;
    uom: string;
} | null;

export interface SkuSelectorViewModel {
    product: ProductImp;
    selectedSku: string | null;
    currentUom: string | null;
    selectedImage: Image;
    color: string | null;
    currentSku: ProductSku | null;
    // skuOptions: ProductSku[];
    selectedFacets: {
        facetKey: string;
        options: string[];
    }[];

    allFacets: {
        facetKeys: string[];
        allVarations: {
            sku: string;
            selected: boolean;
            facets: {
                facetKey: string;
                options: string[];
            }[];
        }[];
    };
}

export interface SelectedProduct {
    brand?: string;
    productId?: string;
    skuList?: Array<Sku>;
}
export interface Sku {
    auxiliaryImages?: AuxiliaryImage[];
    currentUOM: string;
    color?: string;
    itemImage?: string;
    itemNumber: string;
    heroImage?: string;
    hoverAttributes?: Record<string, string>;
    manufactureNumber: string;
    swatchImage?: string;
    thumbImage: string;
    skuShortDesc?: string;
    unitPrice: number;
    uomlist?: string[];
    productNumber: string;
    variations?: Record<string, string[]>;
}
export interface AuxiliaryImage {
    image: string;
    videoUrl?: string;
}

@Component( {
    selector: 'app-sku-selector',
    templateUrl: './sku-selector.component.html',
    styleUrls: ['./sku-selector.component.scss'],
} )
export class SkuSelectorComponent implements OnInit {
    @Input() accountId!: number;
    @Output() skuSelected: EventEmitter<SkuSelection> = new EventEmitter();
    product$!: Observable<SkuSelectorViewModel | null>;
    @Input() set selectedProduct( prod: SelectedProduct ) {
        this.selectedProduct$.next( prod );
    }
    loading = true;
    private readonly selectedProduct$ = new BehaviorSubject<SelectedProduct | null>(
        null
    );
    private readonly selectedSkuId$ = new BehaviorSubject<string | null>( null );

    public showOptions = true;
    public selectedPriceInfo = new BehaviorSubject<UnitPrice | null>( null );
    constructor( private readonly productService: ProductsService ) { }

    public get showCaption() {
        return this.showOptions ? 'Hide Options' : 'Expand Options';
    }

    public toggleOptions() {
        this.showOptions = !this.showOptions;
    }

    async ngOnInit() {
        const product$ = this.selectedProduct$.pipe(
            flatMap( ( p ) => {
                if ( !p ) {
                    return of( null );
                }
                this.loading = true;
                const itemNumber = p.skuList?.[0].itemNumber;
                return this.productService
                    .getProduct( p.productId, itemNumber )
                    .pipe( finalize( () => ( this.loading = false ) ) );
            } )
        );

        this.product$ = combineLatest( [product$, this.selectedSkuId$] ).pipe(
            map( ( [product, selectedSku] ) => {
                if ( !product ) {
                    return null;
                }

                const currentSku = this.getSelectedSku( product, selectedSku );
                const currentUom =
                    ( currentSku && currentSku.currentUOM ) || null;

                const selectedImage = currentSku
                    ? currentSku.itemImage
                    : product.productImage;
                const color = this.getColor( currentSku );
                selectedSku =
                    selectedSku || ( currentSku ? currentSku.itemNumber : null );

                const skuToFind = selectedSku;
                const variations = product.variations;
                const selectedFacets = getSelectedFacets( variations, skuToFind );

                const allVarations = product.skuList
                    .map( ( s ) => {
                        return {
                            sku: s.itemNumber,
                            selected: s.itemNumber === selectedSku,
                            facets: getSelectedFacets( variations, s.itemNumber ),
                        };
                    } )
                    .sort( ( a, b ) => a.sku.localeCompare( b.sku ) );

                const facetKeys = Object.keys( variations );

                const allFacets = { facetKeys, allVarations };

                const viewModel: SkuSelectorViewModel = {
                    product,
                    selectedSku,
                    currentUom,
                    selectedImage,
                    color,
                    currentSku,
                    selectedFacets,
                    allFacets,
                };
                return viewModel;
            } ),
            tap( ( v ) => {
                if ( !v ) {
                    return;
                }
                const { product, currentUom, currentSku } = v;
                if ( !currentSku ) {
                    return;
                }
                const sku = currentSku.itemNumber;
                const quantity = 1;
                const uom = currentUom;
                const productId = product.productId;
                if ( !uom || !sku || !productId || !currentSku ) {
                    return;
                }
                this.skuSelected.next( {
                    quantity,
                    productId,
                    uom,
                    sku: currentSku,
                } );
            } )
        );

        this.product$.subscribe( ( prod ) => {
            if ( !prod || !prod.product ) {
                return null;
            }
            return prod.product
                .getPriceInfo(
                    prod.product.itemNumber,
                    prod.product.currentUOM || ''
                )
                .then( ( p ) => {
                    this.selectedPriceInfo.next( p );
                } );
        } );
    }

    public getSelectedSku(
        productDetails: ProductImp,
        selectedSkuId: string | null
    ): ProductSku | null {
        const defaultSku = productDetails.currentSKU || null;
        if ( !selectedSkuId ) {
            return productDetails.currentSKU || defaultSku;
        }
        productDetails.setItemNo( selectedSkuId );
        return productDetails.currentSKU || defaultSku;
    }

    public getColor( sku: ProductSku | null | undefined ): string | null {
        if ( !sku || !sku.variations ) {
            return null;
        }
        const colorEntries = sku.variations.color;
        if ( !colorEntries || !colorEntries.length ) {
            return null;
        }
        return colorEntries[0];
    }

    selectSku( sku: string | null ) {
        this.selectedSkuId$.next( sku );
        return false;
    }
}
function getSelectedFacets( variations: Variations, skuToFind: string | null ) {
    return Object.entries( variations ).map( ( [facetKey, options] ) => ( {
        facetKey,
        options: Object.entries( options ).flatMap( ( [value, skus] ) => {
            if ( skus.find( ( s ) => s === skuToFind ) ) {
                return [value];
            }
            return [];
        } ),
    } ) );
}
