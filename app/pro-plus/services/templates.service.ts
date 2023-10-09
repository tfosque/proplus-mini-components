import {
    CreateTemplateRequest,
    CreateTemplateResponse,
} from './../model/template-creation';
import { Injectable } from '@angular/core';
import { TemplateListResponse, TemplateListResult } from '../model/template-list-response';
import { TemplateDetailResponse } from '../model/template-detail-response';
import { ProPlusApiBase } from './pro-plus-api-base.service';
import { UpdateTemplateResult } from '../model/update-template-response';
import { UpdateTemplateRequest } from '../model/update-template-request';
import { BasicResponse } from './user.service';
import { CopyRequest } from '../pages/templates/template-browse-page/template-browse-page.component';
import { TemplateReference } from '../model/template-list';
import { BehaviorSubject } from 'rxjs';
// import { ProductsService, SuggestiveSellingItem } from './products.service';

type OrderByField = string;
type OrderByDirection = string;

@Injectable( {
    providedIn: 'root',
} )
export class TemplatesService {
    private templateLineItems = new BehaviorSubject<any>( [] );
    public templateLineItems$ = this.templateLineItems.asObservable();
    /*  */
    public templateItems$ = new BehaviorSubject<any[]>( [] );
    constructor(
        private readonly api: ProPlusApiBase,
        // private readonly productsService: ProductsService
    ) { }

    async getTemplatesForDataSource(
        account: number | string,
        pageNoParameter: number,
        pageSizeParameter: number,
        filterBy: string,
        filter: string,
        orderByField: OrderByField,
        orderByDirection: OrderByDirection
    ): Promise<TemplateListResponse> {
        //  TODO:  This method should fetch a complete list of templates
        pageNoParameter = pageNoParameter || 0;
        pageSizeParameter = pageSizeParameter || 5;
        orderByDirection = orderByDirection || 'asc';
        const orderBy =
            orderByField === '' ? '' : `${orderByField} ${orderByDirection}`;
        const pageNo = ( pageNoParameter + 1 ).toString();
        const pageSize = pageSizeParameter.toString();
        const invokeBy = 'store';
        const showItems = 'false';
        const request = {
            account: account.toString() || '',
            pageNo,
            pageSize,
            filterBy,
            filter,
            orderBy,
            invokeBy,
            showItems,
        };
        // console.log('Template Request', request);
        const { ok, body } = await this.api.getV2<TemplateListResponse>(
            'template',
            request
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to fetch templates' );
        }
        return body;
    }

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
        return body;
    }
    async createTemplate(
        request: CreateTemplateRequest
    ): Promise<CreateTemplateResponse> {
        //  TODO:  This method should fetch a complete list of templates
        const { ok, body } = await this.api.postV2WithError<CreateTemplateResponse>(
            'createTemplate',
            request
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to create template' );
        }
        return body;
    }

    // Fetches a single template
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
        this.templateLineItems.next( body.result );
        return body;
    }

    /* public fetchSuggestions( items: string[] ) {
        const accountId = this.api.userSession.value.accountId;
        if ( !accountId || !items || items.length === 0 ) {
            this.templateItems$.next( [] );
            return;
        }
        this.productsService
            .getSuggestiveSelling( {
                account: accountId.toString(),
                pageNo: 1,
                pageSize: 10,
                itemNumber: items,
            } )
            .subscribe( ( s ) => {
                this.templateItems$.next( ( s && s.result ) || [] );
            } );
    } */

    public async deleteTemplate(
        templateId: string,
        accountId: string
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'deleteTemplate',
            {
                templateId: templateId,
                account: accountId,
            }
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to delete template' );
        }
        return body;
    }

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

    // Update template
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
}
