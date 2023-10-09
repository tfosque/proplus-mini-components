import { ProductsService } from './../../pro-plus/services/products.service';
import { Component, OnInit } from '@angular/core';
import { ProPlusApiBase } from '../../pro-plus/services/pro-plus-api-base.service';
import { LocationsService } from '../../services/locations.service';
import {
    ShoppingCartService,
    SubmitCurrentOrderResponse,
    SubmitOrderResult,
} from '../../pro-plus/services/shopping-cart-service';

@Component({
    selector: 'app-diagnostics-page',
    templateUrl: './diagnostics-page.component.html',
    styleUrls: ['./diagnostics-page.component.scss'],
})
export class DiagnosticsPageComponent implements OnInit {
    info: any;
    typeAhead = '';
    accountId: number | null;

    testValue = 5;
    // private allInfo: Promise<AllUserInfo>;

    public selectedProduct = {
        productId: 'C-046880',
        brand: 'Test',
    };
    selectedItem: unknown;
    // private readonly number = new BehaviorSubject([1, 2, 3, 4, 5]);
    // public readonly sum: Observable<number>;

    constructor(
        public readonly api: ProPlusApiBase,
        // private readonly userService: UserService,
        public readonly locationsService: LocationsService,
        private readonly productService: ProductsService,
        private readonly cartService: ShoppingCartService // private readonly quoteService: QuoteService,
    ) {
        this.accountId = this.api.userSession.value.accountId;
        // this.info = this.init();
        // this.sum = this.number.pipe(map(nums => nums.reduce(((x, y) => x + y), 0)));
        this.cartService.getOrderShippingInfo();
        // this.info = this.cartService.orderShippingInfo.state$;

        // this.
        // o31593229
        // this.info = this.cartService.getSubmitOrderResult('o31593229', '');
        // this.info = this.cartService.getCurrentOrderReview();
    }

    ngOnInit() {
        this.cartService.cart$.dispatch
            .setOrderResponse(this.returnAPICartDataSubmitCurrentOrder())
            .setSubmitOrderResult(this.returnAPICartData());

        // this.info = this.getInfo();
    }

    returnAPICartDataSubmitCurrentOrder(): SubmitCurrentOrderResponse {
        return {
            jobName: 'SHOP ACCOUNT',
            additionalRecipients: null,
            instructions: 'TEST ORDER DONT PROCESS',
            approverEmail: null,
            deliveryTime: null,
            approverLastName: null,
            nextPage: {
                nextUrl: '/checkout/orderConfirmation?inPipeline=true',
            },
            shippingMethod: 'Pick_up',
            orderSummary: {
                total: 0,
                displayTotalMsg: true,
                totalMsg: 'Will be calculated at the time of invoicing.',
            },
            poName: null,
            approverFirstName: null,
            shippingAddress: {
                country: null,
                lastName: null,
                address3: null,
                address2: '14200 E MONCRIEFF PLACE',
                city: 'AURORA',
                address1: 'BEACON BUILDING PRODUCTS',
                nickName: null,
                postalCode: '80011-1647',
                branchName: 'DENVER HUB BRANCH',
                states: null,
                firstName: null,
                phoneNumber: '7203029965',
                state: 'Colorado',
            },
            deliveryDate: null,
            deliveryOption: 'onHold',
            items: [
                {
                    commerceItemId: 'ci2757004386',
                    itemFromQuote: false,
                    productImageUrl: '/images/large/455018_default_thumb.jpg',
                    productOnErrorImageUrl:
                        'https://beaconproplus.com/images/default_not_found.jpg',
                    unitPrice: 0,
                    uom: 'BDL',
                    quantity: 1,
                    itemOrProductDescription:
                        'GAF 17" x 34-1/2" Camelot&reg; II Shingles Charcoal',
                    productId: 'C-455016',
                    totalPrice: 0,
                    vendorColorId: null,
                    catalogRefId: '455018',
                    url:
                        '/productDetail/C-455016?skuId=455018&Color=Charcoal&Dimension=17%22+x+34-1%2F2%22',
                },
            ],
            jobNumber: 'SHOP',
        };
    }

    returnAPICartData(): SubmitOrderResult {
        return {
            orderNumber: 'F123456',
            ATGFailedStatus: null,
            mincronResponseError: false,
            orderHistoryListLinkUrl:
                '/myAccount/orderHistory?activeTab=orderHistory&cleanSearchOpt=true',
            ATGOrderError: false,
            orderNumberTips: null,
            state: 'SUBMITTED',
            orderHistoryDetailLinkUrl: null,
            orderConfirmationTips: 'Your Order Is Being Processed',
        };
    }

    async init() {
        const prodId = 'C-619770';
        const prod = await this.productService.getItemDetails({
            productId: prodId,
        });

        if (!prod) {
            return 'No product';
        }

        const currentUOM = prod.currentSKU.currentUOM;

        const userSession = this.api.userSession.value;
        const accountId = userSession.accountId;
        if (!accountId) {
            return 'No accounnt';
        }

        const prices = await this.productService.getManyPricing(['619770']);

        return {
            currentUOM,
            prod,
            prices,
            userSession,
        };
    }

    // doubleIt() {
    //   this.number.next(this.number.value.map(n => n * 2));
    // }

    // async getTypeAhead() {
    //   if (sessionInfo.accountId === null) { throw new Error('No Account'); }
    //   const accountId = sessionInfo.accountId.toString();
    //   const filter = 'gaf';
    //   const params = {
    //     accountId,
    //     filter
    //   };
    //   return this.productService.getTypeAhead(params);
    // }

    setSkuSelected(item: unknown) {
        this.selectedItem = item;
    }
    getInfo() {
        // const quote = this.quoteService.getQuoteOrder('qo2400006');
        // console.log(quote);

        // const quoteOrder = quote.getQuoteOrder();
        // const cartDetail = quote.getCartDetail();
        // const atgQuote = quote.getAtgQuoteDetail();
        // const mincron = atgQuote.then(q => q && quote.getMincronQuoteDetail(q.mincronId) || null);
        //  https://uat-static.becn.digital/becn/rest/model/REST/NewRestService/v2/rest/com/becn/getQuoteOrderDetail?orderId=qo2400006

        return {
            x: 5,
            // quoteOrder,
            // cartDetail,
            // mincron,
            // atgQuote
            // number: this.number
        };

        // const locationPicker = new LocationPicker(this.locationsService);

        // // tslint:disable-next-line: no-floating-promises
        // locationPicker.setZipCode('07013');

        // const userInfo = await this.userService.getCurrentUserInfo();
        // const accountNo = (userInfo) ? parseInt(userInfo.lastSelectedAccount.accountLegacyId, 10) : 0;
        // const profileId = (userInfo) ? userInfo.profileId : '';
        // const email = (userInfo) ? userInfo.deliveryTrackingSettings.email : '';
        // return {
        //   name: 'Bub',
        //   items: [
        //     { name: 'Sue', position: 'Software' },
        //     { name: 'Steve', position: 'Software' },
        //     { name: 'Rambo', position: 'Software Dev' },
        //   ],
        //   first: getAfter(1000, 'First'),
        //   second: getAfter(2000, 'Second'),
        //   accountNo,
        //   profileId,
        //   email,
        //   userInfo: userInfo,
        //   // account: this.userService.getCurrentAccount(userInfo),
        //   userDetail: this.userService.getUserDetail(email),
        //   permissions: this.userService.getCurrentUserPermission(),
        //   locations: this.locationsService.getLocationsFromAddress({ address: '20170', range: 25 })

        //   // search1: this.getTypeAhead()
        //   // fail1: failAfter(1000, 'Oh noes!'),
        //   // userInfo: this.tryGetUserInfo(),
        //   // currentUser: this.userService.getCurrentUserInfo(),
        //   // accounts: this.userService.getAccounts(),
        //   // addressBooks: this.userService.getAddressBooks(),
        // };
    }

    tryGetUserInfo() {
        // try {
        return this.api.userSession;
        // const currentUser = await this.userService.getCurrentUserInfo();
        // if (!currentUser) { throw new Error('Failed to get user info'); }
        // const accounts = await this.userService.getAccounts();
        // if (!accounts) { throw new Error('Failed to get user accounts'); }
        // const activeAccount = this.userService.getCurrentAccount(currentUser, accounts);
        // if (!activeAccount) { throw new Error('Failed to get current account'); }
        // const addressBooks = await this.userService.getAddressBooks();
        // if (!addressBooks) { throw new Error('Failed to get address book'); }
        // const jobs = await this.userService.getUserJobs(currentUser.lastSelectedAccount.accountLegacyId);
        // if (!jobs) { throw new Error('Failed to get user jobs'); }
        // return { currentUser, accounts, activeAccount, addressBooks, jobs };
        // return currentUser;
        // } catch (err) {
        //   // console.error('tryGetUserInfo', err);
        //   return err;
        // }
    }
    // SubmitCurrentOrderResponse
}

// function getAfter<T>(
//   timeout: number,
//   x: T,
// ): Promise<T> {
//   return new Promise<T>((resolve, rej) => {
//     window.setTimeout(function () {
//       console.log('Got', x);
//       resolve(x);
//     }, timeout);
//   });
// }

// function failAfter<T>(
//   timeout: number,
//   x: T,
// ): Promise<T> {
//   return new Promise<T>((resolve, rej) => {
//     window.setTimeout(function () {
//       console.log('Failed', x);
//       rej(x);
//     }, timeout);
//   });
// }

// function makeObj(n: number) {
//   return {
//     quantity: n,
//     get inputQuantity() {
//       return this.quantity;
//     },

//     setInputQuantity(evt: InputEvent) {
//       const target = evt && evt.target;
//       if (!target) { return; }
//       if (target && target instanceof HTMLInputElement) {

//         let value = parseInt(target.value, 10);
//         if (isNaN(value)) {
//           value = 0;
//         }
//         const newValue = Math.min(Math.max(0, value), 999);

//         //  Updating the textbox with the fixed value
//         target.value = newValue.toString();
//         //  Updating the model
//         this.quantity = newValue;

//       }
//     },
//   };
// }
