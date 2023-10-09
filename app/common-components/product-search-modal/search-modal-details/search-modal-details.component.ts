import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { SearchModalService } from 'src/app/pro-plus/services/search-modal.service';
import { ProductsService } from 'src/app/pro-plus/services/products.service';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';

@Component( {
  selector: 'app-search-modal-details',
  templateUrl: './search-modal-details.component.html',
  styleUrls: ['./search-modal-details.component.scss']
} )
export class SearchModalDetailsComponent implements OnInit {
  @Input() data: any = {};
  @Input() fromModal = '';
  @Input() productDetails: any = {};

  accountInfo$ = new BehaviorSubject<any>( {} );
  accountId = new BehaviorSubject<string | undefined>( '' );
  // templateInfo$ = new BehaviorSubject<any>( {} );
  showAllSkus = false;

  baseImgUrl = 'https://beaconproplus.com';

  productDetails$: any = new BehaviorSubject<any>( {} );
  columns$ = new BehaviorSubject<any[]>( [] );
  dataSource$ = new BehaviorSubject<any[]>( [] );

  //
  hideOptions = false;
  singleDetailMode = new BehaviorSubject<boolean>( false ); // using productDetails$ || null
  isLoadingSelectedSku$ = new BehaviorSubject<boolean>( false );
  nextSku = '';

  hasMultipleSkus = false;
  constructor(
    private readonly userService: UserService,
    //  private readonly userNotifierService: UserNotifierService,
    private readonly productsService: ProductsService,
    private readonly searchModalService: SearchModalService
  ) { }

  ngOnInit(): void {
    this.userService.sessionBehavior.subscribe( userInfo => {
      this.accountInfo$.next( userInfo );
      this.accountId.next( userInfo.session.user?.lastSelectedAccount.accountLegacyId );
    } );

    // TEMPLATES MODE
    /*  this.templateV2.templateInfo$.subscribe( ( templateInfo: any ) => {
       this.templateInfo$.next( templateInfo );
       // console.log( { templateInfo } );
     } ) */

    // PRODUCT DETAILS MODE
    this.searchModalService.isLoadingSelectedSku$.subscribe( loading => {
      this.isLoadingSelectedSku$.next( loading );
    } )

    this.searchModalService.productDetails$.subscribe( ( productDetails: any ) => {
      console.log( { productDetails } )
      this.productDetails$.next( productDetails );
    } );

    /* COLUMNS */
    this.searchModalService.columns$.subscribe( ( columns: any ) => {
      this.columns$.next( columns );
    } )

    this.searchModalService.dataSource$
      .pipe(
        map( ( list ) => {
          return list
        } )
      )
      .subscribe( ( tableData: any ) => {
        if ( tableData ) {
          this.dataSource$.next( tableData );
        }
      } );

    if ( this.dataSource$.value.length <= 1 ) {
      this.hasMultipleSkus = false;
      return
    }
    this.hasMultipleSkus = true;
  }

  createSkuImage( sku: any, size = 'small' ) {
    // overrides for size are (small)
    const path = '/images/large/';
    const skuNumber = sku.itemNumber || sku.product?.itemNumber;
    const root = '_default_';
    const imgSize = `${size}.jpg`;
    return this.baseImgUrl + path + skuNumber + root + imgSize;
  }
  getColumn( pos: any ) {
    const col = this.columns$.value[pos];
    return col
  }
  onHandleOpen() {
    // can use if covert to material expand component
    // console.log( 'open..expand...panel' );
  }
  async changeSelectedProduct( element: any ) {
    if ( !this.hasMultipleSkus ) return;

    const itemNumber = element.itemNumber;
    const productId = element.currentSKU?.productId;
    this.productsService.getProductDetails( itemNumber, productId );
  }
  setClickedItem( element: any ) {
    console.log( element )
    this.nextSku = element[0]
  }

  // change name to
  async closeDetailsView() {
    // TODO if saved favorite call search api again
    this.searchModalService.setProductDetails( null );
  }

  async addSelectedItem( fromPage: string = this.data.fromPage ) {
    // TODO DUPLICATES check for adding Dups:   is that handled by backend?
    // UNAVAILABLE ITEMS popop modal
    // if fromPage Template-detail { }
    // if fromPage Favorites { }
    // if fromPage Eagleview
    // if fromPage ShoppingCart { }
    // console.log( 'selProduct', this.productDetails$.value );

    /*  const subject = this.productDetails$.value;
 
     const templateId = this.data.templateId;
     const templateName = this.data.templateName;
     const account = this.data.accountId;
 
     const { itemNumber, currentUOM } = subject?.currentSKU;
     console.log( { subject }, { itemNumber }, { currentUOM }, { fromPage } )
 
     const items = [{ itemNumber, unitOfMeasure: currentUOM, quantity: 1 }]; */

    /* const request: UpdateTemplateRequest = {
      account,
      action: 'createItem',
      templateId,
      templateName,
      items,
    };
    console.log( { request } ) */

    // const template = { templateId, templateName, accountLegacyId: account, accountName: 'NAME:' };

    // CTA - //Select Product Button Behavior
    if ( fromPage === 'favorites' ) {
      // this.favoritesService.addItem, 
      console.log( 'data:Favorite', this.data );

    }
    if ( fromPage === 'template-detail' ) {
      // this.templateService.addItem,
      console.log( 'data:Template Detail', this.data );
      // const response = await this.templateV2.updateTemplateItems( request );
      // const response = await this.templateService.addTemplateItems( template, items );

      /*  if ( response.success ) {
         // await this.templateV2.getTemplateDetail( templateId, account ); // REVIEW if needed here
         this.userNotifierService.itemsAddedToTemplate( items, template ); // REVIEW 
       }
       // else error
       console.log( { response } ); */
    }
    if ( fromPage === 'eagleview' ) {
      // this.eagleviewService.addItem
      console.log( 'data:Eagleview', this.data )
    }
    if ( fromPage === 'cart' ) {
      // this.cartService.addItem
      console.log( 'data:Cart', this.data )
    }

    //
    this.productsService.resetSearch();

    // TODO ERROR handling
  }
  async addItemToTemplate() { // REVMOVE and add to service
    // if fromPage template-detail { }
    // if fromPage favorites { }
    // if fromPage modal-detail { }
    // if fromPage cart { }

    // TODO DUPLICATES check for adding Dups:
    // TODO ERROR handling
    // UNAVAILABLE ITEMS popop modal // TODO availability for add items to cart only

    /*  const product = this.productDetails$.value;
     const currentSku = product.currentSKU;
     const itemNumber = currentSku?.itemNumber;
     const unitOfMeasure = currentSku?.currentUOM;
 
     const { accountName } = this.templateInfo$.value; // REVIEW 
     const templateId = this.data.templateId;
     const templateName = this.data.templateName;
     const account = this.data.accountId; */
    //  console.log( { accountName } );

    /* if ( !account || !templateId || !templateName ) {
      // TODO alert snackbar ?
      console.log( 'error........' );
      this.userNotifierService.alertError( 'Missing id, templateId, templateName' )
      return;
    } */

    // const items = [{ itemNumber, unitOfMeasure, quantity: 1 }];

    /*  const request: UpdateTemplateRequest = {
       account,
       action: 'createItem',
       templateId,
       templateName,
       items,
     }; */

    // TODO availability for add items to cart only
    /* try {
      const response = await this.templateV2.updateTemplateItems( request );

      if ( response.success ) {
        await this.templateV2.getTemplateDetail( templateId, account ); // REVIEW if needed here

        const template = { templateId, templateName, accountLegacyId: account, accountName }
        this.userNotifierService.itemsAddedToTemplate( items, template );
      }
      console.log( { response } );
    } catch ( error ) {
      // TODO Error handling
      console.log( { error } );
    } */
  }

  hanldeUnavailableProducts( unavailableItems: any ) {
    console.log( { unavailableItems } )
  }



}
