import { Component, Input, OnInit } from '@angular/core';
import { ProductsService } from '../../../../../pro-plus/services/products.service';

@Component( {
  selector: 'app-search-results-card',
  templateUrl: './search-results-card.component.html',
  styleUrls: ['./search-results-card.component.scss']
} )
export class SearchResultsCardComponent implements OnInit {

  // @Input() products$ = new BehaviorSubject<any[]>( [] );
  @Input() fromModal = '';
  @Input() data: any = {};
  @Input() element: any = {}

  state: any = {};

  constructor(
    private readonly productsService: ProductsService
  ) { }

  ngOnInit(): void {
    this.state = { element: this.element, data: this.data }
  }
  createImage() {
    // smart-order // favorites page // templates page
    /* 680159 */// const { currentSKU: { itemNumber } } = this.element;

    const baseUrl = 'https://beaconproplus.com'
    // 'https://static.becn.com/insecure/plain';
    // https://beaconproplus.com/images/large/brand/certainteed_roofing_brand_small.jpg
    /*  if ( this.element.currentSKU.itemNumber === '680159' ) {
      console.log( { itemNumber } );
      console.log( 'element::', this.element );
      console.log( 'productUrl', this.element.productImage )
    } */
    // return baseUrl + `/images/large/${itemNumber}_default_small.jpg`;
    return baseUrl + this.element.productImage;
  }
  selectProduct() {
    const { currentSKU: { itemNumber }, productId } = this.element;
    this.productsService.getProductDetails( itemNumber, productId );
  }
}
