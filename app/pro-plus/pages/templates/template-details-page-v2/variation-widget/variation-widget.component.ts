import { AfterViewInit, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Component( {
  selector: 'app-variation-widget',
  templateUrl: './variation-widget.component.html',
  styleUrls: ['./variation-widget.component.scss']
} )
export class VariationWidgetComponent implements OnInit, AfterViewInit {
  @Input() element: any = null;
  @Output() item = new EventEmitter<{ item: any, type: string, selectedValue: any }>();

  dropdown: any = [];
  /*  */
  model: any = {};

  // TODO make dynamic
  variationModel: any = new BehaviorSubject<any>(
    {
      nickname: '', quantity: 0, 'mfg': '', color: '', size: '',
      depth: '', length: '', diameter: '', packaging: '', width: ''
    } )
  variationTypes = [];

  constructor(
    // private readonly variationService: VariationService
  ) { }

  // TODO Stress Test
  ngOnInit(): void {
    // console.log( 'element', this.element );
  }
  ngAfterViewInit(): void {
    this.createModel();
  }

  /* REFACTOR V2 */
  handleSkuChange( item: any, type: string, selectedValue: any ) {
    this.item.emit( { item, type, selectedValue } );
  }
  displayDropdownFacets( variationData: any, facet: string ) {
    // variationData.variations[facet]
    const list = Object.keys( variationData.variations[facet] );
    // console.log( { facet }, { list } )
    // console.log( facet, variationData.variations[facet], { list }, this.sortList( list ) );
    return this.sortList( list );
  }
  isAvailSku( facet: string, item2Compare: string ) {
    /* NOTES 
    - dropdown list = product.variations['MFG'] facet
    - avail skus = product.skus['556021'][color] itemNumber, facet     
    */ /* TEST */ /* log, group, error, info, assert, warn, time, table,  */

    const product: any = this.element;
    const id = product.itemNumber;
    const productVariationData = product.multiVariationData;
    const productSkus: any = productVariationData.skus;
    const avail_Skus = productSkus && productSkus[id] && productSkus[id][facet];

    /*  if ( avail_Skus.includes( item2Compare ) ) {
       return { background: '#fff' }
     } else {
       return { background: '#edeeef54', color: 'rgba(0, 0, 0, 0.38)' };
     }    */
    return avail_Skus?.includes( item2Compare );

  }
  sortList( objectArray: any ) {
    const jsSort = objectArray.sort( function ( a: any, b: any ) {
      var textA = a[0].toUpperCase();
      var textB = b[0].toUpperCase();
      return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
    } );
    // console.log( { jsSort } );
    return jsSort;
  }
  getDefaultSku( data: any, facet: any ) {
    const res = data.multiVariationData.currentVariations[facet];
    // return default value of [0] if empty
    return res !== 'please_select' ? res : 'select';
  }
  getSkus( data: any, facet: any ) {
    // loop over allVariations // has to match items[value] for default selections
    const list = Object.entries( data.multiVariationData.skus ).map(
      ( item: any ) => {
        /*   console.group();
          console.log( 'itemNumber:', item )
          console.log( item[1] )
          console.log( item[1][facet][0] );
          console.groupEnd(); */
        return item[1][facet][0];
      }
    );
    //console.log( { list }, 'uniq:', _.uniq( list ) );
    // TODO how do i sort without affecting default or current selection
    return _.uniq( list );
  }

  /* LEGACY Code */
  getDefaultSelection( variationType: any ) {
    // console.log( variationType, this.variationModel.value[variationType] );
    return this.variationModel.value[variationType]
  }

  // TODO Initialize line items and dynamically creaat model from elements variations data
  private createModel(): void {
    const { nickname, quantity, itemNumber, multiVariationData } = this.element;
    let model: any = { itemNumber, nickname, quantity, multiVariationData, isChecked: false };

    const newModel = this.variationTypes?.map( ( m: any ) => {
      model[m] = multiVariationData.currentVariations[m];
      return model;
    } );
    // this.model = _.uniq( newModel );
    this.variationModel.next( _.uniq( newModel )[0] );
  }

  getItemVariations( data: any, index: any, element: any ) {
    // console.log( { data }, { index } );
    const list = data[index];
    // console.log( { list } );
    const KEYS = Object.keys( list );
    /*  console.group();
     console.log( { element } );
     console.log( index, { KEYS } );
     console.groupEnd(); */
    return KEYS;
  }
  onHandleVariationChange( sku: any, childrenSkus: any, targetVariationType: string, allVariations: any, value: any ) {
    // get targetSku variation sku ''
    const variationSet = { selectedItem: { targetVariationType, sku, value }, childrenSkus, allVariations };

    // get children variation skus [];

    // on selection update (all of this products variations) with the matching sku from childrenSkus
    // selectedItem.value
    const newValue = Object.entries( childrenSkus ).map( ( selection: any ) => {
      const itemFromChildren = selection[1][targetVariationType][0];
      const itemCompare = variationSet.selectedItem.value;

      console.log( 'filter:item', { itemFromChildren } );
      console.log( 'filter:compare', { itemCompare } );

      return itemFromChildren === itemCompare ? selection : null
    } );
    const cleanNewValue = _.uniq( newValue );


    /* UPDATE MODEL */
    // loop over allVariations and update all except (target variation)
    const facets2Update = allVariations.filter( ( f: any ) => f !== targetVariationType );

    console.group( 'variation change' );
    console.log( { variationSet } ); console.log( 'newVal:', _.uniq( newValue )[1] );
    console.log( { facets2Update }, { cleanNewValue } );
    console.groupEnd(); return;

    /*   const model = facets2Update.map( ( m: any ) => {
        this.variationModel.value[m] = cleanNewValue[1][1][m][0];
        this.variationModel.value.newSku = cleanNewValue[1][0];
        return this.variationModel.value;
      } ); console.log( { model }, { cleanNewValue } ); */

    // return new image, new sku and variations values to model for saving

  }
  /* V2 */
  onHandleVariationChangeV2( sku: any, childrenSkus: any, targetVariationType: string, allVariations: any, value: any ) {
    const variationSet = { selectedItem: { targetVariationType, sku, value }, childrenSkus, allVariations };

    // get children variation skus [];
    // on selection update (all of this products variations) with the matching sku from childrenSkus
    // selectedItem.value 
    console.group( 'handle variation color' );
    console.log( { variationSet } );
    console.groupEnd();
  }

  getItemVariationsV2( element: any ) {
    console.log( { element } );

    const itemNumber = element.itemNumber;
    const skus = element.multiVariationData?.skus;
    const allVariations = element.multiVariationData?.allVariationTypes;

    if ( allVariations ) {
      allVariations.filter( ( type: any ) => {
        const res = skus && skus[itemNumber] && type && skus[itemNumber][type];
        console.log( { res } )
      } )
    }
    //this.dropdown = skus[itemNumber][variation];
    /* console.group( 'get V2' );
    console.log( { itemNumber }, { skus }, { allVariations } )
    console.log( 'this.dropdown', this.dropdown );
    console.groupEnd(); */

    // const results = this.getItemVariationsV2( sku, childrenSkus, targetVariationType );
    /* UPDATE MODEL */
    // this.variationModel.value[]
    return;
  }

}
