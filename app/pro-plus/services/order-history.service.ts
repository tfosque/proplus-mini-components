import { ApiError } from './../../common-components/classes/app-error';
import { Injectable } from '@angular/core';
import { OrderHistoryResponse } from '../model/order-history-response';
import { ProPlusApiBase, ApiResponse } from './pro-plus-api-base.service';
import { OrderDetailResponseV2, DTOrderDetailResponse } from '../model/order-detail-response';
// import { ProductItemDetails } from '../model/product-item-details';
// import { ItemDetailsResponse } from '../model/item-details-response';
import {
    ProductItemRequest,
    ProductsService,
    Product,
} from './products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OrderHistoryService {
    constructor(
        private readonly api: ProPlusApiBase,
        private readonly productsService: ProductsService
    ) {}
    // async getOrderHistory(accountId: string): Promise<OrderHistoryResponse> {
    //   const { body } = await this.api.getV1<OrderHistoryResponse>('orderhistory', {
    //     'accountId': accountId,
    //     'pageSize': '100'
    //   });
    //   if (body == null) {
    //     return { message: 'No orders were found.', orders: [] };
    //   }
    //   const { message, orders } = body;
    //   return {
    //     message: message,
    //     orders: (orders == null) ? [] : orders
    //   };
    // }

    async getOrderHistory(accountId: string): Promise<OrderHistoryResponse> {
        const pageNo = 1;
        const pageSize = 100;
        const parameters: Record<string, any> = { accountId, pageNo, pageSize };

        try {
            const { body } = await this.api.getV2<OrderHistoryResponse>(
                'orderhistory_v2',
                parameters
            );
            if (body === null) {
                return {
                    message: 'No orders were found.',
                    result: {
                        orders: [],
                    },
                };
            }
            // const { message, result } = body;
            // console.log({ message }, { result });
            return body;
        } catch (error) {
            if (
                error instanceof ApiError &&
                error.body.messages &&
                error.body.messages.length &&
                error.body.messages[0].code === 5004
            ) {
                return {
                    message: 'No orders were found.',
                    result: {
                        orders: [],
                    },
                };
            }
            throw error;
        }
    }
    async getFullOrderHistory(
        accountId: string,
        pageNo: string,
        pageSize: string,
        searchBy: string | null,
        searchTerm: string | null,
        searchStartDate: string | null,
        searchEndDate: string | null,
        searchEnum: string | null,
        orderBy: string | null
    ): Promise<OrderHistoryResponse> {
        const parameters: Record<string, any> = { accountId, pageNo, pageSize };

        if (searchBy) {
            parameters.searchBy = searchBy;
        }
        if (searchTerm) {
            parameters.searchTerm = searchTerm;
        }
        if (searchStartDate) {
            parameters.searchStartDate = searchStartDate;
        }
        if (searchEndDate) {
            parameters.searchEndDate = searchEndDate;
        }
        if (searchEnum) {
            parameters.searchEnum = searchEnum;
        }
        if (orderBy) {
            parameters.orderBy = orderBy;
        }
        try {
            const { body } = await this.api.getV2<OrderHistoryResponse>(
                'orderhistory_v2',
                parameters
            );
            if (body === null) {
                return {
                    message: 'Your order list is currently empty.',
                    result: {
                        orders: [],
                    },
                };
            }
            // const { message, orders } = body;
            // console.log('OrderIds', orders.map(o => o.orderId));
            return body;
        } catch (error) {
            console.error(error);
            if (error instanceof HttpErrorResponse && error.status === 403) {
                return {
                    message:
                        `We're sorry, but you do not have access to this page. ` +
                        `Please call us at 888.685.6111 or chat with us for further assistance.`,
                    result: {
                        orders: [],
                    },
                };
            }
            if (
                error instanceof ApiError &&
                error.body.messages &&
                error.body.messages.length &&
                error.body.messages[0].code === 5004
            ) {
                return {
                    message: 'Your order list is currently empty.',
                    result: {
                        orders: [],
                    },
                };
            }
            throw error;
        }
    }

    async getOrderDetail(
        orderId: string,
        account: string,
        accountToken: string | null,
        showDT = true
    ): Promise<OrderDetailResponseV2> {
        const request = accountToken
            ? { orderId: orderId, accountId: account, accountToken, showDT: showDT ? 'true' : 'false' }
            : { orderId: orderId, accountId: account, showDT: showDT ? 'true' : 'false' };
        const { ok, body } = await this.api.getV2<
            ApiResponse<OrderDetailResponseV2>
        >('orderdetail', request);
        if (!ok || !body) {
            throw new Error('Failed to fetch order details');
        }
        return body.result;
    }
    async getProductDetail(itemNumberInput: string): Promise<Product | null> {
        const itemNumber = parseInt(itemNumberInput, 10);
        if (!(itemNumber > 0)) {
            return null;
        }
        const req: ProductItemRequest = {
            itemNumber: itemNumber.toString(),
        };
        const { isLoggedIn, accountId } = this.api.userSession.value;
        if (isLoggedIn && accountId) {
            req.accountId = accountId.toString();
        }
        const product = await this.productsService.getItemDetails(req);
        if (!product) {
            return null;
        }
        return product.product;
    }

    async setAlert(phone: string, email: string): Promise<SetAlertResponse> {
        const { ok, body } = await this.api.postV2<SetAlertResponse>(
            'updateStatusChange',
            {
                dtEmailAddress: email,
                dtPhoneNumber: phone,
            }
        );
        if (!ok || !body) {
            throw new Error('Failed');
        }
        return body;
    }

    async downloadOrderDetailAsPDF(
        accountId: string,
        orderId: string,
        accountToken: string,
        showPrice: string
    ): Promise<Blob> {
        return await this.api
            .getApiDataUrlBlob('v2', 'downloadOrderDetailAsPDF', {
                orderId: orderId,
                accountId: accountId,
                accountToken: accountToken,
                showPrice: showPrice,
            })
            .toPromise();
    }
    async downloadSavedOrderAsPDF(
      orderId: string,
      showPrice: string
    ): Promise<Blob> {
      return await this.api
        .getApiDataUrlBlob('v2', 'downloadSavedOrderAsPDF', {
          orderId: orderId,
          showPrice: showPrice,
        })
        .toPromise();
    }

    getDTOrderDetail(
        orderId: string
    ): Observable<ApiResponse<DTOrderDetailResponse>> {
        const request = { orderId: orderId };
        const dtResponse = this.api.getApiObservable<ApiResponse<DTOrderDetailResponse>>
        ('v2', 'getDTOrderDetail', request);
        return dtResponse;
    }
}

export interface Response {
    messages: Message[];
    messageCode: number;
    success: boolean;
}
export interface Message {
    type: string;
    value: string;
    code: string;
}

export interface SetAlertResponse {
    messageCode: string;
    message: string;
}
