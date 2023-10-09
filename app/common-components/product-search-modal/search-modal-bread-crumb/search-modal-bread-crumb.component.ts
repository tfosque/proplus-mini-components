import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsService } from 'src/app/pro-plus/services/products.service';
import { FacetsService } from 'src/app/services/facets.service';

@Component( {
  selector: 'app-search-modal-bread-crumb',
  templateUrl: './search-modal-bread-crumb.component.html',
  styleUrls: ['./search-modal-bread-crumb.component.scss']
} )
export class SearchModalBreadCrumbComponent implements OnInit {
  @Input() searchFacets$ = [];
  facets$ = new BehaviorSubject<any>( [] );
  @Input() facets = new BehaviorSubject<any>( [] );
  @Input() accountName = '';
  crumbs$ = new BehaviorSubject<any>( [] );

  constructor(
    private readonly facetService: FacetsService,
    private readonly productService: ProductsService
  ) { }

  ngOnInit(): void {
    this.facetService.crumbsSelected$
      .subscribe(
        crmbSel => {
          this.crumbs$.next( crmbSel );
        },
        err => { console.log( { err } ) },
        () => { console.log( 'done subscribing to facet crumbs...' ) } );
  }

  removeFacet( facet: any ) {
    this.productService.searchProductsByCateFilterDelete( facet );
  }
  removeAllFacets() {
    this.productService.clearAllFacets();
  }
}
