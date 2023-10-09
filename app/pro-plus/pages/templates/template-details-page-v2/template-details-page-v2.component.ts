import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, mergeMap, shareReplay, startWith, tap } from 'rxjs/operators';
import { BehaviorSubject, from, fromEvent } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { TemplatesService } from 'src/app/pro-plus/services/templates.service';
import * as _ from 'lodash';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ShoppingCartService } from 'src/app/pro-plus/services/shopping-cart-service';
import { UserNotifierService } from 'src/app/common-components/services/user-notifier.service';
import { TemplateV2Service } from './template-v2.service';
import { MatSelect } from '@angular/material/select';
import { FavoritesService } from 'src/app/pro-plus/services/favorites.service';
import { ProductSearchModalComponent } from 'src/app/common-components/components/product-search-modal/product-search-modal.component';

interface TemplatePageItems {
  multiVariationData: any;
}

// TODO 
// Handle all errors on promises and subscriptions
// Handle delete all lineitems
// Handle save template name
// handle save all
// jobs?????
// handle save nickname
// clear qty
// handle copy quote
// handle sticky ctas
// hanlde reset selected after adding items to cart
// handle change variations
// Handle styles and types
// if variation length is 1 dont show dropdown just text
// sanitize all innerHtml

@Component( {
  selector: 'app-template-details-page-v2',
  templateUrl: './template-details-page-v2.component.html',
  styleUrls: ['./template-details-page-v2.component.scss']
} )
export class TemplateDetailsPageV2Component implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild( 'acctTemplate', { static: false } ) acctTemplate: MatSelect | undefined;
  @ViewChild( MatTable ) templatesTable: any = MatTable;
  @ViewChild( 'addNickname', { static: true } ) addNickname: ElementRef<HTMLElement> = {} as ElementRef;
  @ViewChild( ElementRef ) selectCheckBox: ElementRef<HTMLInputElement> | undefined;


  accountId = '';
  sessionInfo: any = {};
  /*  */
  dataSrc: any = [];
  templateColumns = ['select', 'product', 'details', 'price', 'del'];
  displayedColumns = ['select', 'product', 'details', 'price', 'del'];
  /*  */
  isLoadingTemplateItems = new BehaviorSubject<boolean>( true );
  templatePagDataInfo: any = null;
  private templatePageLineItems = new BehaviorSubject<TemplatePageItems[]>( [] ); // TODO remove dup not service
  templatePageLineItems$ = this.templatePageLineItems.asObservable();
  templatePageJobs = new BehaviorSubject<any>( [] );
  templateObj = new BehaviorSubject<any>( null );
  templateItemVariations = new BehaviorSubject<any>( [] );
  accountTemplates = new BehaviorSubject<any>( [] );
  /*  */
  selectedItems = new BehaviorSubject<any[]>( [] );
  /*  */
  floatBtns = new BehaviorSubject<boolean>( false );
  showAcctTemplateList = new BehaviorSubject<boolean>( false );
  /*  */
  templateChanges = new BehaviorSubject<boolean>( false );
  /*  */
  selectedFavorites$ = new BehaviorSubject<number>( 0 );
  /*  */
  drag = new BehaviorSubject<boolean>( false );
  /*  */
  skeletonLoadingData = [
    { select: 1, details: '', price: 0, del: false },
    { select: 2, details: '', price: 0, del: false },
    { select: 3, details: '', price: 0, del: false },
    { select: 4, details: '', price: 0, del: false },
  ]

  // FLOAT track buttons position on window scroll
  public readonly windowScroll$ = fromEvent( window, 'scroll' )
    .pipe(
      map( x => window.scrollY ),
      startWith( 0 ),
      distinctUntilChanged(),
      shareReplay( 1 ),
      tap( t => {
        if ( t >= 400 ) {
          this.floatBtns.next( true );
        } else {
          this.floatBtns.next( false );
        }
      } )
    ).subscribe();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly templateService: TemplatesService,
    private readonly templateV2: TemplateV2Service, // MOVE to template service
    private readonly cartService: ShoppingCartService,
    private readonly userService: UserService,
    private readonly userNotify: UserNotifierService,
    private readonly favService: FavoritesService,
    public dialogComp: MatDialog,
  ) {
    // this.templateColumns = this.templateV2.templateColumns;
    // TEMP will remove
    this.templateV2.isLoadingTemplateItems;
  }

  /* LIFECYCLE */
  ngOnInit(): void {
    this.templateV2.templateLineItems$.subscribe( items => {
      // console.log( { items } )
      this.templatePageLineItems.next( items );
    } );

    this.templateV2.hasTemplateChanges$.subscribe( change => {
      this.templateChanges.next( change );
    } );

    this.favService.selectedFavorites$.subscribe( favCnt => {
      this.selectedFavorites$.next( favCnt.length );
      // this.templateChanges.next( true ); // TODO move to service
    } );

    // TODO itemDetails api call !important
    /* REFACTORED v3 */
    this.route.params
      .pipe(
        mergeMap( ( mp: any ) => {
          this.templatePagDataInfo = mp;
          return from( this.userService.getUserJobs( false, mp.accountId, false ) );
        } ),
        map( ( res: any ) => {
          this.templatePageJobs.next( res.jobs );
          return this.templatePageJobs
        } ),
        mergeMap( () => {
          const { templateId, accountId } = this.templatePagDataInfo;
          this.accountId = accountId;
          return from( this.templateV2.getTemplateDetail( templateId, accountId ) );
        } )
      )
      .subscribe(
        ( res: any ) => {
          // TODO basic error handling 
          const { templateName, accountName, isAccountClosed, pagination, templateItems } = res.result;

          this.templateObj.next( { templateName, accountName, isAccountClosed, pagination, templateItems } );

          const nextTemplates: any[] | [] = res?.result.templateItems;
          this.templatePageLineItems.next( nextTemplates );
          // this.templateV2.loadTemplate();

          if ( this.templatePageLineItems.value.length && this.isLoadingTemplateItems.value ) {
            this.isLoadingTemplateItems.next( false );
            // TODO SPINNER HANDLE ERROR
          }
          /*  console.group( 'template data' );
           console.log( 'templatePageDataInfo', this.templatePagDataInfo );
           console.log( { templateItems }, { templateName } );
           console.log( 'isloading', this.isLoadingTemplateItems.value );
           console.log( 'templateItems:', this.templatePageLineItems.value );
           console.log( 'templateObj:', this.templateObj.value );
           console.log( 'jobs:', this.templatePageJobs.value );
           console.groupEnd(); */
          console.log( 'this:pageDataInfo:', this.templatePagDataInfo );
          console.log( 'this:obj:', this.templateObj.value )
          console.log( 'completed...' );

          /*  */
          this.templateV2.updateTemplateInfo( {
            templateId: this.templatePagDataInfo.templateId,
            templateName: this.templateObj.value.templateName
          } )
          this.templateV2.updateAccountInfo( { accountId: this.templatePagDataInfo.accountId, jobs: this.templatePageJobs.value } );
        },
        err => console.log( { err } ), // TODO 
        () => {
          // TODO Review
          this.windowScroll$
        }
      )
  }
  ngAfterViewInit(): void {
    console.log( 'this', this );
  }
  ngOnDestroy(): void {
    console.log( 'auto save ....' );
  }

  /* CUSTOM METHODS REFACTOR v3.0 */
  async switchTemplate( item: any ) {
    // TODO !important change the url for routing

    // isLoading = true;
    this.isLoadingTemplateItems.next( true );

    // TODO blank all state, the call new template, show skeleton loader, 
    //const el = ( e.target as Element ).scrollTop;
    console.log( { item } );
    console.log( 'templateObj:', this.templateObj.value )

    const { templateId, accountLegacyId } = item;

    const newTemplate: any = await this.templateV2.getTemplateDetail( templateId, accountLegacyId );
    console.log( { newTemplate } );

    const { templateName, accountName, isAccountClosed, pagination, templateItems } = newTemplate.result;
    this.templateObj.next( { templateName, accountName, isAccountClosed, pagination, templateItems } );

    if ( !newTemplate.success ) return;
    // isLoading = false;
    this.isLoadingTemplateItems.next( false );
    this.userNotify.alertError( `You are now viewing template - ${templateName}` );

    console.log( { templateItems } );
    this.templatePageLineItems.next( templateItems );

    /* CLEANUP */
    this.acctTemplate && this.acctTemplate.open();
    this.showAcctTemplateList.next( false );
    this.selectedFavorites$.next( 0 );
    this.clearSelectedItems();
    // clear favorites
    // TODO update ui with new tempalte
  }
  async fetchAllTemplates() {
    // TODO reduce template calls, if templates.length then don't call again.
    if ( this.accountTemplates.value.length ) return;

    const templates = await this.templateV2.getTemplatesByAccount( this.accountId );
    console.log( { templates } );
    this.accountTemplates.next( templates.result.templates );
  }

  close() { }

  openDialog() {
    let dialogConfig;

    this.userService.sessionBehavior.subscribe( userInfo => {
      // console.log( { userInfo } );
      const sessionInfo = userInfo.session.user;

      // TODO pass accoundId to modal
      dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        id: this.accountId,
        accoundId: this.accountId,
        sessionInfo,
        templateId: this.templatePagDataInfo.templateId,
        templateName: this.templateObj.value.templateName
      };
    } );

    const dialogRef = this.dialogComp.open( ProductSearchModalComponent, dialogConfig );
    dialogRef.afterClosed().subscribe( result => {
      console.log( `Dialog result: ${result}` );
    } );
  }

  // NOTAVAIL not available nothing to update
  /* checkIsAvailable( newSku: any ) {
    if ( !newSku.length ) {
     
      console.log( 'selectedValue', newSku, 'not available.......' )
      return false;
    }
    console.log( 'Avail...', newSku )
    return newSku;
  } */

  onDropListItem( event: CdkDragDrop<any> ) {
    console.log( { event } );
    moveItemInArray( this.templatePageLineItems.value, event.previousIndex, event.currentIndex );
    this.templatesTable.renderRows();
    this.defaultCursor();
  }

  async addItemsToCart() {
    // TODO ERROR handling and TYPES
    const accountId = this.accountId;

    const itemsToAdd: any = this.selectedItems.value.map( ( selItem: any ) => {
      return {
        catalogRefId: selItem.itemNumber, catalogRefIdChanged: false, productId: selItem.productOrItemNumber,
        quantity: selItem.quantity, uom: selItem.unitOfMeasure
      }
    } );

    // TODO message
    if ( !itemsToAdd ) return;

    const titles = itemsToAdd.map( ( title: any ) => {
      return title.catalogRefId;
    } );
    const formatTitles = titles.join( ', ' );

    try {
      // TODO add error handling for response here... userNotifier should wait until 200 response
      this.cartService.addMultiItemsToCart( accountId, itemsToAdd );
      this.userNotify.alertError( `Items were added to cart ${formatTitles}` );

      // TODO check for unavailable items alert();

      // clear checked items
      this.clearSelectedItems();
      // clearFavorites() ???
      this.deselectAll();

    } catch ( error ) {
      console.log( { error } );
    }
  }
  async deleteTemplateItem( item: any ) {
    const deleteTemplateResponse = await this.templateService.updateTemplate(
      {
        action: 'deleteItem',
        account: this.accountId,
        templateId: this.templatePagDataInfo.templateId,
        templateName: this.templateObj.value.templateName,
        items: [{ templateItemId: item.templateItemId, }],
      }
    );
    console.log( { deleteTemplateResponse } );

    if ( deleteTemplateResponse && deleteTemplateResponse.success ) {
      // await this.templateService.refreshTemplateItems();
      this.refreshTemplatesClient( item.itemNumber );
      this.userNotify.alertError( `Removed item ${item.itemOrProductDescription}` );
    } else {
      // ERROR handling
      this.userNotify.alertError( `There was a problem removing item ${item.itemOrProductDescription}` );
    }
  }
  clearSelectedItems() {
    // TODO uncheck input
    this.selectedItems.next( [] );
    // this.deselectAll();
  }
  clearFavorites() { }
  removeFromSelectedItems( item: any ) {
    const filteredList = this.selectedItems.value.filter( f => {
      return f.itemNumber !== item.itemNumber
    } );
    console.log( { filteredList } );
    this.selectedItems.next( filteredList );
  }

  // TODO review
  refreshTemplatesClient( id: string ) {

    const updatedItems = this.templatePageLineItems.value.filter( ( f: any ) => {
      return f.itemNumber !== id;
    } );
    console.log( { updatedItems } )
    this.templatePageLineItems.next( updatedItems )
  }

  addToSelectedItems( evt: any, item: any, checked: any ): void {
    const currentSelItems = this.selectedItems.value;

    if ( !evt.checked ) {
      // remove unchecked item
      const filterUnchecked: any = currentSelItems.filter( f => {
        if ( f.itemNumber !== item.itemNumber ) {
          item.isChecked = false;
        }
        return f.itemNumber !== item.itemNumber
      } );
      this.selectedItems.next( filterUnchecked );
      return;
    }

    /* TRUE */
    item.isChecked = true;
    this.selectedItems.next( [...currentSelItems, ...item] );
  }
  getTemplateTotals() {
    const arr = this.templatePageLineItems.value;
    const sum = arr.reduce( ( accumulator, object: any ) => {
      return accumulator + ( object.unitPrice * object.quantity );
    }, 0 );
    return sum;
  }
  selectAll( event?: any ): void {
    if ( !event.checked ) {
      this.deselectAll();
      return;
    }
    const list = this.templatePageLineItems.value.map( ( selItem: any ) => {
      selItem.isChecked = true;
      return selItem;
    } );
    this.selectedItems.next( list );
  }
  deselectAll(): void {
    this.selectedItems.next( [] );
    let newList: any[] = this.templatePageLineItems.value;

    newList.map( ( selItem: any ) => {
      selItem.isChecked = false;
      return selItem;
    } );
  }
  updateLineItemChanges( target: string, element: any, val: any ) {
    this.templateV2.updateLineItemChanges( target, element, val );
  }
  save() {
    console.log( 'save tempalte.....' );
    from( this.templateV2.saveUpdatedItems() )
      .subscribe(
        res => {
          console.log( { res } );
          if ( res.success ) {
            this.userNotify.alertError( 'Your changes were successfully saved.' );
          }
        },
        err => {
          console.log( { err } );
          this.userNotify.alertError( 'Thre was a problem saving your changes.' )
        },
        () => {
          console.log( 'completed....' );
        }
      )
  }

  // TODO templates page (variation selections and updates)
  // save all, nickname, save template name, change template, default jobs,  delete all lineItems?, 
  // tweak skeleton loader, don't allow zeros in the input field, tweak drag and drop, skeletion for templateName
  deleteAll() { }
  clearQty(): void {
    const list = this.templatePageLineItems.value.map( ( item: any ) => {
      return { ...item, quantity: 0 };
    } );
    // update ui
    // TODO need to save on page destroy or button click
    this.templatePageLineItems.next( list );

    // reset save all button
    this.templateChanges.next( true );
  }
  copyQuote() { }
  dragCursor() {
    this.drag.next( true );
  }
  defaultCursor() {
    this.drag.next( false );
  }
}