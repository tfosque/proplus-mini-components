import { Injectable } from '@angular/core';
import { CommercialDataSet } from '../_demoDataSet/dataSet';
import { ShoppingCartService } from '../../pro-plus/services/shopping-cart-service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { OrderReviewStore, createOrderReviewStore } from '../../pro-plus/pages/order-review/order-review-store';
import { AccountBranch } from '../../pro-plus/model/get-current-user-response-v2';
import { ProPlusApiBase } from '../../pro-plus/services/pro-plus-api-base.service';

@Injectable( {
    providedIn: 'root',
} )
export class CommercialService {
    jobAccountData: any[] = [];
    sampleDataSet: any[] = [];
    /*  */
    orderDetails: any = { cart: {}, shipping: {} };
    public readonly cart = new BehaviorSubject<any>( {
        atgOrderId: null,
        summary: null,
        subTotal: 0,
        items: [],
    } );
    public shipping_ = new BehaviorSubject<any>( {} );
    public shipping$ = this.shipping_.asObservable();
    public orderItems_ = new BehaviorSubject<any[]>( [] );
    public orderItems$ = this.orderItems_.asObservable();

    public job_ = new BehaviorSubject<any[]>( [] );
    public job$ = this.job_.asObservable();

    public orderReviewStore: OrderReviewStore = createOrderReviewStore();
    uploadedFiles: string[] = [];
    itemDataResponse: any | null = null;

    constructor(
        private readonly cartService: ShoppingCartService,
        private readonly api: ProPlusApiBase
    ) {
        this.sampleDataSet = CommercialDataSet;
    }

    setOrderItems( items: any ) {
        if ( this.orderItems_.getValue().length > 0 ) {
            this.orderItems_.next( this.orderItems_.getValue().concat( items ) );
        } else {
            this.orderItems_.next( [items] );
        }
    }
    setShippingInfo( shippingInfo: ShippingInfo ) {
        this.shipping_.next( shippingInfo );
    }
    setJobAccount( job: any ) {
        this.job_.next( job );
    }
    removeOrderItem( item: any ) {
        let orderItems: any = [];
        this.orderItems$.subscribe( ( items: any ) => {
            orderItems.push( items );
        } );
        const filteredItems = this.orderItems_.getValue().filter( ( i: any ) => {
            return i.itemNumber !== item.itemNumber;
        } );

        this.orderItems_.next( filteredItems );
    }

    async updateCommercialOrderDetails() {
        await this.cartService.getCartsItems();
        this.cartService.getOrderShippingInfo();

        /* OBJECT */
        /*  const obj = {
       shipping: {},
       jobAccounts: [],
       manufacturer: [],
       jobType: [],
       summary: {}
     } */

        /* MULTI SUBSCRIPTION  */
        combineLatest(
            this.cartService.cart$.getState(),
            this.cartService.getCurrentOrderReview()
        ).subscribe( ( s: any ) => {
            const format = { cart: s[0], shipping: s[1] };
            this.orderDetails = format;
        } );
    }
    public updateJobAccounts(): void {
        const currOrder = this.sampleDataSet.filter( ( order: any ) => {
            // console.log( { order } );
            return order?.currentOrderReview;
        } );
        // console.log( { currOrder } );
        const accts =
            currOrder &&
            currOrder[0]?.currentOrderReview.poJob.jobAccounts.jobs;
        this.jobAccountData = accts;
    }

    async getCategoryComercialItems( reqInfo: CommercialItemsRequest ) {
        const req = {
            facetsFilter: reqInfo.facetFilter,
            accountId: reqInfo.accountId,
            cateFilter: reqInfo.cateFilter,
            filter: 'Carlisle SynTec',
            pageNo: 1,
            pageSize: 30,
            showSkuList: true,
        };
        const items = await this.api
            .getApiObservable<any>( 'v2', `itemlist`, req )
            .toPromise();
        return items;
    }

    async getCommercialItemPricing( itemNumberList: any ) {
        const req = {
            skuIds: itemNumberList,
        };
        const pricing = await this.api
            .getApiObservable<any>( 'v2', `pricing`, req )
            .toPromise();
        return pricing;
    }
}

export interface CommercialItemsRequest {
    cateFilter: string;
    accountId: number;
    facetFilter: string;
}

export interface CommercialItem {
    skuList: SkuList[];
    productId: string;
    productOnErrorImage: string;
    isAddedToFavorites: boolean;
    productName: string;
    url: any;
    internalProductName: string;
    baseProductName: string;
    productImage: string;
    productAdditionalOnErrorImage: string;
    shortDesc: any;
    categories: Category[];
    brand: string;
    longDesc: string;
    itemNumber: string;
    price?: number;
    uom?: string;
    qty?: number;
    isSelected?: boolean;
}

export interface SkuList {
    itemNumber: string;
    swatchImage: string;
    manufactureNumber?: string;
    variations: Variations;
    productNumber: string;
    isAddedToFavorites: boolean;
    skuShortDesc: any;
    itemImage: string;
}

export interface Variations {
    size: string[];
    thickness: string[];
    width: string[];
    length: string[];
}

export interface Category {
    facetId: string;
    categoryName: string;
    categoryId: string;
}

export interface ShippingInfo {
    shippingMethod: string;
    shippingOnHold: string;
    shippingAddress: Address;
    selectedPickupBranch: AccountBranch;
    job: Job;
    date: Date;
    time: string;
    specialInstructions: string;
}
interface Job {
    jobName: string;
    jobNumber: string;
}
interface Address {
    address1: string;
    address2: string;
    city: string;
    state: string;
    stateValue: string;
    zip: string;
    phone: string;
    nickName: string;
    firstName: string;
    lastName: string;
    countryValue: string;
}