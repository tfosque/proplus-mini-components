import { Injectable } from '@angular/core';
import { ProPlusApiBase } from './pro-plus-api-base.service';
import { RebateLandingResponse } from '../model/rebate-landing';
import { RebateRedeemedSummaryRequest, RebateRedeemedSummaryResponse } from '../model/rebate-redeemed-summary';
import { RebateRedeemedDetailResponse } from '../model/rebate-redeemed-detail';
import { RebateFormResponse } from '../model/rebate-form-vendor-detail';
import {
    SubmitRebateRequest,
    SubmitRebateResponse,
} from '../model/submit-rebate';
import { ApiError } from '../services/api-error';
import { SubmittedRebateFormRequest, SubmittedRebateFormResponse } from '../model/rebate-submitted-form';
import { UnenrollRebateResponse, UpdateRebateFormRequest, UpdateRebateFormResponse } from '../model/update-rebate-form';

@Injectable( {
    providedIn: 'root',
} )
export class RebateService {
    constructor( private readonly api: ProPlusApiBase ) { }
    public async getRebateLandingData() {
        try {
            const response = await this.api.getV2<RebateLandingResponse>(
                'rebateLanding',
                {}
            );
            const { ok, status, body } = response;
            if ( !ok || !body ) {
                if ( !ok ) {
                    throw new ApiError( 'rebateLanding', response );
                }
                return null;
            }
            if ( status === 200 ) {
                return body;
            }
            return null;
        } catch ( error ) {
            return null;
        }
    }

    public async getRebateRedeemedSummaryItems( request: RebateRedeemedSummaryRequest = {
        searchBy: '',
        searchTerm: '',
        filter: ''
    } ) {
        try {
            const response = await this.api.getV2<RebateRedeemedSummaryResponse>(
                'getRebateRedeemedSummaryItems',
                request.filter ? {
                    filter: request.filter
                } :
                    ( request.searchBy ? {
                        searchBy: request.searchBy,
                        searchTerm: request.searchTerm
                    } : {} )
            );
            const { ok, status, body } = response;
            if ( !ok || !body ) {
                if ( !ok ) {
                    throw new ApiError( 'rebateRedeemedSummaryItems', response );
                }
                return null;
            }
            if ( status === 200 ) {
                return body;
            }
            return null;
        } catch ( error ) {
            return null;
        }
    }

    public async getRebateRedeemedItemDetail(
        rebateItem: any
    ): Promise<RebateRedeemedDetailResponse> {
        const { ok, body } = await this.api.postV2<any>(
            'getRebateRedeemedItemDetail',
            rebateItem
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to fetch rebate redeemed item detail' );
        }
        return body;
    }

    public async getRebateForm( rebateForm: any ) {
        try {
            const response = await this.api.getV2<RebateFormResponse>(
                'getRebateForm',
                rebateForm
            );
            const { ok, status, body } = response;
            if ( !ok || !body ) {
                if ( !ok ) {
                    throw new ApiError( 'rebateForm', response );
                }
                return null;
            }
            if ( status === 200 ) {
                return body;
            }
            return null;
        } catch ( error ) {
            return null;
        }
    }

    public async submitRebate(
        rebateForm: SubmitRebateRequest
    ): Promise<SubmitRebateResponse> {
        const { ok, body } = await this.api.postV2<SubmitRebateResponse>(
            'submitRebate',
            rebateForm
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to fetch submit rebate' );
        }
        return body;
    }

    public async getSubmittedRebateForm( request: SubmittedRebateFormRequest ) {
        try {
            const response = await this.api.getV2<SubmittedRebateFormResponse>(
                'getSubmittedRebateForm',
                request
            );
            const { ok, status, body } = response;
            if ( !ok || !body ) {
                if ( !ok ) {
                    throw new ApiError( 'getSubmittedRebateForm', response );
                }
                return null;
            }
            if ( status === 200 ) {
                return body;
            }
            return null;
        } catch ( error ) {
            return null;
        }
    }

    public async updateRebateForm(
        rebateForm: UpdateRebateFormRequest
    ): Promise<UpdateRebateFormResponse> {
        const { ok, body } = await this.api.postV2WithError<UpdateRebateFormResponse>(
            'updateRebateForm',
            rebateForm
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to update rebate form' );
        }
        return body;
    }

    public async unenrollRebate( rebateId: string ): Promise<UnenrollRebateResponse> {
        const { ok, body } = await this.api.postV2WithError<UnenrollRebateResponse>(
            'unenrollRebate', null,
            { rebateId: rebateId }
        );
        if ( !ok || !body ) {
            throw new Error( 'Failed to unenroll rebate' );
        }
        return body;
    }
}

