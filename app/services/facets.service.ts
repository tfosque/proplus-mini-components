import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';

@Injectable( {
  providedIn: 'root'
} )
export class FacetsService {
  pageSize = 20;

  /* Facets */
  private facetsAll = new BehaviorSubject<any[]>( [] );
  public facetsAll$ = this.facetsAll.asObservable();

  /*  */
  private searchFacets = new BehaviorSubject<any>( [] );
  public searchFacets$ = this.searchFacets.asObservable();

  /*  */
  private crumbsSelected = new BehaviorSubject<any[]>( [] );
  public crumbsSelected$ = this.crumbsSelected.asObservable();

  // Category Filters
  cateFilter = '';
  currSearchCategories = [];
  categoriesSearchObj: any = { cateFilter: '', searchCategories: [], matchMode: 'all' };
  defaultCateFilters = '';

  constructor() { }

  public getSelectedFacets() {
    return this.crumbsSelected.value;
  }

  /*  */
  buildFacets( list: any ): BehaviorSubject<any> | any {
    if ( !list ) return; // nothing to do

    const addCategoryName = Object.entries( list ).map( ( obj: any ) => {
      obj[1].map( ( m: any ) => {
        m.facetCategoryName = obj[0];
        return m;
      } )
      return obj
    } )
    this.facetsAll.next( addCategoryName );

    /*  */
    const facets: any = Object.entries( list );

    // initally limit to 6, and include full facets (mutating data REVIEW)
    const limit6 = facets.map( ( f: any ) => {
      return [f[0], f[1].slice( 0, 6 ), f[1], { expanded: false }];
    } );

    // get categories:
    let categories = limit6.find( ( f: any ) => f[0] === 'Categories' );

    // 
    if ( categories ) {
      // remove categories
      const shift = limit6.filter( ( f: any ) => f[0] !== 'Categories' );
      const childMenus = this.checkForChildrenMenus( categories );

      // add categories to be first 
      shift.unshift( childMenus || categories );

      this.searchFacets.next( shift );
    }

    this.searchFacets.next( limit6 );

    if ( limit6.length > 0 ) {
      this.buildBreadCrumbs();
    }
  }

  private buildBreadCrumbs() {
    const facetsAll = Object.entries( this.facetsAll.value );

    // map over facets[all] // REVIEW 
    let newFacets: any = [];
    facetsAll.forEach( ( grp: any ) => {

      grp[1][1].filter( ( f: any ) => {
        if ( f.selected === true ) {
          f.facetCategoryName = f.facetCategoryName;
          newFacets.push( f );
        }
      } )
    } );
    const crumbs = newFacets;
    this.crumbsSelected.next( crumbs );
  }

  buildChildrenMenu( menu: any ) {
    return;
  }
  checkForChildrenMenus( menu: any ) {
    // Children menus within Categories

    let hasChildrenCategories = false;

    /* Check for child menus if categories not undefined */
    if ( menu ) {
      hasChildrenCategories = menu[2][0].hasOwnProperty( 'children' );
    }

    // TODO how to handle multi layered children (???)
    if ( hasChildrenCategories ) {
      // mutate list
      const children = menu[2][0].children;
      return [menu[0], children.slice( 0, 6 ), children, { expanded: false }];
    }
    return null;
  }

  deleteFacetCrumb( target: any ) {
    const facetRemoved = this.crumbsSelected.value.filter( f => f.facetId !== target.facetId );
    this.crumbsSelected.next( facetRemoved );
  }

  addFacetCrumb( addFacet: any ) {
    this.crumbsSelected.next( [...this.crumbsSelected.value, addFacet] );
  }

  clearFacets() {
    this.searchFacets.next( [] );
    return this.crumbsSelected.next( [] );
  }

  clearCatgegoryFilters() { }

  public createCategoryFilters( searchCategories = [] ) {
    let cateFilter = ''
    let matchMode = 'all';

    if ( searchCategories && searchCategories.length > 0 ) {
      cateFilter = searchCategories.join( '+' );

      if ( searchCategories[0] !== 'miscellaneous' ) {
        matchMode = 'any';
      }
    } else {
      //cateFilter = cateFilter; // REVIEW 
      cateFilter = '';
    }
    this.categoriesSearchObj = { ...this.categoriesSearchObj, cateFilter, matchMode, searchCategories };
    return cateFilter;
  }
  setDefaultCateFilters( data: any ) {
    this.defaultCateFilters = this.createCategoryFilters( data.searchCategories );
  }
  /* clearCategoryFilters() {
    this.defaultCateFilters = '';
  } */

}
