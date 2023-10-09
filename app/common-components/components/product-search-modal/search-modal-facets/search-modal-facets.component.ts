import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsService } from '../../../../pro-plus/services/products.service';

@Component( {
  selector: 'app-search-modal-facets',
  templateUrl: './search-modal-facets.component.html',
  styleUrls: ['./search-modal-facets.component.scss']
} )
export class SearchModalFacetsComponent implements OnInit {

  @Input() searchFacets = new BehaviorSubject<any>( [] );

  isLoadingSearch$ = new BehaviorSubject<boolean>( false );

  constructor(
    private readonly productsService: ProductsService
  ) { }

  ngOnInit(): void {
    // console.log( 'this:searchFacets', this.searchFacets.value );

    // Subscriptions
    this.productsService.isLoadingSearch$.subscribe( loading => {
      this.isLoadingSearch$.next( loading );
    } );
  }
}
