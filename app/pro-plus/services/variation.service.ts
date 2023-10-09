import { Injectable } from '@angular/core';

/* interface DetailsLineItem {
  isChecked: boolean,
  nickName: string;
  quantity: number;
  [key: string]: string | number | boolean;   
} */


@Injectable( {
  providedIn: 'root'
} )
export class VariationService {

  constructor() { }

  public getCurrentVariations( product: any ) {
    const { allVariationTypes, currentVariations } = product?.multiVariationData;

    const variations = Object.keys( allVariationTypes ).map( ( v: any ) => {
      return currentVariations[v]
    } )
    console.group( 'getCurrentVariations()' );
    console.log( { variations } );
    console.groupEnd();
  }
  updateVariations( type: string, newSku: string ) {

  }
  saveVariations() { }


}
