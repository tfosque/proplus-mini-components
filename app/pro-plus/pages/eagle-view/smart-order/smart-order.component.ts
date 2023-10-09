import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ProductsService, ProductVariationRequest } from '../../../services/products.service';
import { AddEVOrderItemRequest, EVItem, EVOrderResult, ItemCategory, VariationOption, DeleteEVOrderItemRequest, EditEVOrderItemRequest, ProductCategory, EditEVOrderRequest, DeleteEVOrderRequest, SaveAllToEVOrderRequest, SaveAllRequestEVItem } from '../../../model/eagle-view-smart-order';
import { EagleViewService } from '../../../services/eagle-view.service';
import { TemplateItemView } from '../../templates/template-detail-page/template-item-view';
import { FacetSelector } from '../../templates/template-detail-page/facet-selector';
import { applyVariationsFilter, IAttrOption, Variations } from '../../../model/variations';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Product } from '../../../../api-response-interfaces/product';
import { ProductAllComponent } from '../../../shared-components/product-all/product-all.component';
import { SkuSelection } from '../../../shared-components/sku-selector/sku-selector.component';
import { DialogDataAll } from '../../templates/template-detail-page/template-detail-page.component';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { CurrencyPipe } from '@angular/common';
import { JobResponse } from '../../../model/job-response';
import { ShoppingCartService } from '../../../services/shopping-cart-service';
import { stripTags } from '../../../../common-components/classes/html-utilities';
import { CreateTemplateDialogComponent } from '../../templates/template-dialog/create-template-dialog/create-template-dialog.component';
import { TemplatesService } from '../../../services/templates.service';
import { AppError } from '../../../../common-components/classes/app-error';
import { ConfirmationDialogComponent } from '../../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { TemplateDialogComponent } from './template-dialog/template-dialog.component';
import { ConfirmationProduct, ConfirmAvailableProductsComponent, ProductConfirmationConfig } from '../../../shared-components/confirm-available-products/confirm-available-products.component';
import { ProductSearchModalComponent } from '../../../../common-components/components/product-search-modal/product-search-modal.component';
import { SearchModalContainerComponent } from '../../../../common-components/components/product-search-modal/search-modal-container/search-modal-container.component';

@Component( {
  selector: 'app-smart-order',
  templateUrl: './smart-order.component.html',
  styleUrls: ['./smart-order.component.scss']
} )
export class SmartOrderComponent implements OnInit, OnDestroy {
  evOrderId!: string;
  evOrderResult!: EVOrderResult;
  public myGroup = new FormGroup( {
    baseWasteFactor: new FormControl(),
  } );
  dataSource: ( EVItemWithVariationTemplate | CategoryGroup | CategoryGroupEmpty )[] = [];
  isLargeScreen = false;
  layoutChangesLargeSub!: Subscription;
  public jobs?: JobResponse;
  categories: Category[] = [];
  config: MatSnackBarConfig = {
    verticalPosition: 'top',
    duration: 10000,
  };
  isSubmitting = false;
  account: any = {};

  get isAccountClosed() {
    return this.userService.isLastSelectedAccountClosed;
  }

  get accountId() {
    if ( this.userService.accountIdInString ) {
      return this.userService.accountIdInString;
    } else {
      return null;
    }
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eagleViewService: EagleViewService,
    private readonly productService: ProductsService,
    private readonly userService: UserService,
    public dialog: MatDialog,
    public dialogAll: MatDialog,
    public productSearchDialog: MatDialog,
    public templateDialog: MatDialog,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly userNotifier: UserNotifierService,
    private readonly currencyPipe: CurrencyPipe,
    private readonly _snackBar: MatSnackBar,
    private readonly cartService: ShoppingCartService,
    private readonly router: Router,
    public newTemplateDialog: MatDialog,
    public availabilityDialog: MatDialog,
    private readonly templateService: TemplatesService
  ) { }

  public get displayedColumns(): string[] {
    return [
      'product',
      'details',
      'waste_factor',
      'unit_price',
      'qty',
      'actions',
    ];
  }

  async ngOnInit() {
    this.userService.sessionBehavior.subscribe( u => {
      this.account = u.session.user;
    } )

    const p: ParamMap = this.route.snapshot.paramMap;
    const evOrderId: string = p.get( 'evOrderId' ) || '';
    if ( !evOrderId ) {
      throw new Error( 'Error generating EagleView order' );
    }
    console.log( 'evOrderId: ', evOrderId );
    this.evOrderId = evOrderId;

    // get categories
    const categoryResponse = await this.eagleViewService.getEVOrderCategories();
    if ( categoryResponse.success ) {
      this.categories = this.convertCategories( categoryResponse.result );
    }

    await this.loadEVOrderItems();
    const alertUser = false;
    this.jobs = await this.userService.getUserJobs( alertUser );

    this.layoutChangesLargeSub = this.breakpointObserver
      .observe( [Breakpoints.Large] )
      .subscribe( ( result ) => {
        this.isLargeScreen = result.matches ? true : false;
      } );
  }



  async loadEVOrderResult() {
    if ( !this.evOrderId ) { return; }
    const getEVOrderResponse = await this.eagleViewService.getEVOrder( this.evOrderId );
    if ( !getEVOrderResponse.success ) {
      throw new Error( 'Error generating EagleView order' );
    }
    // console.log('getEVOrder response: ', getEVOrderResponse);
    this.evOrderResult = getEVOrderResponse.result;
    this.evOrderResult.baseWasteFactor = this.formatWasteFactor( parseFloat( getEVOrderResponse.result.baseWasteFactor ) ).toString();
  }

  async loadEVOrderItems() {
    await this.loadEVOrderResult();

    const evItems = this.evOrderResult.evItems || [];
    const evItemsWithVariations = await this.convertEVItems( evItems );
    // console.log('evItems ith variations: ', evItemsWithVariations);

    let dataSourceNew: ( EVItemWithVariationTemplate | CategoryGroup | CategoryGroupEmpty )[] = [];
    this.categories.forEach( ( c ) => {
      const groupHeader: CategoryGroup = {
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        isGroupBy: true,
        itemCount: 0,
        listOfProductIds: []
      }
      dataSourceNew.push( groupHeader );

      if ( evItemsWithVariations ) {
        const matchedProducts = evItemsWithVariations.filter( p => p.mainCategory === c.categoryName );
        if ( matchedProducts.length > 0 ) {
          matchedProducts.forEach( p => {
            const templateItem = TemplateItemView.fromEVItem( this.productService, p, true );
            const templateItemWithVariation = {
              ...p,
              facetSelectors: templateItem.facetSelectors,
              moreFacetOptions: templateItem.moreFacetOptions,
              activeVariations: templateItem.activeVariations,
              selectedFilters: templateItem.selectedFilters,
              variationsTemplate: templateItem.variations,
              editing: false,
              wasteFactorMessage: '',
              quantityMessage: ''
            };
            templateItemWithVariation.wasteFactor = p.wasteFactor ?
              this.formatWasteFactor( parseInt( p.wasteFactor ) ).toString() : p.wasteFactor;
            dataSourceNew.push( templateItemWithVariation );
          } );
          const itemCount = matchedProducts.length;
          groupHeader.itemCount = itemCount;
          groupHeader.listOfProductIds = matchedProducts.map( i => i.productId );
        } else {
          const groupHeaderEmtpy: CategoryGroupEmpty = {
            categoryId: c.categoryId,
            categoryName: c.categoryName,
            isGroupByEmpty: true
          }
          dataSourceNew.push( groupHeaderEmtpy );
        }
      } else {
        const groupHeaderEmtpy: CategoryGroupEmpty = {
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          isGroupByEmpty: true
        }
        dataSourceNew.push( groupHeaderEmtpy );
      }
    } );

    // console.log('dataSourceNew: ', dataSourceNew);
    this.dataSource = dataSourceNew;
  }

  formatWasteFactor( wasteFactor: number ) {
    return ( Math.floor( wasteFactor ) );
  }

  groupBy<T, K>( list: T[], getKey: ( item: T ) => K ) {
    const map = new Map<K, T[]>();
    list.forEach( ( item ) => {
      const key = getKey( item );
      const collection = map.get( key );
      if ( !collection ) {
        map.set( key, [item] );
      } else {
        collection.push( item );
      }
    } );
    return Array.from( map.values() );
  }

  isGroup( index: any, item: any ): boolean {
    return item.isGroupBy;
  }

  isGroupEmpty( index: any, item: any ): boolean {
    return item.isGroupByEmpty;
  }

  async convertEVItems( evItems: EVItem[] ) {
    if ( !evItems ) return;
    const items: ProductVariationRequest[] = evItems.map( item => {
      return {
        productId: item.productId,
        skuId: item.itemNumber,
        vendorColorId: ''
      }
    } );
    const productVariationResponse = await this.productService.getMultipleProductVariation( items );
    if ( productVariationResponse.success ) {
      const productVariations = productVariationResponse.result;
      const evItemsWithVariation: EVItemWithVariation[] = evItems.map( item => {
        const matchedVariations = productVariations.filter( p => item.productId === p.productId );
        let variations = null;
        let skusVariation = null;
        let currentVariations = null;
        let vendorColors = null;
        let currentVendorColorId = null;
        if ( matchedVariations && matchedVariations.length > 0 ) {
          const variationData = matchedVariations[0].productMultiVariation;
          variations = variationData ? variationData.variations : null;
          skusVariation = variationData ? variationData.skus : null;
          currentVariations = variationData ? variationData.currentVariations : null;
          vendorColors = variationData ? variationData.vendorColors : null;
          currentVendorColorId = variationData ? variationData.currentVendorColorId : null;
        }
        return {
          ...item,
          variations: variations,
          skusVariation: skusVariation,
          currentVariations: currentVariations,
          vendorColors: vendorColors,
          currentVendorColorId: currentVendorColorId
        };
      } );
      return evItemsWithVariation;
    } else {
      return evItems.map( item => {
        return {
          ...item,
          variations: null,
          skusVariation: null,
          currentVariations: null,
          vendorColors: null,
          currentVendorColorId: null
        }
      } )
    }
  }

  ngOnDestroy() {
    if ( this.layoutChangesLargeSub ) {
      this.layoutChangesLargeSub.unsubscribe();
    }
    /* submit any changes */
    this.onFormSubmit();
  }

  public displayFn( prod?: Product ): string | undefined {
    return prod ? prod.productName : undefined;
  }

  async searchAll( categoryId: number, searchTerm: string ) {
    if ( this.itemsInEditing() ) {
      // this._snackBar.open(
      //   'Please confirm the product items\' waste factor change',
      //   'Close',
      //   this.config
      // );
      // return;
      await this.saveWasteFactorInEditing();
    }
    let searchCategories: string[] = [];
    const categories = this.categories.filter( c => c.categoryId === categoryId );
    if ( categories && categories.length > 0 ) {
      if ( categories[0].categoryName === 'Miscellaneous' ) {
        searchCategories.push( 'miscellaneous' );
      } else {
        searchCategories = categories[0].subcategories;
      }
    }
    // console.log('categories to be searched: ', searchCategories);

    const data: DialogDataAll = {
      accountId: this.accountId || '0',
      searchTerm: searchTerm,
      productId: '',
      searchCategories: searchCategories
    };

    const maxWidth = this.isLargeScreen ? '1000px' : '95vw';

    const dialogAllRef = this.dialogAll.open( ProductAllComponent, {
      data: data,
      width: '95vw',
      maxWidth: maxWidth,
    } );

    dialogAllRef.afterClosed().subscribe( ( result: SkuSelection ) => {
      if ( !result ) {
        return;
      }
      this.addProduct( result );
    } );
  }

  public async addProduct( sel: SkuSelection ) {
    if ( sel && sel.sku.itemNumber && this.accountId ) {
      const addItemRequest: AddEVOrderItemRequest = {
        evOrderId: this.evOrderId,
        itemNumber: sel.sku.itemNumber
      };
      const response = await this.eagleViewService.addEVOrderItem( addItemRequest );
      if ( response.success ) {
        await this.loadEVOrderItems();
        this.isSubmitting = false;
        this.userNotifier.alertError(
          `Added item ${sel.sku.itemNumber}`
        );
      } else {
        const messages = response.messages;
        const message = messages
          ? `${messages[0].value}`
          : '';
        this.userNotifier.alertError(
          `Error adding item ${sel.sku.itemNumber} - ${message}`
        );
      }
    }
  }

  public async deleteProduct( item: EVItemWithVariationTemplate ) {
    if ( !item || !item.id ) { return; }
    if ( this.itemsInEditing() ) {
      // this._snackBar.open(
      //   'Please confirm the product items\' waste factor change',
      //   'Close',
      //   this.config
      // );
      // return;
      await this.saveWasteFactorInEditing();
    }
    const deleteItemRequest: DeleteEVOrderItemRequest = {
      evOrderId: this.evOrderId,
      itemId: item.id
    };
    const response = await this.eagleViewService.deleteEVOrderItem( deleteItemRequest );
    if ( response.success ) {
      await this.loadEVOrderItems();
      this.isSubmitting = false;
      this.userNotifier.alertError( `${item.itemName} Removed` );
    } else {
      this.userNotifier.alertError(
        `Error removing item ${item.itemName}`
      );
    }
  }

  async setFilter( item: EVItemWithVariationTemplate, attr: string, value: string ): Promise<void> {
    const activeVariations = item.activeVariations;
    const selectedFilters = item.selectedFilters;
    const variations = item.variationsTemplate;
    const facetSelectors = item.facetSelectors;

    const { newFilters, facetOptions, selectedSKU } = applyVariationsFilter(
      variations,
      selectedFilters,
      activeVariations,
      attr,
      value
    );

    item.selectedFilters = newFilters;
    item.activeVariations = facetOptions;
    facetSelectors.forEach( ( f ) => {
      const newValue = newFilters.get( f.name ) || '';
      f.setValue( newValue );
    } );

    if ( !selectedSKU ) {
      return;
    }

    const product = await this.productService
      .getProduct( item.productId, selectedSKU )
      .toPromise();
    if ( !product ) {
      return;
    }

    const editItemRequest: EditEVOrderItemRequest = {
      evOrderId: this.evOrderId,
      id: item.id,
      itemNumber: selectedSKU,
      wasteFactor: item.wasteFactor ? parseInt( item.wasteFactor ) : null,
      quantity: null,
      manualQuantity: null
    };

    const response = await this.eagleViewService.editEVOrderItem( editItemRequest );
    if ( response.success ) {
      if ( response.result ) {
        const newItem = response.result;
        item.itemNumber = newItem.itemNumber;
        item.itemName = newItem.itemName;
        item.itemImage = newItem.itemImage;
        item.price = newItem.price;
        item.quantity = newItem.quantity;
        item.uom = newItem.uom;
        item.variationOptions = newItem.variationOptions;
        item.variations = product.variations;
        await this.loadEVOrderResult();
      }
      // await this.loadEVOrderItems();
      // this.userNotifier.alertError(
      //   `Added item ${sel.sku.itemNumber}`
      // );
    } else {
      const messages = response.messages;
      const message = messages
        ? `${messages[0].type} - ${messages[0].code} ${messages[0].value}`
        : '';
      this.userNotifier.alertError(
        `Error changing item ${item.itemNumber} - ${message}`
      );
    }
  }

  displaySubTotal( subTotal: string ) {
    if ( typeof subTotal === 'number' ) {
      return this.currencyPipe.transform( subTotal, 'USD' );
    } else {
      let subTotalForDisplay = subTotal;
      if ( subTotalForDisplay && subTotalForDisplay.charAt( 0 ) !== '$'
        && !subTotalForDisplay.toLowerCase().includes( 'calculated' ) ) {
        subTotalForDisplay = `$${subTotalForDisplay}`;
      }
      return subTotalForDisplay;
    }
  }

  async updateJob( jobNumber?: string ) {
    let jobName = '';
    if ( jobNumber ) {
      if ( this.jobs ) {
        jobName = this.jobs.jobs.filter( job => job.jobNumber === jobNumber )[0].jobName;
      }
    }
    const editEVOrderRequest: EditEVOrderRequest = {
      evOrderId: this.evOrderId,
      templateId: this.evOrderResult.template.templateId,
      baseWasteFactor: parseInt( this.evOrderResult.baseWasteFactor ),
      selectedJobNumber: jobNumber || ''
    };
    const response = await this.eagleViewService.editEVOrder( editEVOrderRequest );
    if ( response.success ) {
      await this.loadEVOrderItems();
      const message =
        !jobName || !jobNumber
          ? `Job Account successfully reset`
          : `Job Account successfully set to ${jobName}`;
      this.userNotifier.alertError( message );
    } else {
      this._snackBar.open(
        'Error setting the job account',
        'Close',
        this.config
      );
    }
  }

  convertCategories( categoriesUnOrdered: ProductCategory[] ): Category[] {
    let categories = [];
    const asphaltShingles = categoriesUnOrdered.find( c => c.category === 'Asphalt Shingles' );
    if ( asphaltShingles ) {
      categories.push( {
        categoryId: 1,
        categoryName: asphaltShingles.category,
        subcategories: asphaltShingles.subCategories.map( sc => sc.categoryId )
      } );
    }
    const underlayments = categoriesUnOrdered.find( c => c.category === 'Underlayments' );
    if ( underlayments ) {
      categories.push( {
        categoryId: 2,
        categoryName: underlayments.category,
        subcategories: underlayments.subCategories.map( sc => sc.categoryId )
      } );
    }
    const starterShingles = categoriesUnOrdered.find( c => c.category === 'Starter Shingles' );
    if ( starterShingles ) {
      categories.push( {
        categoryId: 3,
        categoryName: starterShingles.category,
        subcategories: starterShingles.subCategories.map( sc => sc.categoryId )
      } );
    }
    const hipRidgeShingles = categoriesUnOrdered.find( c => c.category === 'Hip & Ridge Shingles' );
    if ( hipRidgeShingles ) {
      categories.push( {
        categoryId: 4,
        categoryName: hipRidgeShingles.category,
        subcategories: hipRidgeShingles.subCategories.map( sc => sc.categoryId )
      } );
    }
    const Ventilation = categoriesUnOrdered.find( c => c.category === 'Ventilation' );
    if ( Ventilation ) {
      categories.push( {
        categoryId: 5,
        categoryName: Ventilation.category,
        subcategories: Ventilation.subCategories.map( sc => sc.categoryId )
      } );
    }
    const Flashings = categoriesUnOrdered.find( c => c.category === 'Flashings' );
    if ( Flashings ) {
      categories.push( {
        categoryId: 6,
        categoryName: Flashings.category,
        subcategories: Flashings.subCategories.map( sc => sc.categoryId )
      } );
    }
    const nails = categoriesUnOrdered.find( c => c.category === 'Nails, Screws, & Fasteners' );
    if ( nails ) {
      categories.push( {
        categoryId: 7,
        categoryName: nails.category,
        subcategories: nails.subCategories.map( sc => sc.categoryId )
      } );
    }
    const adhesives = categoriesUnOrdered.find( c => c.category === 'Adhesives, Caulks, & Sealants' );
    if ( adhesives ) {
      categories.push( {
        categoryId: 8,
        categoryName: adhesives.category,
        subcategories: adhesives.subCategories.map( sc => sc.categoryId )
      } );
    }
    const plywood = categoriesUnOrdered.find( c => c.category === 'Plywood, OSB, & Lumber' );
    if ( plywood ) {
      categories.push( {
        categoryId: 9,
        categoryName: plywood.category,
        subcategories: plywood.subCategories.map( sc => sc.categoryId )
      } );
    }
    categories.push( {
      categoryId: 10,
      categoryName: 'Miscellaneous',
      subcategories: []
    } );
    return categories;
  }

  async baseWasteFactorChange( event: Event ) {
    const inputRef = event.target as HTMLInputElement;
    let baseWasteFactor = inputRef.value;
    // console.log('base waste factor: ', baseWasteFactor);
    if ( this.isNumber( baseWasteFactor ) ) {
      if ( !this.isInDesiredForm( baseWasteFactor ) ) {
        const roundedWasteFactor = Math.round( parseFloat( baseWasteFactor ) ).toString();
        baseWasteFactor = roundedWasteFactor;
      }
      const editEVOrderRequest: EditEVOrderRequest = {
        evOrderId: this.evOrderId,
        templateId: this.evOrderResult.template.templateId,
        baseWasteFactor: parseInt( baseWasteFactor ),
        selectedJobNumber: this.evOrderResult.selectedJobNumber
      };
      const response = await this.eagleViewService.editEVOrder( editEVOrderRequest );
      if ( response.success ) {
        await this.loadEVOrderItems();
        const message = `Base waste factor successfully set to ${baseWasteFactor}%`;
        this.userNotifier.alertError( message );
      } else {
        this._snackBar.open(
          'Error setting the base waste factor',
          'Close',
          this.config
        );
      }
    } else {
      this._snackBar.open(
        'Waste Factor must be a whole number',
        'Close',
        this.config
      );
    }
  }

  isNumber( numStr: string ) {
    return !isNaN( parseFloat( numStr ) ) && !isNaN( +numStr )
  }

  isInDesiredForm( str: string ) {
    var n = Math.floor( Number( str ) );
    return n !== Infinity && String( n ) === str && n >= 0;
  }

  editWasteFactor( item: EVItemWithVariationTemplate ) {
    item.editing = true;
  }

  async saveItemWasteFactor( wasteFactor: string | null, item: EVItemWithVariationTemplate ) {
    if ( wasteFactor ) {
      if ( this.isNumber( wasteFactor ) ) {
        if ( !this.isInDesiredForm( wasteFactor ) ) {
          item.wasteFactor = Math.round( parseFloat( wasteFactor ) ).toString();
          wasteFactor = item.wasteFactor;
        }
        item.wasteFactorMessage = '';
        const editItemRequest: EditEVOrderItemRequest = {
          evOrderId: this.evOrderId,
          id: item.id,
          itemNumber: item.itemNumber,
          wasteFactor: wasteFactor ? parseInt( wasteFactor ) : null,
          quantity: item.quantity && this.isQuantityValid( item.quantity ) ? item.quantity : null,
          manualQuantity: false
        };

        const response = await this.eagleViewService.editEVOrderItem( editItemRequest );
        if ( response.success ) {
          if ( response.result ) {
            // console.log('edit ev item result: ', response.result);
            item.quantity = response.result.quantity;
            item.manualQuantity = response.result.manualQuantity;
            item.editing = false;
            if ( item.quantity ) {
              item.quantityMessage = '';
            }
            await this.loadEVOrderResult();
            // const message = `Successfully set`;
            // item.wasteFactorMessage = message;
          } else {
            this._snackBar.open(
              `Error setting the waste factor for item, ${item.itemName}`,
              'Close',
              this.config
            );
          }
        } else {
          this._snackBar.open(
            `Error setting the waste factor for item, ${item.itemName}`,
            'Close',
            this.config
          );
        }
      } else {
        // this._snackBar.open(
        //   `The entered waste factor for item, ${item.itemName}, is not a positive integer number`,
        //   'Close',
        //   this.config
        // );
        item.wasteFactorMessage = 'Not a whole number';
      }
    } else {
      this._snackBar.open(
        `The entered waste factor for item, ${item.itemName}, is not a whole number`,
        'Close',
        this.config
      );
    }
  }

  async confirmWasteFactor( item: EVItemWithVariationTemplate ) {
    const wasteFactor = item.wasteFactor;
    // console.log('waste factor: ', wasteFactor);
    await this.saveItemWasteFactor( wasteFactor, item );
  }

  async quantityChange( item: EVItemWithVariationTemplate, event: Event ) {
    this.isSubmitting = false;
    item.quantityMessage = '';
    const quantityRef = event.target as HTMLInputElement;
    const newQuantity = quantityRef.value;

    if ( newQuantity && this.isNumber( newQuantity ) && this.isInDesiredForm( newQuantity ) && parseInt( newQuantity ) > 0 ) {
      const editItemRequest: EditEVOrderItemRequest = {
        evOrderId: this.evOrderId,
        id: item.id,
        itemNumber: item.itemNumber,
        wasteFactor: item.wasteFactor ? parseInt( item.wasteFactor ) : null,
        quantity: parseInt( newQuantity ),
        manualQuantity: true
      };
      const response = await this.eagleViewService.editEVOrderItem( editItemRequest );
      if ( response.success ) {
        if ( response.result ) {
          // console.log('edit ev item result: ', response.result);
          item.editing = false;
          item.manualQuantity = response.result.manualQuantity;
          await this.loadEVOrderResult();
          if ( item.support3DMeasurement ) {
            // const message = `Successfully set`;
            // item.quantityMessage = message;
          }
        } else {
          this._snackBar.open(
            `Error updating the quantity for item, ${item.itemName}`,
            'Close',
            this.config
          );
        }
      } else {
        this._snackBar.open(
          `Error updating the quantity for item, ${item.itemName}`,
          'Close',
          this.config
        );
      }
    } else {
      // this._snackBar.open(
      //   `The entered quantity for item, ${item.itemName}, is not a valid integer number greater than 0`,
      //   'Close',
      //   this.config
      // );
      item.quantityMessage = 'Please enter a number for the quantity. Example: 10';
    }
  }

  isShingles( categoryName: string ) {
    return ( categoryName.toLowerCase().indexOf( 'shingles' ) > -1 );
  }

  /* AUTOSAVE */
  onFormChange( formData: any ) {
    // this.autoSave.compareFormData( formData );
  }

  onFormSubmit() {
    // condition to submit?
    /*   this.autoSave.saveChanges().subscribe(
        response => console.log( 'Data saved successfully' ),
        error => console.error( 'Error saving data:', error )
      ); */
  }

  async proceedToCheckout() {
    const response = await this.cartService.proceedToCheckout();
    const { messages, success } = response;
    if ( success ) {
      return success;
    }
    if ( messages && messages.length ) {
      const { code, type, value } = messages[0];
      //  Skip if we have a NullOrderPriceInfo response
      if ( value === 'NullOrderPriceInfo' ) {
        return true;
      }
      const decodedValue = stripTags( value );
      this.userNotifier.alertError( `${code} - ${type} - ${decodedValue}` );
    } else {
      this.userNotifier.alertError(
        'Unknown error while proceed to checkout'
      );
    }
    return false;
  }

  async askUserToConfirm<T>( config: {
    title: string;
    yesButton?: string;
    noButton?: string;
    question: string;
  } ): Promise<boolean> {
    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      {
        data: {
          confimation: config.yesButton || 'Yes',
          no: config.noButton || 'No',
          question: config.question,
          title: config.title,
        },
      }
    );
    return dialogRef
      .afterClosed()
      .toPromise()
      .then( ( result ) => {
        if ( result ) {
          return true;
        } else {
          return false;
        }
      } );
  }

  retrieveItems(): EVItemWithVariationTemplate[] {
    const items = this.dataSource.filter( ( ds ): ds is EVItemWithVariationTemplate => {
      return ( ds as EVItemWithVariationTemplate ).itemNumber !== undefined
    } );
    return items;
  }

  async goToCheckout() {
    this.isSubmitting = true;
    let isValid = true;
    const items = this.retrieveItems();
    if ( items ) {
      for ( const item of items ) {
        if ( !this.isQuantityValid( item.quantity ) ) {
          isValid = false;
          break;
        }
      }
      if ( !isValid ) {
        const toProceed = await this.askUserToConfirm( {
          title: 'Missing Item Quantities',
          question:
            'Some of the items in your order have a quantity of zero. Do you wish to proceed?',
          yesButton: 'Yes',
          noButton: 'No',
        } );
        if ( !toProceed ) {
          return;
        }
      }
      if ( this.itemsInEditing() ) {
        this._snackBar.open(
          'Please confirm the product items\' waste factor change',
          'Close',
          this.config
        );
        return;
      }
    } else {
      return;
    }
    await this.saveAll();
    const checkoutRequest: DeleteEVOrderRequest = {
      evOrderId: this.evOrderId
    };
    const conversionResponse = await this.eagleViewService.convertEVOrderToATGOrder( checkoutRequest );
    if ( conversionResponse.success ) {
      console.log( 'atgOrderId: ', conversionResponse.result.atgOrderId );
      // const conversionMessages = conversionResponse.messages;
      // if (conversionMessages && conversionMessages.length) {
      //   const conversionMessage = conversionMessages
      //     ? `${conversionMessages[0].value}`
      //     : '';
      //   this._snackBar.open(
      //     `${conversionMessage}`,
      //     'Close',
      //     this.config
      //   );
      // }
      const proceedToCheckoutResult = await this.proceedToCheckout();
      if ( proceedToCheckoutResult ) {
        await this.router.navigateByUrl( '/proplus/shipping-info' );
      }
    } else {
      this.userNotifier.alertError(
        'Error proceeding to checkout'
      );
    }
  }

  async createTemplate( templateName: string ) {
    const accountId = this.accountId;
    if ( accountId === null ) {
      throw new Error( 'No account is selected' );
    }
    const evItems = this.retrieveItems();
    if ( !evItems ) {
      throw new Error( 'No items available' );
    }
    const lineItems = evItems.filter( evItem => evItem.quantity && evItem.quantity > 0 )
      .map( ( i ) => {
        return {
          itemNumber: i.itemNumber,
          unitOfMeasure: i.uom,
          quantity: i.quantity || 0,
          color: '',
          MFG: '',
        };
      } );
    const templateResponse = await this.templateService.createTemplate( {
      templateName: templateName,
      account: accountId,
      items: lineItems,
    } );
    if ( !templateResponse || !templateResponse.success ) {
      if ( templateResponse.messages && templateResponse.messages[0] ) {
        const errorMessage = templateResponse.messages[0];
        if ( errorMessage.value && errorMessage.value.indexOf( 'duplicate' ) > -1 ) {
          this.userNotifier.alertError( `Template ${templateName} already exists, please enter a different name.` );
        } else {
          this.userNotifier.alertError( `Error creating template - ${templateName}. ${errorMessage.value}` );
        }
        return;
      } else {
        throw new AppError( `Error creating template - ${templateName}` );
      }
    }
    this.userNotifier.itemsAddedToTemplate(
      lineItems,
      templateResponse.result
    );
  }

  async openDialogNewTemplate() {
    this.isSubmitting = true;
    let isValid = true;
    const items = this.retrieveItems();
    if ( items ) {
      for ( const item of items ) {
        if ( !this.isQuantityValid( item.quantity ) ) {
          isValid = false;
          break;
        }
      }
      if ( !isValid ) {
        const toProceed = await this.askUserToConfirm( {
          title: 'Missing Item Quantities',
          question:
            'Some of the items in your order have a quantity of zero. Do you wish to proceed?',
          yesButton: 'Yes',
          noButton: 'No',
        } );
        if ( !toProceed ) {
          items.forEach( i => i.quantityMessage = '' );
          return;
        }
      }
      if ( this.itemsInEditing() ) {
        this._snackBar.open(
          'Please confirm the product items\' waste factor change',
          'Close',
          this.config
        );
        return;
      }
    } else {
      return;
    }
    await this.saveAll();
    const dialogRef = this.newTemplateDialog.open(
      CreateTemplateDialogComponent,
      {}
    );

    dialogRef.afterClosed().subscribe( async ( templateName: string ) => {
      if ( templateName ) {
        await this.createTemplate( templateName );
      }
    } );
  }

  isQuantityValid( quantity: number | string | null ) {
    return quantity && this.isNumber( quantity.toString() ) && this.isInDesiredForm( quantity.toString() ) &&
      parseInt( quantity.toString() ) > 0;
  }

  async saveAll() {
    const items = this.retrieveItems();
    const evItems: SaveAllRequestEVItem[] = items.map( i => {
      return {
        productId: i.productId,
        itemNumber: i.itemNumber,
        wasteFactor: i.wasteFactor && this.isQuantityValid( i.wasteFactor ) ? parseInt( i.wasteFactor ) : null,
        quantity: i.quantity && this.isQuantityValid( i.quantity ) ? parseInt( i.quantity.toString() ) : null
      }
    } );
    const saveAllRequest: SaveAllToEVOrderRequest = {
      evOrderId: this.evOrderId,
      baseWasteFactor: this.evOrderResult.baseWasteFactor ? parseInt( this.evOrderResult.baseWasteFactor ) : null,
      selectedJobNumber: this.evOrderResult.selectedJobNumber ? this.evOrderResult.selectedJobNumber : null,
      items: evItems
    }
    const response = await this.eagleViewService.saveAllToEVOrder( saveAllRequest );
    if ( !response.success ) {
      this.userNotifier.alertError(
        `Error saving the EagleView order items`
      );
    }
  }

  itemsInEditing() {
    const items = this.retrieveItems();
    if ( !items ) return false;
    const anyItemsInEditing = items.some( i => i.support3DMeasurement && i.editing &&
      i.wasteFactor !== parseInt( this.evOrderResult.evItems?.filter( evItem => evItem.itemNumber === i.itemNumber )[0].wasteFactor || '' ).toString() );
    return anyItemsInEditing;
  }

  async saveWasteFactorInEditing() {
    const items = this.retrieveItems();
    if ( !items ) return;
    const anyItemsInEditing = items.filter( i => i.support3DMeasurement && i.editing &&
      i.wasteFactor !== parseInt( this.evOrderResult.evItems?.filter( evItem => evItem.itemNumber === i.itemNumber )[0].wasteFactor || '' ).toString() );
    if ( anyItemsInEditing && anyItemsInEditing.length > 0 ) {
      anyItemsInEditing.forEach( async i => {
        let wasteFactor = i.wasteFactor;
        if ( i.wasteFactor ) {
          if ( this.isNumber( i.wasteFactor ) ) {
            if ( !this.isInDesiredForm( i.wasteFactor ) ) {
              wasteFactor = Math.round( parseFloat( i.wasteFactor ) ).toString();
              i.wasteFactor = wasteFactor;
            }
            const editItemRequest: EditEVOrderItemRequest = {
              evOrderId: this.evOrderId,
              id: i.id,
              itemNumber: i.itemNumber,
              wasteFactor: wasteFactor ? parseInt( wasteFactor ) : null,
              quantity: i.quantity && this.isQuantityValid( i.quantity ) ? i.quantity : null,
              manualQuantity: false
            };

            const response = await this.eagleViewService.editEVOrderItem( editItemRequest );
            if ( response.success ) {
              if ( response.result ) {
                // console.log('edit ev item result: ', response.result);
                i.quantity = response.result.quantity;
                i.manualQuantity = response.result.manualQuantity;
                i.editing = false;
                if ( i.quantity ) {
                  i.quantityMessage = '';
                }
                await this.loadEVOrderResult();
                // const message = `Successfully set`;
                // item.wasteFactorMessage = message;
              }
            }
          }
        }
      } )
    }
  }

  clearQuantityMessage() {
    let items = this.retrieveItems();
    items.forEach( i => {
      i.quantityMessage = '';
    } )
  }

  openTemplateSelectionDialog() {
    const dialogRef = this.templateDialog.open( TemplateDialogComponent, {
      width: '1000px',
      height: '120vh',
      data: {
        templateId: this.evOrderResult.template.templateId
      }
    } );
    dialogRef.afterClosed().subscribe( async ( result: string ) => {
      const editEVOrderRequest: EditEVOrderRequest = {
        evOrderId: this.evOrderId,
        templateId: result,
        baseWasteFactor: 10
      };
      const editEVOrderResponse = await this.eagleViewService.editEVOrder( editEVOrderRequest );
      if ( editEVOrderResponse.success ) {
        if ( editEVOrderResponse.messages ) {
          const messages = editEVOrderResponse.messages;
          // this._snackBar.open(
          //   `${messages[0].value}`,
          //   'Close',
          //   this.config
          // );
          const message = messages[0].value;
          const matches = message.match( /item\(s\)\s([0-9,]+)\shave been.+item\(s\)\s([0-9,]+)\sare unavailable/ );
          if ( matches ) {
            const availableItemIds = matches[1].split( ',' );
            const unavailableItemIds = matches[2].split( ',' );
            const templateDetailResponse = await this.templateService.getTemplateDetail(
              result,
              this.accountId || ''
            );
            if ( templateDetailResponse && templateDetailResponse.result.templateItems.length > 0 ) {
              const templateItems = templateDetailResponse.result.templateItems;
              const availableItems: ConfirmationProduct[] = templateItems
                .filter( item => availableItemIds.includes( item.itemNumber ) )
                .map( i => {
                  return {
                    name: i.itemOrProductDescription || '',
                    productId: i.productOrItemNumber || '',
                    itemNumber: i.itemNumber,
                    prodUrl: this.getProdUrl(
                      i.productOrItemNumber,
                      i.itemNumber
                    ),
                    productImageUrl: i.productImageUrl
                  }
                } );
              const unavailableItems: ConfirmationProduct[] = templateItems
                .filter( item => unavailableItemIds.includes( item.itemNumber ) )
                .map( i => {
                  return {
                    name: i.itemOrProductDescription || '',
                    productId: i.productOrItemNumber || '',
                    itemNumber: i.itemNumber,
                    prodUrl: this.getProdUrl(
                      i.productOrItemNumber,
                      i.itemNumber
                    ),
                    productImageUrl: i.productImageUrl
                  }
                } );
              const config: ProductConfirmationConfig = {
                unavailableLineItems: unavailableItems,
                availableLineItems: availableItems,
                unavailableSkuList: unavailableItemIds,
                cartOrTemplate: 'EagleView Order',
                whenUserSaysOk: ( ItemToAdd ) => { }
              };
              const dialogRef = this.availabilityDialog.open( ConfirmAvailableProductsComponent, {
                data: config,
              } );
              dialogRef.afterClosed().subscribe();
            }
          }
        }
        await this.loadEVOrderItems();
      } else {
        if ( editEVOrderResponse.messages ) {
          const message = editEVOrderResponse.messages[0];
          this._snackBar.open(
            `${message.value}`,
            'Close',
            this.config
          );
        }
      }
    } );
  }

  public getProdUrl( productId?: string, itemNumber?: string ) {
    if ( productId && itemNumber ) {
      return ['/productDetail', productId, itemNumber];
    }
    if ( productId ) {
      return ['/productDetail', productId];
    }
    return [];
  }
  //
  buildImageUrl( str: any ) {
    const url = str.replace( '_thumb.jpg', '_small.jpg' );
    return url;
  }
  /* Search Modal */
  public async openSearchModal( categoryId: number, searchTerm: string, categoryName: string ) {
    // console.log( { categoryId, searchTerm, categoryName } )
    // searchAll( categoryId: number, searchTerm: string ) {
    /*  if ( this.itemsInEditing() ) {
       await this.saveWasteFactorInEditing();
     } */
    //
    let searchCategories: string[] = [];
    const categories = this.categories.filter( c => c.categoryId === categoryId );
    if ( categories && categories.length > 0 ) {
      if ( categories[0].categoryName === 'Miscellaneous' ) {
        searchCategories.push( 'miscellaneous' );
      } else {
        searchCategories = categories[0].subcategories;
      }
    }
    let dialogConfig;
    dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      fromPage: 'smart-order',
      fromModal: undefined,
      accountId: this.accountId,
      searchType: 'catFilter',
      searchCategories,
      account: this.account,
      categoryName
    };
    const dialogRef = this.productSearchDialog.open( ProductSearchModalComponent, dialogConfig );
    dialogRef.afterClosed().subscribe( async ( result: any ) => {
      if ( !result ) {
        return;
      }
      const { currentUOM } = result.currentSKU;
      // addProduct to EVOrder
      await this.addProduct( {
        quantity: 1,
        productId: result.product.productId,
        sku: result.currentSKU,
        uom: currentUOM
      } )
    } );
  }
  openSearchContainer() {
    let dialogConfig;
    dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      fromPage: 'smart-order',
      fromModal: 'modal-detail',
      accountId: this.accountId,
      searchType: 'catFilter',
      productId: ''
    };
    const dialogRef = this.productSearchDialog.open( SearchModalContainerComponent, dialogConfig );
    dialogRef.afterClosed().subscribe( async ( result: any ) => {
      console.log( 'Dialog Result', { result } );
      if ( !result ) {
        return;
      }
    } );
  }
}

interface Category {
  categoryId: number;
  categoryName: string;
  subcategories: string[];
}

interface CategoryGroup {
  categoryId: number;
  categoryName: string;
  isGroupBy: boolean;
  itemCount: number;
  listOfProductIds: string[];
}

interface CategoryGroupEmpty {
  categoryId: number;
  categoryName: string;
  isGroupByEmpty: boolean;
}

export interface EVItemWithVariation {
  id: string;
  itemNumber: string;
  productId: string;
  itemName: string;
  itemImage: string;
  category: ItemCategory;
  wasteFactor: string | null;
  manualQuantity: boolean | null;
  quantity: number | null;
  uom: string;
  price: number;
  variationOptions: VariationOption[] | null;
  variations: Record<string, Record<string, string[]>> | null;
  skusVariation: Record<string, Record<string, string[]>> | null;
  support3DMeasurement: boolean;
  mainCategory: string;
  currentVendorColorId: string | null;
  vendorColors: any[] | null;
  currentVariations: any | null;
}



export interface EVItemWithVariationTemplate {
  id: string;
  itemNumber: string;
  productId: string;
  itemName: string;
  itemImage: string;
  category: ItemCategory;
  wasteFactor: string | null;
  manualQuantity: boolean | null;
  quantity: number | null;
  uom: string;
  price: number;
  variationOptions: VariationOption[] | null;
  variations: Record<string, Record<string, string[]>> | null;
  skusVariation: Record<string, Record<string, string[]>> | null;
  support3DMeasurement: boolean;
  mainCategory: string;
  facetSelectors: FacetSelector[];
  activeVariations: Record<string, IAttrOption[]>;
  moreFacetOptions: boolean;
  selectedFilters: Map<string, string>;
  variationsTemplate: Variations;
  editing: boolean;
  currentVendorColorId: string | null;
  vendorColors: any[] | null;
  currentVariations: any | null;
  wasteFactorMessage: string;
  quantityMessage: string;
}
