import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsService } from 'src/app/pro-plus/services/products.service';
import { SearchModalService } from 'src/app/pro-plus/services/search-modal.service';

@Component( {
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
} )
export class SearchFormComponent implements OnInit {
  searchStr$ = new BehaviorSubject<string>( '' );
  fromPage = 'smart-order';

  constructor(
    private readonly productsService: ProductsService,
    private readonly searchModalService: SearchModalService
  ) { }

  ngOnInit(): void { }

  onModelChange( text: string ) {
    this.searchStr$.next( text );
    this.searchModalService.setSearchStr( text );
  }
  handleKeyPress( event: KeyboardEvent ) {
    const { key } = event;
    // console.log( { code, key } );

    if ( key === 'Enter' ) {
      this.performSearch()
    }
  }
  clearSearch() {
    this.searchModalService.setSearchStr( '' );
    this.productsService.resetSearch();
  }

  performSearch() {
    if ( this.fromPage === 'smart-order' ) {
      this.productsService.searchProductsByCateFilterAdd( {}, '' );
    }
  }

}
