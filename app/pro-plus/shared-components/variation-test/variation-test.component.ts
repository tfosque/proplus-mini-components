import { Component, OnInit } from '@angular/core';
import { TemplateItemsSampleData as sampleData } from './_template-items-sample-data';

@Component( {
  selector: 'app-variation-test',
  templateUrl: './variation-test.component.html',
  styleUrls: ['./variation-test.component.scss']
} )
export class VariationTestComponent implements OnInit {
  variationsObj: any = {};
  element: any = {}; // Input()

  constructor() {
    console.log( { sampleData } );
    this.element = sampleData[0];
    console.log( 'elem:', this.element );
  }

  ngOnInit(): void {
    //const { allVariationTypes, currentSkuId, currentVariations, defaultSku } = this.element;
  }
  createImageUrl() {
    return `https://beaconproplus.com${this.element.imageUrl.large}`;
  }

  getVariations() { }

}
