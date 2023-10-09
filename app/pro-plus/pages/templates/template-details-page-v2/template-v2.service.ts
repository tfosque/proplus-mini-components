import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { ProductsService } from 'src/app/pro-plus/services/products.service';
// import { TemplatesService } from 'src/app/pro-plus/services/templates.service';
import { BasicResponse, UserService } from 'src/app/pro-plus/services/user.service';
import { ProPlusApiBase } from 'src/app/pro-plus/services/pro-plus-api-base.service';
import { TemplateListResponse, TemplateListResult } from 'src/app/pro-plus/model/template-list-response';
import { TemplateDetailResponse } from 'src/app/pro-plus/model/template-detail-response';
import { UpdateTemplateRequest } from 'src/app/pro-plus/model/update-template-request';
import { UpdateTemplateResult } from 'src/app/pro-plus/model/update-template-response';
import { CopyRequest } from '../template-browse-page/template-browse-page.component';
import { TemplateReference } from 'src/app/pro-plus/model/template-list';

interface AccountInfo {
  accountId: string;
  jobs: string[];
}
interface TemplateInfo {
  templateId: string;
  templateName: string;
}
interface LineItem {
  selected: boolean;
  desc: string;
  sku: string;
  nickName: string;
  quantity: number;
}

@Injectable( {
  providedIn: 'root'
} )
export class TemplateV2Service {
  /* Session */
  userInfo: any = {};
  accountInfo: AccountInfo = { accountId: '', jobs: [] };

  /* Data */
  private templateDataSrc = new BehaviorSubject<any>( [] );
  public templateDataSrc$ = this.templateDataSrc.asObservable();
  private templateOptionsDtaSrc = new BehaviorSubject<any>( [] );
  public templateOptionsDtaSrc$ = this.templateOptionsDtaSrc.asObservable();
  isLoadingTemplates = new BehaviorSubject<boolean>( false );
  availTemplates: any = [];

  /* Template */
  private templateInfo: any = new BehaviorSubject<TemplateInfo>( { templateId: '', templateName: '' } );
  public templateInfo$ = this.templateInfo.asObservable();
  // TODO rename templateObj and templatePagDataInfo
  private templateLineItems = new BehaviorSubject<any>( [] );
  public templateLineItems$ = this.templateLineItems.asObservable();
  templateLineItem: LineItem = { selected: false, desc: '', sku: '', nickName: '', quantity: 0 };

  /* Selected Items */
  private templateSelectedItems = new BehaviorSubject<any[]>( [] );
  public templateSelectedItems$ = this.templateSelectedItems.asObservable();

  /* Jobs */
  private jobs = new BehaviorSubject<any[]>( [] );
  public jobs$ = this.jobs.asObservable();
  selectedJob = new BehaviorSubject<any>( null );

  /* Buttons */
  private saveAll = new BehaviorSubject<boolean>( false );
  public saveAll$ = this.saveAll.asObservable();
  /*  */
  dataSrc: any = [];
  /*  */
  isLoadingTemplateItems = new BehaviorSubject<boolean>( true );
  /*  */
  isSelected = new BehaviorSubject<any>( [] );
  private updatedLineItems = new BehaviorSubject<any[]>( [] );
  public updatedLineItems$ = this.updatedLineItems.asObservable();
  /*  */
  private hasTemplateChanges = new BehaviorSubject<boolean>( false );
  public hasTemplateChanges$ = this.hasTemplateChanges.asObservable();


  /*  */
  constructor(
    private readonly userService: UserService,
    private readonly api: ProPlusApiBase,
    // private readonly productService: ProductsService,    
  ) {
    // Fetch User Info via subscriber
    this.userService.sessionBehavior.subscribe( userInfo => {
      // console.log( { userInfo } );
      this.userInfo = userInfo.session.user;
      this.userInfo.accoundId = userInfo.lastSelectedAccount?.accountLegacyId;
    } );
    // getTemplates for dropdown
    // this.getTemplatesByAccount( this.userInfo.accoundId );
  }

  /*  */
  /* loadTemplate() { } */
  async getTemplatesByAccount(
    account: string
  ): Promise<TemplateListResponse> {
    //  TODO:  This method should fetch a complete list of templates
    const { ok, body } = await this.api.getV2<TemplateListResponse>(
      'template',
      {
        account: account,
        pageSize: '100',
        showItems: 'false',
      }
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to fetch templates' );
    }
    console.log( { body } );
    return body;
  }
  async getTemplateDetail(
    templateId: string,
    account: string,
    jobNumber?: string
  ): Promise<TemplateDetailResponse | null> {
    const request = {
      templateId: templateId,
      account: account,
      showItems: 'true',
      showItemVariations: 'true',
      showPricing: 'true',
      showItemAvailable: 'true',
      // 'showItemCurrentVariation': 'true',
      jobNumber: jobNumber,
      invokeBy: 'store',
    };
    if ( !request.jobNumber ) {
      delete request.jobNumber;
    }
    const { ok, body } = await this.api.getV2<TemplateDetailResponse>(
      'getTemplateDetail',
      request
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to fetch template details' );
    }
    /*  this.fetchSuggestions(
         body.result.templateItems.map((i) => i.itemNumber)
     ); */
    // console.log( { body } )
    this.templateLineItems.next( body.result.templateItems );
    return body;
  }
  async getTemplatesV1(
    account: number | string,
    pageNoParameter: number,
    pageSizeParameter: number
  ): Promise<TemplateListResult> {
    pageNoParameter = pageNoParameter || 0;
    pageSizeParameter = pageSizeParameter || 10;
    const pageNo = ( pageNoParameter + 1 ).toString();
    const pageSize = pageSizeParameter.toString();
    const request = {
      account: account.toString() || '',
      pageNo,
      pageSize,
    };
    // console.log('Template Request', request);
    const { ok, body } = await this.api.getV1<TemplateListResult>(
      'template',
      request
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to fetch templates' );
    }
    return body;
  }

  // TODO evaluate if changes need to come from itemDetails api call
  // since we are only sending itemNumber, qty, and nickname no need for api call?
  async updateLineItemChanges( target: string, element: any, val: any ) {
    // identify what changed and where to add the new changes   
    // const targets = ['quantity', 'variation', 'nickName'}]
    /*
    targets.filter((t: any) => {
      if(targets[target]){
       //
      }
    });
    */

    /* QTY */
    if ( target === 'qty' ) {
      element.quantity = val;

      const update = this.templateLineItems.value.filter( ( item: any ) => {
        const match = element.itemNumber === item.itemNumber;

        if ( match ) {
          item = element;
          return item;
        }
        return item; // will return all items to include unchanges
      } );
      // console.log( { update } );
      // console.log( 'this.updated', this.updatedLineItems.value );
      this.updatedLineItems.next( update );
      this.hasTemplateChanges.next( true );
    }

    /* VARIATION */
    if ( target === 'variation' ) {
      element.multiVariationData.currentVariations = val;

      const update = this.templateLineItems.value.map( ( item: any ) => {
        const match = element.itemNumber === item.itemNumber;

        if ( match ) {
          item = element;
          return item;
        }
        return item;
      } );
      // console.log( { update } );
      this.updatedLineItems.next( update );
      this.hasTemplateChanges.next( true );
    }

    if ( target === 'nickname' ) {
      element.nickName = val;

      const update = this.templateLineItems.value.map( ( item: any ) => {
        const match = element.itemNumber === item.itemNumber;

        if ( match ) {
          item = element;
          return item;
        }
        return item;
      } );
      // console.log( { update } );
      this.updatedLineItems.next( update ); // TODO maybe not necessary?
      this.hasTemplateChanges.next( true );
    }
  }
  public async saveUpdatedItems() {
    // TODO what about updating variations?

    // POST TO API if success then update line items
    const { templateId, templateName } = this.templateInfo.value;
    const { accountId } = this.accountInfo;

    /*  console.log( this.templateInfo );
     console.group( 'template' );
     console.log( 'acct:', this.accountInfo );
     console.log( 'temp:', this.templateInfo.value ) */

    const items = this.updatedLineItems.value.map( ( m: any ) => {
      return {
        itemNumber: m.itemNumber,
        nickName: m.nickName,
        quantity: m.quantity,
        templateItemId: m.templateItemId,
        unitOfMeasure: m.unitOfMeasure
      }
    } );

    // create body // TODO types
    const body: any = { account: accountId, action: 'updateItem', items, templateId, templateName };
    console.log( { body } );

    // TODO Error handling
    const response = await this.updateTemplate( body );
    console.log( { response } );

    // if response.success
    this.updatedLineItems.next( body.items ); // TODO maybe not necessary?

    return response
  }

  public async addTemplateItems(
    selectedTemplate: TemplateReference,
    lineItems: {
      templateItemId?: string;
      itemNumber: string;
      unitOfMeasure: string;
      quantity: number;
    }[]
  ) {
    const accountId = selectedTemplate.accountLegacyId;
    const request: UpdateTemplateRequest = {
      account: accountId,
      action: 'createItem',
      templateId: selectedTemplate.templateId,
      templateName: selectedTemplate.templateName,
      items: lineItems,
    };
    return await this.updateTemplateItems( request );
  }
  async updateTemplateItems(
    request: UpdateTemplateRequest
  ): Promise<UpdateTemplateResult> {
    const queryParameters: Record<string, string | boolean> = {};
    if ( request.action === 'updateItem' ) {
      if ( request.invokeBy ) {
        queryParameters.invokeBy = request.invokeBy;
        delete request.invokeBy;
      }
      if ( request.ignoreInvalidItems ) {
        queryParameters.ignoreInvalidItems = request.ignoreInvalidItems;
        delete request.ignoreInvalidItems;
      }
    }

    const { ok, body } = await this.api.postV2<UpdateTemplateResult>(
      'updateTemplate',
      request,
      queryParameters
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to update template' );
    }
    return body;
  }
  public async updateTemplate( headerBody: UpdateTemplateRequest ) {
    const parameters = {
      invokeBy: 'store',
      ignoreInvalidItems: 'false',
    };
    const { ok, body } = await this.api.postV2<UpdateTemplateResult>(
      'updateTemplate',
      headerBody,
      parameters
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to update template' );
    }
    console.log( { body } );
    return body;
  }
  addItemsToCart( items: any ) { }
  deleteTemplateLineItem( item: any ) { }
  saveTemplateName( name: string ) { }
  clearQty() { }
  public async copyTemplate( request: CopyRequest ): Promise<BasicResponse> {
    const { ok, body } = await this.api.postV2<BasicResponse>(
      'copyTemplate',
      request
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to copy template' );
    }
    return body;
  }

  public updateAccountInfo( info: AccountInfo ): void {
    this.accountInfo.accountId = info.accountId;
    this.accountInfo.jobs = info.jobs;
    // console.log( { info } )
  }

  public updateTemplateInfo( info: TemplateInfo ): void {
    this.templateInfo.next( { templateId: info.templateId, templateName: info.templateName } );
    // console.log( { info } )
  }
}
