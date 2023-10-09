import { PendingOrdersService } from './../../services/pending-orders.service';
// import { SavedOrdersService } from './../../services/saved-orders.service';
import { Component, OnInit } from '@angular/core';
import { UserDetailInfo, UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CurrentUser } from '../../model/get-current-user-response';
import { Observable } from 'rxjs';
import { ProPlusApiBase } from '../../services/pro-plus-api-base.service';
import { map } from 'rxjs/operators';
import { AccountDetails } from '../../model/account-with-branch';

@Component( {
    selector: 'app-proplus-master-page',
    templateUrl: './proplus-master-page.component.html',
    styleUrls: ['./proplus-master-page.component.scss'],
} )
export class ProplusMasterPageComponent implements OnInit {
    public account?: CurrentUser;
    isInternalUser = false;
    showAccounts = true;
    menuList: MenuItem[] | null = null;
    menuItems$!: Observable<MenuItem[]>;
    menuItemsWithoutAcct$!: Observable<MenuItem[]>;
    accountItems$!: Observable<AccountDetails[]>;
    userDetails: UserDetailInfo | null = null;
    constructor(
        public readonly router: Router,
        public user: UserService,
        private readonly api: ProPlusApiBase,
        private readonly pendingOrderService: PendingOrdersService
    ) {
        this.menuItems$ = this.api.userSession.pipe(
            map( ( x ) => this.getMenuList() )
        );
        this.menuItemsWithoutAcct$ = this.api.userSession.pipe(
            map( ( x ) => this.getMenuListWithoutAcct() )
        );
    }

    getPageListWithMasterPage() {
        return [
            'profile',
            'addressBook',
            'accounts',
            'templates',
            'saved-orders',
            'pending-orders',
            'user-admin',
            'tracking-settings',
            'template-tour',
        ];
    }

    async getInternalUser() {
        const userInfo = await this.user.getCurrentUserInfo();
        if ( !userInfo ) {
            throw new Error( 'no user info' );
        }
        return userInfo.internalUser;
    }

    isReload( url: string ) {
        let currentUrl = window.location.pathname;
        if ( currentUrl === url ) {
            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            this.router.onSameUrlNavigation = 'reload';
        }
    }

    public get isApprover() {
        return this.user.permissions.order.approve;
    }

    public get sessionInfo() {
        return this.user.sessionInfo;
    }

    public get isLoggedIn() {
        return this.user.isLoggedIn;
    }

    public get userPermPlaceOrder() {
        return (
            this.user.permissions.order.submit ||
            this.user.permissions.order.submitForApproval
        );
        // Incorrect logic
        /* if (this.permissions && this.permissions.order) {
            /*   if (
                  this.permissions.order.submit ||
                  this.permissions.order.submitForApproval
              ) {
                  return true;
              } else {
                  return false;
              } */
    }
    public getMenuList() {
        const currentAccountId = this.user.accountIdInString;
        const sessionInfo = this.sessionInfo;
        if ( sessionInfo ) {
            this.isInternalUser =
                sessionInfo.internalUser === false ? false : true;
        }

        let menu: SideMenuItem[] = [
            {
                icon: 'person',
                title: 'My Profile',
                links: ['/proplus', 'profile'],
                enabled: true,
            },
            {
                icon: 'lock',
                title: 'Change Password',
                links: ['/proplus', 'profile/change-password'],
                enabled: true,
            },
            {
                icon: 'book',
                title: 'Address Book',
                links: ['/proplus', 'addressBook'],
                enabled: true,
            },
            {
                icon: 'account_balance',
                title: 'Accounts',
                links: ['/proplus', 'accounts'],
                enabled: this.accountList.length > 1,
            },
            // { icon: 'shopping_cart', title: 'Shopping Cart', links: ['/proplus', 'shopping-cart'] },
            {
                icon: 'list',
                title: 'Order History',
                links: ['/proplus', 'accounts', currentAccountId, 'orders'],
                enabled: this.user.permissions.orderhistory.queryList,
            },
            {
                icon: 'attach_money',
                title: 'Quotes',
                links: ['/proplus', 'accounts', currentAccountId, 'quotes'],
                enabled: true,
            },
            {
                icon: 'check_circle_outline',
                title: 'Templates',
                links: ['/proplus', 'templates'],
                enabled: true,
            },
            {
                icon: 'reorder',
                title: 'Saved Orders',
                links: ['/proplus', 'saved-orders'],
                enabled: true,
            },
            {
                icon: 'pending',
                title: 'Pending Orders',
                links: ['/proplus', 'pending-orders'],
                enabled: this.isApprover,
            },
            {
                icon: 'business',
                title: 'User Administration',
                links: ['/proplus', 'user-admin'],
                enabled: this.user.session.isAdminOrMaster,
            },
            {
                icon: 'my_location',
                title: 'Delivery Tracking Settings',
                links: ['/proplus', 'tracking-settings'],
                enabled: true,
            },
        ];

        const menuList = menu
            .filter( ( m ) => m.enabled )
            .map( ( m ) => {
                const { title, links, icon } = m;
                const link = links.join( '/' );
                return {
                    title: title,
                    link: link,
                    icon: icon,
                };
            } );
        return menuList;
    }

    public getMenuListWithoutAcct() {
        const menuItems = this.getMenuList();
        return menuItems.filter( ( i ) => i.title !== 'Accounts' );
    }

    async ngOnInit() {
        // fetch approver TODO Refactor to getter
        const response = await this.user.getSessionInfo();
        const session = this.user.session;
        if ( session.tag !== 'loggedIn' ) {
            return;
        }
        if ( response ) {
            if ( !this.isLoggedIn ) {
                return;
            }
            this.account = response;
        } else {
            return;
        }
    }

    get permissions() {
        return this.user.session.permissions;
    }
    get accountList() {
        return this.user.session.accountList;
    }

    isMaterPageNeeded() {
        const pageList = this.getPageListWithMasterPage();
        if ( pageList.some( ( p ) => this.router.url.includes( `/proplus/${p}` ) ) ) {
            return true;
        } else {
            return false;
        }
    }

    async logout() {
        try {
            await this.pendingOrderService.resetOrdersApproverInfo();
            await this.user.logout();
            await this.router.navigate( ['/'] );
        } catch ( error ) {
            await this.router.navigate( ['/'] );
        }
    }

    trackByIndex( index: any, item: any ) {
        return index;
    }

    isLinkActive( link: string ) {
        return this.router.url.includes( link );
    }
}

export interface MenuItem {
    icon: string;
    title: string;
    link: string;
}

interface SideMenuItem {
    icon: string;
    title: string;
    links: ( string | number | null )[];
    enabled: boolean;
}
