import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FacetsService } from 'src/app/services/facets.service';

@Injectable( {
  providedIn: 'root'
} )
export class SearchModalService {
  private isLoadingSearch = new BehaviorSubject<any>( [] );
  public isLoadingSearch$ = this.isLoadingSearch.asObservable();

  //
  private isLoadingSelectedSku = new BehaviorSubject<boolean>( false );
  public isLoadingSelectedSku$ = this.isLoadingSelectedSku.asObservable();

  //
  private emptySearchResults = new BehaviorSubject<boolean>( false )
  public emptySearchResults$ = this.emptySearchResults.asObservable();
  //
  private searchStr = new BehaviorSubject<string>( '' );
  public searchStr$ = this.searchStr.asObservable();

  //
  private searchResults = new BehaviorSubject<any>( [] );
  public searchResults$ = this.searchResults.asObservable();
  //
  private searchFacets = new BehaviorSubject<any>( [] );
  public searchFacets$ = this.searchFacets.asObservable();
  //
  // private searchModalPagination = new BehaviorSubject<any>( {} );
  // public searchModalPagination$ = this.searchModalPagination.asObservable();
  //
  private pagination = new BehaviorSubject<any>( {} ); // SEARCH MODAL PAGINATION ABOVE
  public pagination$ = this.pagination.asObservable();

  //
  private productDetails: any = new BehaviorSubject<any>( {} );
  public productDetails$ = this.productDetails.asObservable();

  //   Details Sku Table
  private dataSource = new BehaviorSubject<any>( [] ); // REFACTOR this data is in productDetails Object
  public dataSource$ = this.dataSource.asObservable();
  private columnData = new BehaviorSubject<any>( [] );
  public columnData$ = this.columnData.asObservable();
  private columns = new BehaviorSubject<string[]>( [] );
  public columns$ = this.columns.asObservable();

  constructor(
    private readonly facetService: FacetsService
  ) { }

  setSearchResults( setSearchResults: any ) {
    if ( !setSearchResults ) {
      // Empty Results Message ?    
      console.log( 'message:', setSearchResults?.message )
      this.emptySearchResults.next( true );
      return;
    }
    this.searchResults.next( setSearchResults );
  }
  getSearchResults() {
    return this.searchResults.value;
  }
  async resetSearchResults(): Promise<any> {
    this.emptySearchResults.next( false ); // REVIEW 
    const clearResults: any = this.searchResults.next( [] );
    const clearSearchFacets: any = this.searchFacets.next( [] );
    const clearFacetCrumbs: any = this.facetService.crumbsSelected$;
    //
    this.facetService.clearFacets();

    const clear: any = () => {
      return Promise.all( [
        clearResults.toPromise(),
        clearSearchFacets.toPromise(),
        clearFacetCrumbs.toPromise()
      ] )
    }
    return await clear;
  }

  /*  setSearchModalPagination( page: PageEvent ) {
     this.searchModalPagination.next( page );
   } */
  setSearchStr( str: string ) {
    this.searchStr.next( str );
  }
  setSearchFacets( results: any ) {
    this.searchFacets.next( results.facets );
  }
  setSearchTotalRecords( records: any ) {
    this.pagination.next( { ...this.pagination.value, totalRecords: records } );
  }
  setPageIndex( index: number ) {
    this.pagination.next( { ...this.pagination.value, pageIndex: index } )
  }
  resetEmptySearchResults() {
    this.emptySearchResults.next( false );
    this.setSearchStr( '' );
    this.setProductDetails( null );
    this.facetService.clearFacets();
    this.setSearchStr( '' );
    this.setSearchResults( [] );
  }
  setPagination( evt: any ) {
    this.pagination.next( { ...this.pagination.value, ...evt } );
  }
  setIsLoadingSearch( val: boolean ) {
    this.isLoadingSearch.next( val );
  }
  setIsLoadingSelectedSku( val: boolean ) {
    this.isLoadingSelectedSku.next( val );
  }
  setPageNo( No: number ) {
    this.pagination.next( { ...this.pagination.value, pageNo: No } );
  }
  /* setHideDetails( val: boolean ) {
    this.hideDetailsView.next( val );
  }
  setHideSearch( val: boolean ) {
    this.hideDetailsView.next( val );
  } */
  sortList( objectArray: any ) {
    const jsSort = objectArray.sort( function ( a: any, b: any ) {
      var textA = a[0].toUpperCase();
      var textB = b[0].toUpperCase();
      return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
    } );
    return jsSort;
  }

  resetProductDetails() {
    this.productDetails.next( null );
  }

  setProductDetails( product: any ) {
    if ( !product ) {
      this.productDetails.next( null ); // REVIEW 
    };
    // build details skuList table view
    this.convertSkuListVariationsTable( product );
  }

  // DETAILS TABLE VIEW
  private convertSkuListVariationsTable( product: any ) {
    if ( !product ) return;

    const { skuList } = product;
    const currItemNumber = product.currentSKU?.itemNumber;

    const data = skuList.map( ( item: any ) => {
      const columnNames = Object.keys( item.variations );
      this.columns.next( columnNames )

      const vDict = item.variations;
      let lineItem: any = {};

      columnNames.forEach( name => {
        lineItem = { ...lineItem, [name]: vDict[name][0] };
      } );
      lineItem.sku = item.itemNumber;
      lineItem.productOnErrorImage = product.product?.productOnErrorImage;
      item.productOnErrorImage = product.product?.productOnErrorImage;

      // current selection
      if ( currItemNumber === item.itemNumber ) {
        lineItem.isSelected = true;
        product.isSelected = true;
        return lineItem;
      }
      lineItem.isSelected = false;
      product.isSelected = false;
      return lineItem;
    } )

    this.columns.value.unshift( 'sku' );
    // product.currentSKU._productOnErrorImage = product.product.productOnErrorImage;
    product.skuListTableData = {}
    product.skuListTableData.dataSource = data;
    product.skuListTableData.columns = this.columns.value;
    this.productDetails.next( product );
    //
    this.dataSource.next( data ); // REMOVE 
  }
}
