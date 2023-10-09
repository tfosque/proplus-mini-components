import { GetCurrentUserInfoResponseV2 } from './../../pro-plus/model/get-current-user-response-v2';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { UserService } from '../../pro-plus/services/user.service';
import { isPlatformBrowser } from '@angular/common';

interface EcommerceEvent {
    ecommerce: Ecommerce;
    event: string;
    eventCategory: string;
    eventAction: string;
    eventLabel?: any;
    eventValue?: any;
}

interface Event {
    event: string;
    eventCategory: string;
    eventAction: string;
    eventLabel?: any;
    eventValue?: any;
}

interface Ecommerce {
    add?: Action;
    purchase?: Action;
    checkout?: Action;
}

interface Action {
    actionField: ActionField;
    products: any[];
}

interface ActionField {
    action?: string;
    option?: string;
    id?: any;
    revenue?: number;
}

/*
  // TODO
  Are we able to capture and clean up special characters like registered and TM?
  Currently, they show as Timberline&regand HDZ&trade.
*/

@Injectable({
    providedIn: 'root',
})
export class AnalyticsService {
    isBrowser: boolean;

    constructor(
        private readonly userService: UserService,
        @Inject(PLATFORM_ID) platformId: string
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    /* Add To Cart */
    public addToCart(cartItems: AddToCartInput): void {
        console.log('addToCart;', cartItems);

        const addToCart: EcommerceEvent = {
            ecommerce: {
                add: {
                    actionField: {
                        action: 'cart',
                        option: '--TBD--',
                    },
                    products: cartItems.map((item) => {
                        return {
                            ...item,
                            variant: JSON.stringify(item.variant),
                        };
                    }),
                },
            },
            event: 'Transaction',
            eventAction: 'Add To Cart',
            eventCategory: 'Enhanced Ecommerce',
        };
        this.updateDataLayer(addToCart);
    }

    /* Proceed To Checkout */
    public proceedToCheckout(checkOutItems: ProceedToCheckoutInput): void {
        const proceedToCheckout: EcommerceEvent = {
            ecommerce: {
                checkout: {
                    actionField: {
                        action: 'checkout',
                        option: '--TBD--',
                    },
                    products: checkOutItems,
                },
            },
            event: 'begin_checkout',
            eventAction: 'Checkout Steps',
            eventCategory: 'Enhanced Ecommerce',
            eventLabel: 'Proceed to Checkout',
        };
        this.updateDataLayer(proceedToCheckout);
    }

    /* Order Review */
    public orderReview(orderItems: OrderReviewInput): void {
        // console.log('orderReview;', orderItems);
        const orderReview: EcommerceEvent = {
            ecommerce: {
                checkout: {
                    actionField: {
                        action: 'checkout',
                        option: '--TBD--',
                    },
                    products: orderItems,
                },
            },
            event: 'add_shipping_info',
            eventAction: 'Checkout Steps',
            eventCategory: 'Enhanced Ecommerce',
            eventLabel: 'Order Review',
        };
        this.updateDataLayer(orderReview);
    }

    /* Purchase - Place Order */
    public placeOrder(orderBody: PlaceOrderInput) {
        // console.log({ orderBody }, 'typeof', typeof orderBody);
        let orderHasSaved = false;

        if (orderBody.orderNumber) {
            orderHasSaved = true;
        }
        if (orderHasSaved) {
            const placeOrder: EcommerceEvent = {
                ecommerce: {
                    purchase: {
                        actionField: {
                            id: orderBody.orderNumber,
                            revenue: parseInt(
                                orderBody.revenue.replace(/\$/g, ''),
                                10
                            ),
                        },
                        products: orderBody.products, // TODO items from both pceed2chkout & place order!
                    },
                },
                event: 'purchase',
                eventAction: 'Purchase',
                eventCategory: 'Enhanced Ecommerce',
                eventLabel: orderBody.orderNumber,
                eventValue: parseInt(orderBody.revenue.replace(/\$/g, ''), 10),
            };
            if (placeOrder.ecommerce.purchase) {
                this.updateDataLayer(placeOrder);
            }
        }
    }
    public onboarding(eventStep: number, prevStep: number): void {
        // LABELS Step Titles, added 'Done' as the last label for analytics to capture
        const labels = [
            'Login',
            'Search for Materials',
            'Access Order History',
            'Access Templates',
            'Done',
        ];

        const product_tour: Event = {
            event: 'Homepage Product Tour',
            eventAction: labels[prevStep],
            eventCategory: 'Product Tour',
            eventLabel: labels[eventStep],
        };
        this.updateDataLayer(product_tour);
    }

    public userData(user: any, permissions?: any) {
        if (!user || !this.isBrowser) return;

        const accountBranch = user.accountBranch;
        const userInfo = {
            user: {
                actionField: {
                    email: user.email || null,
                    userId: user.profileId,
                    internalUser: user.internalUser,
                    reportingDivision:
                        (accountBranch && accountBranch.companyName) || null,
                    reportingRegion:
                        (accountBranch && accountBranch.divisionName) || null,
                    branch: `${user.accountBranch.branchNumber} - ${user.accountBranch.branchName}`,
                    role: user.roleType,
                    joinDate: user.firstLoggedInDate,
                    lastLogin: user.lastActivity
                },
            },
        };

        (<any>window).dataLayer.push(userInfo);

        if (permissions) {
            const permissionsInfo = {
                permissions: {
                    actionField: {
                        permissions: permissions,
                    },
                },
            };

            (<any>window).dataLayer.push(permissionsInfo);
        }

        const user_login: Event = {
            event: 'Session Start',
            eventAction: 'Start Session',
            eventCategory: 'Users',
            eventLabel: 'Session',
        };
        this.updateDataLayer(user_login);
    }

    public async logUser() {
        const permissions = await this.userService.getCurrentUserPermission();
        this.userService
            .getCurrentUserInfo()
            .then((userInfo: GetCurrentUserInfoResponseV2 | null) => userInfo)
            .then((results: GetCurrentUserInfoResponseV2 | null) => {
                if (results) {
                    this.userData(results, permissions);
                }
            });
    }

    clearDatalayer(): void {
        if (!this.isBrowser) return;
        (<any>window).dataLayer = [];
    }

    /* Push to DataLayer */
    private updateDataLayer(ecommerceEvent: EcommerceEvent | Event): void {
        if (!this.isBrowser) return;
        this.updateUserData();
        (<any>window).dataLayer.push(ecommerceEvent);
    }
    updateUserData(){
      const user = this.userService.session.sessionInfo;
      if(!user) return;
      const userInfo = {
        user: {
          actionField: {
            email: user.email || null,
            userId: user.profileId,
            internalUser: user.internalUser,
            reportingDivision:
                (user.accountBranch && user.accountBranch.companyName) || null,
            reportingRegion:
                (user.accountBranch && user.accountBranch.divisionName) || null,
            branch: `${user.accountBranch?.branchNumber } - ${user.accountBranch?.branchName}`,
          },
        },
      };
      (<any>window).dataLayer.push(userInfo);
    }
}



type PlaceOrderInput = {
    orderNumber: string;
    revenue: string;
    products: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        variant: null;
    }[];
};

type ProceedToCheckoutInput = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    variant: null;
}[];

type OrderReviewInput = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    variant: null;
}[];

export type AddToCartInput = {
    id: string;
    name: string | null;
    price: string | number | undefined;
    quantity: number;
    variant: Record<string, string> | null;
}[];
