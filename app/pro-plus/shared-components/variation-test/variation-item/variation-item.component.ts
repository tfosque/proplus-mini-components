import { Component, Input, OnInit } from '@angular/core';

@Component( {
  selector: 'app-variation-item',
  templateUrl: './variation-item.component.html',
  styleUrls: ['./variation-item.component.scss']
} )
export class VariationItemComponent implements OnInit {
  @Input() multiVariationData = {};

  allVariationTypes = [];
  variations: any = [];
  step = 0;
  element: any = {};
  selected = 'option1'
  constructor() { }

  ngOnInit(): void {
    this.element = this.multiVariationData;
    this.allVariationTypes = this.element.multiVariationData.allVariationTypes;
    this.variations = this.element.multiVariationData.variations;

    //
    // const keys = Object.entries( this.element.multiVariationData.variations );   =
    console.log( 'this.variations:', this.variations );
    console.log( 'variation-item:', this );
  }

  createImageUrl() {
    return `https://beaconproplus.com${this.element.imageUrl.large}`;
  }

}
