import { Injectable } from '@angular/core';
import { ApiResponse, ProPlusApiBase } from './pro-plus-api-base.service';
import {
    EagleViewOrderRequest,
    EagleViewOrderResponse,
    EagleViewOrderReportReponse,
    EagleViewOrderReportReponseV3
} from '../model/eagle-view-order';
import { 
    EagleViewUpgradeOrderRequest,
    EagleViewUpgradeOrderResponse,
    EagleViewOrderUpgradeProductsReponse
} from '../model/eagle-view-upgrade-order';
import { EagleViewOktaLoginUrlResponse } from '../model/eagle-view-login-url-response';
import {
    EagleViewExchangeOktaAuthCodeRequest,
    EagleViewExchangeOktaAuthCodeResponse
} from '../model/eagle-view-exchange-auth-code';
import {
    EagleViewAccountReportRequest,
    EagleViewAccountReportResult
} from '../model/eagle-view-report';
import { 
    AddEVOrderItemRequest, 
    AddEVOrderItemResponse, 
    ConvertEVOrderResponse, 
    CreateEVOrderRequest, 
    CreateEVOrderResponse, 
    DeleteEVOrderItemRequest, 
    DeleteEVOrderItemResponse, 
    DeleteEVOrderRequest, 
    EVOrderListResponse, 
    EditEVOrderItemRequest, 
    EditEVOrderRequest, 
    EditEVOrderResponse, 
    GetEVOrderCategoriesResponse, 
    GetEVOrderResponse, 
    SaveAllToEVOrderRequest
} from '../model/eagle-view-smart-order';
// import { ApiError } from "../services/api-error";

@Injectable({
    providedIn: 'root',
})
export class EagleViewService {
    constructor(private readonly api: ProPlusApiBase) {}

    public async placeEagleViewOrder(
        eagleViewForm: EagleViewOrderRequest
    ): Promise<EagleViewOrderResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2WithError<EagleViewOrderResponse>(
            'placeEagleViewOrder',
            eagleViewForm
        );
        if (!ok || !body) {
            throw new Error('Failed to place Eagleview order');
        }
        return body;
    }

    public async getEagleViewOrderReport(
        reportId: string
    ): Promise<EagleViewOrderReportReponse> {
        const { ok, body } = await this.api.getV2NoErrThrow<EagleViewOrderReportReponse>(
            'getEagleViewOrderReport',
            {
                reportId: reportId
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch Eagleview Report Details');
        }
        return body;
    }

    public async placeEagleViewUpgradeOrder(
        eagleViewUpgradeForm: EagleViewUpgradeOrderRequest
    ): Promise<EagleViewUpgradeOrderResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2WithError<EagleViewUpgradeOrderResponse>(
            'placeEagleViewUpgradeOrder',
            eagleViewUpgradeForm
        );
        if (!ok || !body) {
            throw new Error('Failed to place Eagleview upgrade order');
        }
        return body;
    }

    public async getEagleViewOrderUpgradeProducts(
        reportId: string
    ): Promise<EagleViewOrderUpgradeProductsReponse> {
        const { ok, body } = await this.api.getV2NoErrThrow<EagleViewOrderUpgradeProductsReponse>(
            'getEagleViewOrderUpgradeProducts',
            {
                reportId: reportId
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch Eagleview order upgrade products');
        }
        return body;
    }

    public async getEagleViewOrderReportV3(
        reportId: string
    ): Promise<EagleViewOrderReportReponseV3> {
        const { ok, body } = await this.api.getV2NoErrThrow<EagleViewOrderReportReponseV3>(
            'getEagleViewOrderReportV3',
            {
                reportId: reportId
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch Eagleview Report Details V3');
        }
        return body;
    }

    public async getOktaEagleViewLoginUrl(): Promise<EagleViewOktaLoginUrlResponse> {
        const { ok, body } = await this.api.getV2<EagleViewOktaLoginUrlResponse>(
            'getOktaEagleViewLoginUrl',
            {}
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch Eagleview okta login url');
        }
        return body;
    }

    public async exchangeOktaEagleViewAuthorizationCode(
        exchangeCodeRequest: EagleViewExchangeOktaAuthCodeRequest
    ): Promise<EagleViewExchangeOktaAuthCodeResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2WithError<EagleViewExchangeOktaAuthCodeResponse>(
            'exchangeOktaEagleViewAuthorizationCode',
            exchangeCodeRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to exchange EagleView okta authorization code');
        }
        return body;
    }

    public async unlinkEVAccount(): Promise<EagleViewExchangeOktaAuthCodeResponse> {
        const { ok, body } = await this.api.getV2<EagleViewExchangeOktaAuthCodeResponse>(
            'unlinkEVAccount',
            {}
        );
        if (!ok || !body) {
            throw new Error('Failed to unlink EagleView account');
        }
        return body;
    }

    public getEagleViewOrderReports(
        pageNo: number,
        count: number,
        request: EagleViewAccountReportRequest
    ) {
        // const {
        //     ok,
        //     body,
        // } = await this.api.postV2<EagleViewAccountReportResponse>(
        //     'getEagleViewOrderReports',
        //     request,
        //     {
        //         page: pageNo,
        //         count: count
        //     }
        // );
        // if (!ok || !body) {
        //     throw new Error('Failed to retrieve EagleView reports');
        // }
        // return body;
        return this.api.postApiObservable<
            ApiResponse<EagleViewAccountReportResult>
        >('v2', 'getEagleViewOrderReports', request, { page: pageNo, count: count });
    }

    public async createEVOrder(
        createEVOrderRequest: CreateEVOrderRequest
    ): Promise<CreateEVOrderResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2<CreateEVOrderResponse>(
            'createEVOrder',
            createEVOrderRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to create EagleView order from report');
        }
        return body;
    }

    public async editEVOrder(
        editEVOrderRequest: EditEVOrderRequest
    ): Promise<EditEVOrderResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2WithError<EditEVOrderResponse>(
            'editEVOrder',
            editEVOrderRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to edit EagleView order from report');
        }
        return body;
    }

    public async deleteEVOrder(
        deleteEVOrderRequest: DeleteEVOrderRequest
    ): Promise<EditEVOrderResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2<EditEVOrderResponse>(
            'deleteEVOrder',
            deleteEVOrderRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to delete the EagleView order');
        }
        return body;
    }

    public async getEVOrder(
        evOrderId: string
    ): Promise<GetEVOrderResponse> {
        const { ok, body } = await this.api.getV2<GetEVOrderResponse>(
            'getEVOrder',
            {
                evOrderId: evOrderId
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch EagleView order');
        }
        return body;
    }

    public async addEVOrderItem(
        addEVOrderItemRequest: AddEVOrderItemRequest
    ): Promise<AddEVOrderItemResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2WithError<AddEVOrderItemResponse>(
            'addEVOrderItem',
            addEVOrderItemRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to add item to EagleView order');
        }
        return body;
    }

    public async deleteEVOrderItem(
        deleteEVOrderItemRequest: DeleteEVOrderItemRequest
    ): Promise<DeleteEVOrderItemResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2<DeleteEVOrderItemResponse>(
            'deleteEVOrderItem',
            deleteEVOrderItemRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to delete item from EagleView order');
        }
        return body;
    }

    public async editEVOrderItem(
        editEVOrderItemRequest: EditEVOrderItemRequest
    ): Promise<AddEVOrderItemResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2<AddEVOrderItemResponse>(
            'editEVOrderItem',
            editEVOrderItemRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to edit item on EagleView order');
        }
        return body;
    }

    public async getEVOrderCategories(): Promise<GetEVOrderCategoriesResponse> {
        const { ok, body } = await this.api.getV2<GetEVOrderCategoriesResponse>(
            'getEVOrderCategories',
            {}
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch EagleView order categories');
        }
        return body;
    }

    public async convertEVOrderToATGOrder(
        convertEVOrderRequest: DeleteEVOrderRequest
    ): Promise<ConvertEVOrderResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2<ConvertEVOrderResponse>(
            'convertEVOrderToATGOrder',
            convertEVOrderRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to convert EagleView order');
        }
        return body;
    }

    public async saveAllToEVOrder(
        saveAllToEVOrderRequest: SaveAllToEVOrderRequest
    ): Promise<GetEVOrderResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2<GetEVOrderResponse>(
            'saveAllToEVOrder',
            saveAllToEVOrderRequest
        );
        if (!ok || !body) {
            throw new Error('Failed to save all to EagleView order');
        }
        return body;
    }

    public async EVOrderList(): Promise<EVOrderListResponse> {
        const { ok, body } = await this.api.getV2<EVOrderListResponse>(
            'EVOrderList',
            {
                searchBy: 'isCompleted',
                searchTerm: false
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch EagleView unfinished smart order');
        }
        return body;
    }
}
