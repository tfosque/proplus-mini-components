import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/pro-plus/services/products.service';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { TemplateV2Service } from '../template-v2.service';


@Component( {
  selector: 'app-template-details-line-item',
  templateUrl: './template-details-line-item.component.html',
  styleUrls: ['./template-details-line-item.component.scss']
} )
export class TemplateDetailsLineItemComponent implements OnInit, OnDestroy {
  @Input() columnDef: string = '';
  @Input() element: any = [];
  @Input() lineItems: any[] = [];
  accountId: string | undefined = '';
  row: any = {}

  // startQty = 0;
  editedItem: any = {};
  model: any = { nickName: '', variation: {}, qty: 0 }

  constructor(
    private readonly productService: ProductsService,
    private readonly userService: UserService,
    private readonly templateV2: TemplateV2Service
  ) { }

  /* LIFECYCLE */
  ngOnInit(): void {
    this.userService.sessionBehavior.subscribe( user => {
      this.accountId = user.session.user?.lastSelectedAccount.accountLegacyId;
    } );

    // this.lineItems$.next( this.lineItems.value );
    const row = {
      isChecked: this.element.isChecked, templateItemId: this.element.templateItemId, sku: this.element.itemNumber,
      desc: this.element.itemOrProductDescription, nickName: this.element.nickName,
      currVariations: this.element.multiVariationData?.currentVariations, quantity: this.element.quantity
    }
    // TODO Review    
    this.model.qty = row.quantity;
    // this.model.nickName = row.nickName
    // this.model.variation = row.currVariations
    this.row = row;
    // console.log( { row } );
  }
  ngOnDestroy(): void {
    // TODO auto save service
    console.log( 'destroyed.......' );
  }

  /* CUSTOM */
  updateQty( element: any, action: string ) {
    console.log( { element }, { action } );

    if ( action === 'increase' ) {
      if ( this.model.qty >= 9999 ) return;
      this.model.qty = this.model.qty + 1;
    }
    if ( action === 'decrease' ) {
      if ( this.model.qty <= 1 ) return;
      this.model.qty = this.model.qty - 1;
    }
    // update lineItem
    this.templateV2.updateLineItemChanges( 'qty', element, this.model.qty );
  }
  updateVariation( element: any, type: any, val: any ) {
    console.log( 'this.model.variation', this.model, { val } );

    this.model.variation = { [type]: val }
    // update lineItem
    this.templateV2.updateLineItemChanges( 'variation', element, { [type]: val } );
    console.log( { [type]: val } );
  }

  updateNickname( element: any, val: any ) {
    console.log( 'this.model.nickname:', this.model, { val } );
    this.model.nickName = val;

    // update lineItem
    this.templateV2.updateLineItemChanges( 'nickname', element, val );
    console.log( this.model );
  }

  displayThumb( sku: string ) {
    const baseImgUrl = 'https://beaconproplus.com/images/large/';
    const suffixImgUrl = '_default_thumb.jpg';
    const thumb = baseImgUrl + sku + suffixImgUrl;
    return thumb;
  }
  createPdpUrl( element: any ) {
    // `/prodcutDetail/ ${element.productId} / ${element.itemNumber}`
    const id = element.productOrItemNumber;
    const itemN = element.itemNumber;
    const pdpUrl = `/productDetail/${id}/${itemN}`;
    return pdpUrl;
  }
  getDefaultSku( data: any, facet: any ) {
    const res = data.multiVariationData.currentVariations[facet];
    // return default value of [0] if empty
    return res !== 'please_select' ? res : 'select';
  }
  isAvailSku( element: any, facet: string, item2Compare: string ) {
    /* NOTES 
    - dropdown list = product.variations['MFG'] facet
    - avail skus = product.skus['556021'][color] itemNumber, facet     
    TEST */ /* log, group, error, info, assert, warn, time, table,  */

    const product: any = element;
    const id = product.itemNumber;
    const productVariationData = product.multiVariationData;
    const productSkus: any = productVariationData.skus;
    const avail_Skus = productSkus && productSkus[id] && productSkus[id][facet];
    return avail_Skus?.includes( item2Compare );
  }

  displayDropdownFacets( variationData: any, facet: string ) {
    const data = variationData.variations[facet];
    const list = Object.keys( data ); // old
    const sortResult = this.sortList( list );
    return sortResult;
  }

  displayDropdownThumb( variationData: any, facet: string, lineItem: any ) {
    if ( facet !== 'color' ) return;

    const data = variationData.variations[facet];
    const prefix = 'https://beaconproplus.com/images/large/';
    const sku = data[lineItem][0];
    const suffix = '_default_thumb.jpg';
    const url = prefix + sku + suffix;
    return url;
  }
  sortList( objectArray: any ) {
    const jsSort = objectArray.sort( function ( a: any, b: any ) {
      var textA = a[0].toUpperCase();
      var textB = b[0].toUpperCase();
      return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
    } );
    return jsSort;
  }
  async handleSkuChange( element: any, variationType: any, value: any ) {
    const item = element;
    const type = variationType;
    const selectedValue = value;
    const { skus } = item.multiVariationData;
    const { itemNumber } = item;

    /* console.group( 'handleSku' );
    console.log( element );
    console.log( { type } );
    console.log( { selectedValue } );
    console.log( { skus } );
    console.log( { itemNumber } );
    console.groupEnd(); */

    // use selectedValue to find the sku in the list of skus --// get newSku
    const newSku = Object.entries( skus ).filter( ( sku: any ) => {
      const res = skus[sku[0]][type][0] === selectedValue;
      if ( !res ) return; // STOP here item not available
      const match = skus[sku[0]][type][0];
      return match;
    } );
    // console.log( { newSku } );
    // console.log( 'lineItems:', this.lineItems );

    if ( newSku.length ) {
      const sku = newSku[0][0];
      const details = await this.productService.getItemDetails( { accountId: this.accountId, productId: '', itemNumber: sku } );
      const newItemProductName = details?.product.productName;
      // console.log( { details } );

      /* UPDATE LINE ITEM  */
      this.lineItems.map( ( selItem: any ) => {
        // has match
        if ( selItem.itemNumber === itemNumber ) {
          item.itemNumber = newSku[0][0]; // Thumbnail via itemNumber
          item.itemOrProductDescription = newItemProductName;
          // find new desc from itemDetails? item.itemOrProductDescription = ''
          return item;
        } else {
          // TODO evaluate
          // console.log( 'eq:false', itemNumber === item.itemNumber );
          return item;
        }
      } );
    }
  }

  editNickName( element: any, value: any ) {
    const item = element.itemNumber;

    console.log( element, item, value );
  }

}
