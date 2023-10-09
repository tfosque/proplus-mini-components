import { Component, Inject, OnInit, OnDestroy, AfterViewInit, AfterViewChecked } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { ProductsService } from '../.../../../../pro-plus/services/products.service';
import { SearchModalService } from '../../../services/search-modal.service';
import * as _ from 'lodash';
import { FacetsService } from '../../../services/facets.service';
import { map } from 'rxjs/operators';


@Component( {
  selector: 'app-product-search-modal',
  templateUrl: './product-search-modal.component.html',
  styleUrls: ['./product-search-modal.component.scss']
} )
export class ProductSearchModalComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  accountInfo$ = new BehaviorSubject<any>( {} );
  accountName = '';
  isLoggedIn = null;
  showFacetSidebar = false;
  modalTitle = '';

  // Filters
  searchCategories = []
  cateFilter = '';

  //
  emptySearchResults$ = new BehaviorSubject<boolean>( false );

  // Search
  isLoadingSearch$ = new BehaviorSubject<boolean>( false );
  isLoadingSelectedSku$ = new BehaviorSubject<boolean>( false );

  searchStr$ = new BehaviorSubject<string>( '' );

  // message$ = new BehaviorSubject<string>( '' );
  // facetCrumbs$ = new BehaviorSubject<string>( '' );
  searchFacets$ = new BehaviorSubject<string>( '' );

  // Pagination
  totalRecords$ = new BehaviorSubject<number>( 0 );
  pageSize$ = new BehaviorSubject<number>( 20 );

  public pagination$ = new BehaviorSubject<any>( {} );

  //
  columns$ = new BehaviorSubject<string[]>( [] );
  productDetails$ = new BehaviorSubject<any>( {} );
  searchResults$ = new BehaviorSubject<any>( [{}] );

  //
  data: any = {};
  fromModal = '';

  constructor(
    private readonly productsService: ProductsService,
    private readonly facetsService: FacetsService,
    private readonly searchModalService: SearchModalService,
    @Inject( MAT_DIALOG_DATA ) data: any, ) {
    this.data = data;
    // console.log( 'this.data', this.data );
    this.modalTitle = this.data.categoryName || 'Find a Product'
    this.isLoggedIn = this.data.accountId;
    this.accountName = this.data.account.lastSelectedAccount.accountName;
  }

  ngOnInit(): void {
    // TODO Initial Modal Search


    this.searchModalService.pagination$.subscribe( ( page: any ) => {
      // console.log( { page } );
      this.pagination$.next( page );
      this.totalRecords$.next( page.totalRecords );
    } )

    this.searchModalService.isLoadingSearch$.subscribe( ( loading: any ) => {
      this.isLoadingSearch$.next( loading );

      // combine observables
      combineLatest( [this.facetsService.crumbsSelected$, this.searchModalService.searchStr$,
      this.searchModalService.productDetails$] )
        .pipe(
          map( crumbSel => {
            const modalData = { crumbs: crumbSel[0], str: crumbSel[1], productDetails: crumbSel[2], loading };

            if ( loading ) {
              if ( ( modalData.crumbs.length || modalData.str ) ) {
                this.showFacetSidebar = true;
                // return;
              } else {
                this.showFacetSidebar = false;
              }
            }
            return modalData;
          } )
        )
        .subscribe( ( data ) => {
          // console.log( { data } );

          if ( !data?.loading ) {
            this.showFacetSidebar = true;
          }
        } )
      //  this.isLoadingSearch$.next( loading );
    } )

    this.searchModalService.emptySearchResults$.subscribe( ( isEmpty: any ) => {
      this.emptySearchResults$.next( isEmpty )
    } )

    this.searchModalService.searchResults$.subscribe( ( searchR: any ) => {
      this.searchResults$.next( searchR );
    } );

    this.searchModalService.searchStr$.subscribe( ( str: string ) => {
      this.searchStr$.next( str );
    } )

    this.facetsService.searchFacets$.subscribe(
      res => {
        this.searchFacets$.next( res )
      },
      err => { console.log( { err } ) },
      () => { console.log( 'completed.....' ) }
    )

    this.searchModalService.productDetails$.subscribe( ( details: any ) => {
      if ( _.isEmpty( details ) ) {
        this.productDetails$.next( null );
      } else {
        this.productDetails$.next( details );
      }
    } )
    ////
    // console.log( 'DATA:', this.data );
    //
    if ( this.data.fromPage === 'smart-order' ) {
      // console.log( 'smart-order', this.data.fromPage );

      this.facetsService.createCategoryFilters( this.data.searchCategories ); // REVIEW 
      this.facetsService.setDefaultCateFilters( this.data );
      this.productsService.searchProductsByCateFilterAdd( {}, '', this.data.categoryName );

    } else if ( this.data.fromPage === 'favorites-page' ) {
      //
      console.log( 'from favorites page...' );
    }
  }

  async ngOnDestroy(): Promise<any> {
    // reset search
    // this.cancelModal // REVIEW reset modal
    this.searchModalService.resetProductDetails();
    await this.searchModalService.resetSearchResults();
  }

  ngAfterViewInit(): void {
    console.log( 'ngAfterViewInit...' )

  }

  ngAfterViewChecked(): void {
    // console.log( 'ngAfterViewChecked...' )
  }

  getTotalRecords() {
    console.log( 'this.totalRecords:', this.totalRecords$.value )
    return ( this.totalRecords$.value ) > ( this.pageSize$.value + 1 )
  }

  setCategories( categories: [] ) {
    this.facetsService.createCategoryFilters( categories );
  }

  onModelChange( str: string ) {
    // ngModel change for search input
    this.searchModalService.setSearchStr( str );
  }

  /* performSearch() {
    if ( this.data.fromPage === 'smart-order' ) {
      this.productsService.searchProductsByCateFilterAddx( {}, '' );
    }
  } */

  cancelModal() {
    // this.productsService.resetSearch();
    this.searchModalService.resetEmptySearchResults()
  }
}
