import { Component, OnInit } from '@angular/core';
import { TestData } from './testData';

@Component( {
  selector: 'app-search-modal-container',
  templateUrl: './search-modal-container.component.html',
  styleUrls: ['./search-modal-container.component.scss']
} )
export class SearchModalContainerComponent implements OnInit {
  searchFacets = TestData.facets;
  productDetails: any = {};
  searchResults = TestData.items;

  //
  showSearchResults = false;
  showProductDetails = false;
  showPagination = false;
  disablePagination = false;


  constructor() {
    const { searchFacets, searchResults } = this;
    console.log( { searchFacets }, { searchResults } );
  }

  ngOnInit(): void {
  }
  createImage( item: any ) {
    return `https://dev-static.becn.digital/insecure/plain${item.productImage}`;
  }

  nextPage( event: any ) {
    console.log( { event } )
  }

}
