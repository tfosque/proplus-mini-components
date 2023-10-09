import { Injectable } from '@angular/core';
import { ProPlusApiBase, ApiResponse } from './pro-plus-api-base.service';
import { Record, Static, String, Number, Union, Literal } from 'runtypes';
import { GetOrderApprovalDetailResponse } from './GetOrderApprovalDetailResponse';
import { BasicResponse } from './user.service';
import { UpdateItemRequest } from '../pages/saved-order-details/saved-order-details.component';
import { UpdateSavedOrderShippingInfoRequest } from './UpdateSavedOrderShippingInfoRequest';
import { SavedOrderReviewInfoResponse } from './SavedOrderReviewInfoResponse';
import { SavedOrderConfirmationResponse } from './SavedOrderConfirmationResponse';
import { BehaviorSubject } from 'rxjs';
import {
    ShippingInfoStore,
    createShippingStore,
} from '../stores/shipping-info-store';

export const SavedOrderSortFields = Union(
    Literal('displayName'),
    Literal('accountNumber'),
    Literal('createdUser'),
    Literal('submittedDate')
);
// const pendingOrder = {
//   sort: Union(
//     Literal('displayName'),
//     Literal('accountNumber'),
//     Literal('createdUser'),
//     Literal('submittedDate'),
//   ),
//   searchBy: Union(
//     Literal('displayName'),
//     Literal('accountNumber'),
//     Literal('createdUserEmail'),
//     Literal('submittedDate'),
//   )
// };

// const savedOrder = {
//   sort: Union(
//     Literal('displayName'),
//     Literal('accountNumber'),
//     Literal('lastModifiedDate'),
//     Literal('status'),
//     Literal('creationDate'),
//     Literal('submittedDate'),
//   ),
//   searchBy: Union(
//     Literal('displayName'),
//     Literal('accountNumber'),
//     Literal('creationDate'),
//     Literal('createdUser.name'),
//     Literal('createdUser.email'),
//     Literal('lastModifiedDate'),
//     Literal('lastModifiedUser.name'),
//     Literal('lastModifiedUser.email'),
//     Literal('submittedDate'),
//     Literal('submittedUser.name'),
//     Literal('submittedUser.email'),
//   ),
// };

const GetOrderApprovalListRequest = Record({
    status: Union(
        Literal('READY_FOR_APPROVAL'),
        Literal('READY_FOR_SUBMISSION'),
        Literal('REJECTED_ORDER')
    ),
    approverId: String,
    currentPage: Number,
    pageSize: Number,
    searchBy: String, // Union(Literal('displayName')),
    searchTerm: String,
    sortBy: String, // SavedOrderSortFields,
    sortType: Union(Literal('asc'), Literal('desc')),
});

export type GetOrderApprovalListRequest = Static<
    typeof GetOrderApprovalListRequest
>;

type GetOrderApprovalListRequestHttp = {
    [key in keyof GetOrderApprovalListRequest]: string;
};

@Injectable({
    providedIn: 'root',
})
export class SavedOrdersService {
    // Track savedOrderListCnt global state
    private readonly savedOrderListCnt = new BehaviorSubject<number>(0);
    public savedOrderListCnt$ = this.savedOrderListCnt.asObservable();
    private readonly savedOrderStores = new Map<string, ShippingInfoStore>();
    constructor(private readonly api: ProPlusApiBase) {}
    public getOrderApprovalDetail(orderId: string) {
        const editable = false;
        return this.api.getApiObservable<
            ApiResponse<GetOrderApprovalDetailResponse>
        >('v2', 'getOrderApprovalDetail', { orderId, editable });
    }

    public async getOrderApprovalDetailPromise(
        orderId: string
    ): Promise<ApiResponse<GetOrderApprovalDetailResponse>> {
        const editable = false;
        const { ok, body } = await this.api.getV2<
            ApiResponse<GetOrderApprovalDetailResponse>
        >('getOrderApprovalDetail', { orderId, editable });
        if (!ok || !body) {
            throw new Error('Failed to submit quote');
        }
        return body;
    }

    public async saveOrder(
        request: SavedOrderRequest
    ): Promise<SavedOrderResponse> {
        const { ok, body } = await this.api.postV2<SavedOrderResponse>(
            'saveOrder',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to save order');
        }
        return body;
    }

    public async getStoreFromOrderNo(orderNo: string) {
        //  If the store is already in the map, return it
        if (this.savedOrderStores.has(orderNo)) {
            return this.savedOrderStores.get(orderNo);
        }
        //  If the store is not in the map, create it and return it
        const store = createShippingStore();
        this.savedOrderStores.set(orderNo, store);
        return store;
    }

    updateSavedOrderListCnt(cnt: number) {
        this.savedOrderListCnt.next(cnt);
    }

    async updateSaveOrderItems(
        request: UpdateItemRequest
    ): Promise<any | null> {
        // console.log('updateSavedOrderItems', { request });

        const { ok, body } = await this.api.postV2<any>(
            'updateSavedOrderItems',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to update');
        }
        return body;
    }

    public getShippingInfo(orderId: string) {
        return this.api.postApiObservable<
            ApiResponse<SavedOrderShippingResponse>
        >('v2', 'getSavedOrderShippingInfo', { orderId });
    }

    public getSavedOrderReviewInfo(orderId: string) {
        return this.api.postApiObservable<
            ApiResponse<SavedOrderReviewInfoResponse>
        >('v2', 'getSavedOrderReviewInfo', { orderId });
    }

    public getOrderApprovalList(req: Partial<GetOrderApprovalListRequest>) {
        const queryParameters = {};

        if (req.sortBy === 'action') {
            req.sortBy = 'displayName';
        }

        let statusValue = req.status || '';
        if (req.searchBy === 'status') {
            if (req.searchTerm === 'READY_FOR_SUBMISSION') {
                statusValue = 'READY_FOR_SUBMISSION';
            } else if (req.searchTerm === 'REJECTED_ORDER') {
                statusValue = 'REJECTED_ORDER';
            } else if (req.searchTerm === 'READY_FOR_APPROVAL') {
                statusValue = 'READY_FOR_APPROVAL';
            }
        }

        const requestBody: GetOrderApprovalListRequestHttp = {
            status: statusValue,
            approverId: req.approverId || '',
            currentPage: req.currentPage
                ? (req.currentPage + 1).toString()
                : '1',
            pageSize: req.pageSize ? req.pageSize.toString() : '20',
            searchBy: req.searchBy || 'displayName',
            searchTerm: req.searchBy === 'status' ? '' : req.searchTerm || '',
            sortBy: req.sortBy || 'submittedDate',
            sortType: req.sortType || 'desc',
        };

        return this.api.postApiObservable<
            ApiResponse<GetOrderApprovalListResponse>
        >('v2', 'getOrderApprovalList', requestBody, queryParameters);
    }

    public async deleteSavedOrder(id: string): Promise<BasicResponse> {
        // console.log('deleteSavedOrder', { id });

        const { ok, body } = await this.api.postV2<BasicResponse>(
            'deleteSavedOrder',
            { id }
        );
        if (!ok || !body) {
            throw new Error('Failed to delete saved order');
        }
        return body;
    }

    public async deleteOrderRelatedDocuments(req: any): Promise<BasicResponse> {
        // console.log('deleteSavedOrder', { id });

        const { ok, body } = await this.api.postV2<BasicResponse>(
            'deleteOrderRelatedDocuments',
            req
        );
        if (!ok || !body) {
            throw new Error('Failed to delete saved order');
        }
        return body;
    }

    async downloadOrderRelatedDocument(
        orderId: string,
        documentName: string
    ): Promise<Blob> {
        return await this.api
            .getApiDataUrlBlob('v2', 'downloadOrderDocument', {
                orderId: orderId,
                documentName: documentName,
            })
            .toPromise();
    }

    public async updateSavedOrderShippingInfo(
        req: UpdateSavedOrderShippingInfoRequest
    ) {
        if (req.deliveryOption === 'onHold') {
            req.deliveryDate = '';
            req.deliveryTime = '';
        }
        const { ok, body } = await this.api.postV2<ApiResponse<unknown>>(
            'updateSavedOrderShippingInfo',
            req
        );
        if (!ok || !body) {
            throw new Error('Failed to update shipping info for saved order');
        }
        return body;
    }

    public async submitSavedOrder(req: SubmitSavedOrderRequest) {
        const { ok, body } = await this.api.postV2<ApiResponse<unknown>>(
            'submitSavedOrder',
            req
        );
        if (!ok || !body) {
            throw new Error('Failed to submit order');
        }
        return body;
    }

    public async uploadOrderRelatedDocuments(
        req: UploadRelatedDocuments
    ): Promise<BasicResponse> {
        const formData = new FormData();
        formData.append('orderId', req.orderId);
        formData.append(
            'relatedDocuments',
            req.relatedDocuments.blob,
            req.relatedDocuments.filename
        );
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'uploadOrderRelatedDocuments',
            formData
        );
        if (!ok || !body) {
            throw new Error('Failed to upload documents');
        }
        return body;
    }

    public async approveSavedOrder(req: ApproveSavedOrderRequest) {
        const { ok, body } = await this.api.postV2<ApiResponse<unknown>>(
            'approveSavedOrder',
            req
        );
        if (!ok || !body) {
            throw new Error('Failed to submit order');
        }
        return body;
    }

    public async saveOrderValidate(id: string) {
        const { ok, body } =
            await this.api.getV2NoErrThrow<saveOrderValidateResponse>(
                'saveOrderValidate',
                { id }
            );
        if (!ok || !body) {
            throw new Error('Failed to validate the order');
        }
        return body;
    }

    public approver() {
        return this.api.getApiObservable<Approver[]>('v2', 'approver', {});
    }

    public getSavedOrderConfirmationInfo(req: { id: string }) {
        return this.api.postApiObservable<
            ApiResponse<SavedOrderConfirmationResponse>
        >('v2', 'getSavedOrderConfirmationInfo', req);
    }

    public async rejectSavedOrder(req: RejectSavedOrderRequest) {
        const { ok, body } = await this.api.postV2<RejectSavedOrderResponse>(
            'rejectSavedOrder',
            req
        );
        if (!ok || !body) {
            throw new Error('Failed to reject pending order');
        }
        return body;
    }

    public async updateSavedOrderReviewInfo(
        req: UpdateSavedOrderReviewInfoRequest
    ) {
        const { ok, body } = await this.api.postV2<
            ApiResponse<RejectSavedOrderResponse>
        >('updateSavedOrderReviewInfo', req);
        if (!ok || !body) {
            throw new Error('Failed to update review info for saved order');
        }
        return body;
    }
}

export interface Approver {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface ApproveSavedOrderRequest {
    apiSiteId?: string;
    orderId: string;
    po: string;
    jobName: string;
    jobNumber: string;
    additionalRecipients: string[];
}

export interface SubmitSavedOrderRequest {
    orderId: string;
    approverId: string | null;
    po: string;
    jobName: string;
    jobNumber: string;
    additionalRecipients: string[];
}

export interface SavedOrderRequest {
    savedOrderName: string;
    po: string;
    jobName: string;
    jobNumber: string;
    additionalRecipients: string[];
}

export interface SavedOrderShippingResponse {
    id: string;
    displayName: string;
    siteId: string;
    organizationId: string;
    accountNumber: string;
    contactInfo: ContactInfo;
    creationDate: string;
    createdUser: string;
    submittedDate: string;
    lastModifiedDate: string;
    lastModifiedUser: string;
    assignApproval: AssignApproval;
    assignApprovalDisplayText: string;
    submitApproval: string;
    deleteStatus: boolean;
    job: Job;
    jobAccounts: JobAccounts;
    approvedBy: string;
    po: string;
    emailAddress: string[];
    deliveryOption: string;
    deliveryOptions: SavedDeliveryOption[];
    deliveryDate: string;
    deliveryTime: string;
    deliveryTimes: SavedDeliveryOption[];
    shippingMethod: string;
    shippingMethodValue: 'Pick_up' | 'Ship_to' | null;
    shippingMethods: SavedDeliveryOption[];
    shippingAddressTitle: string;
    shippingAddress: ShippingAddress;
    branchName: string;
    branchAddress: BranchAddress;
    instructions: string;
    commerceItems: CommerceItem[];
    status: string;
    statusDisplayName: string;
    mincronId: string;
    itemsTotal: number;
    taxes: number;
    otherCharges: number;
    subTotal: number;
    addressBooks: AddressBook[];
    addressBook: AddressBook;
    storeLocatorItemId: string;
    rejectReason: string;
    rejectUserDisplayText: string;
    rejectUser: AssignApproval;
    showDeliveryNotification: boolean;
    accountBranchState: string;
    deliveryOptionValue: 'onHold' | 'scheduled' | null;
    expressDeliveryTimes: SavedDeliveryOption[];
}

export interface SavedOrderResponse {
    messages: Message[];
    result: SavedOrderResult;
    success: boolean;
}

export interface SavedOrderResult {
    savedOrderId: string;
    successUrl?: string;
}

interface saveOrderValidateResponse {
    messages: Message[] | null;
    result: any;
    success: boolean;
}

interface AddressBook {
    id: string;
    displayName: string;
    shippingAddress: ShippingAddress;
    contactInfo: ContactInfo;
}
export interface UploadRelatedDocuments {
    orderId: string;
    relatedDocuments: {
        blob: Blob;
        filename: string;
    };
}
interface CommerceItem {
    id: string;
    imageUrl: string;
    imageOnErrorUrl: string;
    thumbImageUrl: string;
    pdpUrl: string;
    description: string;
    itemNumber: string;
    price: number;
    quantity: number;
    uom: string;
    subTotal: number;
    deleteStatus: boolean;
    vendorColorId: string;
    productId: string;
    itemGrayOutLevel: string;
}

interface BranchAddress {
    displayName: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    stateValue: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
}

export interface ShippingAddress {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    states: SavedDeliveryOption[];
    postalCode: string;
    country: string;
}

export interface SavedDeliveryOption {
    displayName: string;
    value: string;
    selected: boolean;
}

interface JobAccounts {
    unavailable: boolean;
    unavailableMsg: boolean;
    jobs: Job[];
}

interface Job {
    jobNumber: string;
    jobName: string;
    jobNameMandatory: boolean;
    jobNumberMandatory: boolean;
    jobNumberDisplayName: string;
}

interface AssignApproval {
    id: string;
    name: string;
    email: string;
}

export interface ContactInfo {
    firstName: string;
    lastName: string;
    nickName: string;
    phoneNumber: string | null;
}

// export interface GetOrderApprovalListRequest {
//   approverId?: string;
//   currentPage?: number;
//   pageSize?: number;
//   searchBy?: 'displayName' | 'accountNumber' | 'createdUserEmail' | 'submittedDate';
//   searchTerm?: string;
//   sortBy?: 'displayName' | 'accountNumber' | 'createdUser' | 'submittedDate';
//   sortType?: 'asc' | 'desc';
//   status?: 'READY_FOR_APPROVAL' | 'READY_FOR_SUBMISSION' | 'REJECTED_ORDER';
// }

export interface GetOrderApprovalListResponse {
    pagination: Pagination | null;
    orders: ApprovalOrder[] | null;
}

export interface ApprovalOrder {
    id: string;
    mincronId: string | null;
    displayName: string;
    firstName: string;
    lastName: string;
    accountNumber: string;
    accountName: string;
    creationDate: string;
    createdUser: string;
    createdUserEmail: string;
    submittedDate: string | null;
    status: string;
    statusDisplayName: string;
    readOnly: boolean;
    lastModifiedDate: string | null;
    lastModifiedUserName: null | string;
    lastModifiedUser: string | null;
    submittedUser: string | null;
    submittedUserName: string | null;
    submittedUserEmail: string | null;
    message: string | null;
    messageMap: string | null;
    messageCode: null | unknown;
    accountNameOriginal: string | null;
}

export interface Pagination {
    // next: Next;
    // previous: Next;
    pageSize: number;
    currentPage: number;
    totalCount: number;
    // results: Result[];
}

export interface Next {
    available: boolean;
    label: string;
    page: number;
}

export interface Result {
    enable: boolean;
    page: number;
    currentPage: boolean;
    type: string;
}

export interface RejectSavedOrderRequest {
    rejectReason: string;
    orders: OrderID[];
}

interface OrderID {
    id: string;
}

interface RejectSavedOrderResponse {
    messages: Message[];
    result: any | null;
    success: boolean;
}

interface Message {
    code: string | null;
    key: string | null;
    type: string;
    value: string;
}

export interface UpdateSavedOrderReviewInfoRequest {
    orderId: string;
    po: string;
    jobName: string;
    jobNumber: string;
    additionalRecipients: string[];
}
