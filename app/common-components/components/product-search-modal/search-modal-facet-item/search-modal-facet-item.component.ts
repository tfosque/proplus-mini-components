import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsService } from '../../../../pro-plus/services/products.service';

@Component( {
  selector: 'app-search-modal-facet-item',
  templateUrl: './search-modal-facet-item.component.html',
  styleUrls: ['./search-modal-facet-item.component.scss']
} )
export class SearchModalFacetItemComponent implements OnInit {

  @Input() facet: any = {}
  @Input() isLoadingSearch = false;
  @Input() label = '';

  showAll = new BehaviorSubject<boolean>( true );
  hideShowButtons = new BehaviorSubject<boolean>( true );

  constructor(
    private readonly productsService: ProductsService
  ) { }
  ngOnInit(): void { }
  handleClickFacet( item: any, isChecked: boolean, label: string ) {
    // delete
    if ( !isChecked ) {
      this.productsService.searchProductsByCateFilterDelete( item )
      return;
    }
    // add facet
    this.productsService.searchProductsByCateFilterAdd( item, label );
  }

  toggleShowAll() {
    this.showAll.next( !this.showAll.value );
  }
}
