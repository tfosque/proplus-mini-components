import { Component, OnInit, Input } from '@angular/core'
// import { ProductImp } from '../../global-classes/product-imp';
// import { Image } from '../../global-classes/image';
import { ProductSku } from '../../global-classes/product-sku';
import { BehaviorSubject } from 'rxjs';

@Component( {
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss'],
} )
export class ResultCardComponent implements OnInit {
    @Input() isSearch!: boolean;
    /*  @Input() result!: {
         product: ProductImp;
         skuList: ProductSku[];
     }; */
    @Input() result: any = {}
    /*  get linkSegments() {
         if ( this.result.card.itemNumber ) {
             if ( this.isSearch ) {
                 return [
                     '/productDetail',
                     this.result.card.productId,
                     this.result.card.itemNumber,
                 ];
             } else {
                 return [this.result.card.productId, this.result.card.itemNumber];
             }
         } else {
             if ( this.isSearch ) {
                 return ['/productDetail', this.result.card?.productId];
             } else {
                 return [this.result.card?.productId];
             }
         }
     } */

    get colorsCount(): number {
        return this.colorOptionsArray.length;
    }

    get mobileMore() {
        if ( this.result.skuList ) {
            return Math.max( 0, this.colorsCount - 4 );
        } else {
            return 0;
        }
    }

    get desktopMore() {
        if ( this.result.skuList ) {
            return Math.max( 0, this.colorsCount - 6 );
        } else {
            return 0;
        }
    }

    // imgUrl = '';
    activeImage = new BehaviorSubject<any>( {} );
    readonly MAX_IMAGE_SWATCHES = 6;
    colorOptionsArray: ProductSku[] = [];
    // productErrorImage!: string;
    // productAdditionalOnErrorImage!: string;

    constructor() { }
    ngOnInit() {
        // if searching for specific color, replaces default image with color variations
        // API V3 on page refresh issue TODO !important  

        if ( this.result ) {
            this.activeImage.next( {
                ...this.result, card: { ...this.result?.card, productUrl: `/productDetail/${this.result?.card?.productId}` }
            } );
        }
        console.log( 'activeImage:', this.activeImage.value );
    }

    /**
     * Updates appropriate fields based on the new active sku.
     * @param newSku New active sku.
     */
    updateActiveSku( newSku: ProductSku ) {
        console.log( { newSku } )
        this.activeImage.next( { card: newSku } );
        console.log( 'change:sku', this.activeImage.value )
    }

    /**
     * Generate a sku list that omits any duped or null color variants.
     */
    /*  generateSkuList() {
         this.result.skuList.forEach( ( curSku: any ) => {
             // this.addToColorOptionsArray( curSku );
 
         } );
     } */

    /**
     * If the passed in product sku does not exist in the color options array already, push it in to the array
     * @param newColorOption the productSku to potentially be added
     */
    addToColorOptionsArray( newColorOption: ProductSku ) {
        if (
            newColorOption.getSkuColor() &&
            !this.containsColorOption( newColorOption )
        ) {
            this.colorOptionsArray.push( newColorOption );
        }
    }

    /**
     * Checks if a product sku is already in the color options array.
     * @param newColorOption the productSku to be checked
     */
    containsColorOption( newColorOption: ProductSku ): boolean {
        return this.colorOptionsArray.some(
            ( colorOption ) =>
                colorOption.getSkuColor() === newColorOption.getSkuColor()
        );
    }
}
// prod release