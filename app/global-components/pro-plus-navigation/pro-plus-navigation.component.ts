import { OnboardingService } from './../../pro-plus/services/onboarding.service';
import { TemplateTourService } from './../../pro-plus/services/template-tour.service';
import { AnalyticsService } from '../../common-components/services/analytics.service';
import { PendingOrdersService } from './../../pro-plus/services/pending-orders.service';
import { ChatService } from './../../pro-plus/services/chat.service';
import { SpanishEnvironment } from './../../models/spanish-environment';
import { SpanishTranslationService } from './../../services/spanish-translation.service';

import {
    ProductsService,
    TypeAheadItem,
} from './../../pro-plus/services/products.service';
import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef,
    HostListener,
    OnDestroy,
    Inject,
    PLATFORM_ID,
    Optional,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '../../enums/breakpoints.enum';
import { Subscription, BehaviorSubject, Observable, from } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { NavigationStateService } from '../../services/navigation-state.service';
import { TranslationsPipe } from '../../pipes/translations.pipe';
import {
    convertHippoMenuItem,
    SiteMenuItem,
} from '../../misc-utils/utility-methods';
import { isPlatformBrowser } from '@angular/common';
import {
    UserDetailInfo,
    UserService,
} from '../../pro-plus/services/user.service';
import { AllPermissions } from '../../pro-plus/services/UserPermissions';
import { AccountSummary } from '../../pro-plus/model/account';
import { AccountDetails } from '../../pro-plus/model/account-with-branch';
import { ProPlusApiBase } from '../../pro-plus/services/pro-plus-api-base.service';
import { debounceTime, map, flatMap } from 'rxjs/operators';
import { ShoppingCartService } from '../../pro-plus/services/shopping-cart-service';
import he from 'he';
import { BrBaseComponent } from '../../core/BrBaseComponent';
import { DocumentData } from '../../../declarations';
import { BrPageComponent } from '@bloomreach/ng-sdk';

// Enums used to find the content for different sections in the hippo nav data.
enum cmsNavTitles {
    mainNavArea = 'Main Nav Area',
    utilityLinks = 'Utility Links',
    otherBeaconSites = 'Other Beacon Sites',
    logoLink = 'Logo Link',
    findAStoreLink = 'Find a Store',
}

interface TypeAhead {
    message?: string;
    items: ( TypeAheadItem & { link: string } )[];
}

interface NavItem {
    title: string;
    url: string;
    isExternal: boolean;
    megaMenu: {
        marketingBlock: {
            imageSrc?: string | null;
            title?: string;
            textContent?: string;
            isExternal?: boolean;
            btnUrl?: string;
            btnText?: string;
            primaryDocument?: any;
        } | null;
        megaMenuSections: {
            isMarketingBlock?: boolean;
            title?: string;
            links: {
                title: string;
                url: string;
                isExternal: boolean;
            }[];
        };
    };
}

@Component( {
    selector: 'app-pro-plus-navigation',
    templateUrl: './pro-plus-navigation.component.html',
    styleUrls: ['./pro-plus-navigation.component.scss'],
} )
export class ProPlusNavigationComponent
    extends BrBaseComponent
    implements OnInit, AfterViewInit, OnDestroy {
    configuration?: {
        siteMenuItems: SiteMenuItem[];
        [key: string]: any;
    };
    menuDocument?: DocumentData;
    searchTerm$ = new BehaviorSubject<string>( '' );
    isBrowser: boolean;

    @ViewChild( 'navContainer' ) navContainer?: ElementRef;
    @ViewChild( 'navItemContainer' )
    navItemContainer?: ElementRef;
    isOverflowing?: boolean;

    activeIndex = -1;
    activeNavItem?: HTMLElement | null;
    megaMenuHoriPosition?: number;
    isMegaMenuHover = false;

    myAccountCollapse = false;
    mySwitchAccountCollapse = false;
    myBranchCollapse = false;
    proPlusToolsCollapse = false;
    spanishRef = new BehaviorSubject<SpanishEnvironment>( {
        spanishUrl: '',
        englishUrl: '',
        showEnglishBtn: false,
        showSpanishBtn: false,
    } );

    // Constants used for mega menu behavior.
    private readonly _MEGA_MENU_PADDING_LEFT = 28;
    private readonly _HOVER_INTENT_DELAY = 400; // Amount to delay menu close

    mobileSearchActive = false;
    isMediumScreen = false;
    isLargeScreen = false;
    menuActive = false;

    layoutChangesMediumSub!: Subscription;
    layoutChangesLargeSub!: Subscription;

    // TODO: Replace with editable content
    logoSrc = '../../assets/images/beacon-logo-new.png';
    logoAltText?: string;
    logoUrl?: string;
    logoIsExternal?: boolean;
    searchText = this.translationsPipe.transform( 'Product Search', 'search' );
    findAStoreLink?: string;
    findAStoreText?: string;
    findAStoreIsExternal?: boolean;
    contactUs = this.translationsPipe.transform( 'Contact Us', 'contact-us' );
    contactNumber = this.translationsPipe.transform(
        '(703) 390-0450',
        'nav-contact-num'
    );

    utilityLinks?: {
        title: string;
        url: string;
        isExternal: boolean;
    }[];

    otherSiteLinks?: {
        title: string;
        url: string;
        isExternal: boolean;
    }[];
    accountList: AccountDetails[] = [];
    permissions?: AllPermissions;
    userDetails: UserDetailInfo | null = null;
    searchResults$: Observable<TypeAhead>;
    myAccountMenuItems$!: Observable<
        { icon: string; text: string; address: string }[]
    >;
    proToolsMenuItems$!: Observable<
        {
            text: string;
            externalUrl?: string;
            internalUrl?: string;
            newWindow?: boolean;
        }[]
    >;
    isAdminOrMaster = false;
    routerSub!: Subscription;
    cartCnt$ = new BehaviorSubject<number>( 0 );

    public get searchTerm() {
        return he.decode( this.searchTerm$.value );
    }

    public set searchTerm( newSearch: string ) {
        this.searchTerm$.next( newSearch );
    }

    public get account(): AccountSummary | null {
        return this.userService.lastSelectedAccount;
    }

    public get sessionInfo() {
        return this.userService.sessionInfo;
    }

    public get autoCompleteWidth() {
        return this.isLargeScreen ? 600 : 400;
    }

    currentSiteName = this.translationsPipe.transform(
        'Beacon',
        'current-site-name'
    );
    navItems: NavItem[] = [];
    public get isApprover() {
        return this.userService.permissions.order.approve;
    }

    public getMyAccountMenuItems(): AccountMenuItem[] {
        const isMasterOrAdmin = this.userService.session.isAdminOrMaster;
        let menuList: AccountMenuItem[] = [
            {
                icon: 'book',
                text: 'Address Book',
                address: '/proplus/addressBook',
                enabled: true,
            },
            {
                icon: 'account_balance',
                text: 'Accounts',
                address: '/proplus/accounts',
                enabled: this.accountList.length > 1,
            },
            {
                icon: 'person',
                text: 'Personal Profile',
                address: '/proplus/profile',
                enabled: true,
            },
            {
                icon: 'lock',
                text: 'Change Password',
                address: '/proplus/profile/change-password',
                enabled: true,
            },
            {
                icon: 'list',
                text: 'Saved Orders',
                address: `/proplus/saved-orders`,
                enabled: true, // If you can submit and submitForApproval then true (permissions.original['Place Order'])
            },
            {
                icon: 'pending',
                text: 'Pending Orders',
                address: `/proplus/pending-orders`,
                enabled: this.isApprover,
            },
            {
                icon: 'business',
                text: 'User Permission',
                address: '/proplus/user-admin',
                enabled: isMasterOrAdmin,
            },
            {
                icon: 'my_location',
                text: 'Delivery Tracking',
                address: '/proplus/tracking-settings',
                enabled: true,
            },
        ];

        return menuList.filter( ( m ) => m.enabled );
    }

    isReload( url: string | any[] ) {
        let currentUrl = window.location.pathname;
        if ( typeof url !== 'string' ) {
            url = '/' + url.join( '/' );
        }
        if ( currentUrl === url ) {
            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            this.router.onSameUrlNavigation = 'reload';
        } else {
            this.router.navigateByUrl( url );
        }
    }
    isReloadHomePage( url: string ) {
        let currentUrl = window.location.pathname;
        if ( currentUrl === url ) {
            window.location.reload();
        }
    }

    public getProToolsMenuItems() {
        const currentAccountId = this.userService.accountIdInString;
        let acctEVPurchaseStatus = false;
        const currentAccounts = this.accountList.filter(
            ( a ) => a.accountLegacyId === this.accountId
        );
        if ( currentAccounts.length > 0 ) {
            acctEVPurchaseStatus =
                currentAccounts[0].accountEagleViewPurchaseStatus || false;
        }
        type MenuItem = { text: string; enabled: boolean } & (
            | { externalUrl: string; newWindow?: boolean }
            | { internalUrl: string }
        );
        const menuItems: MenuItem[] = [
            {
                text: 'Promotion Tracker',
                internalUrl: '/proplus/rebate/landing',
                enabled: true,
            },
            {
                text: 'Online Bill Pay',
                externalUrl:
                    'https://secure.billtrust.com/beaconroofingsupply/ig/signin',
                newWindow: true,
                enabled: true,
            },
            {
                text: 'Perfect Order',
                internalUrl: '/proplus/perfect-order',
                enabled: false,
            },
            {
                text: 'Quotes',
                internalUrl: `/proplus/accounts/${currentAccountId}/quotes`,
                enabled: true,
            },
            {
                text: 'EagleView Report',
                internalUrl: '/proplus/eagle-view/order-report',
                enabled: !this.cashAccount && acctEVPurchaseStatus,
            },
            { text: 'Storm+', externalUrl: '/proplus/storms', enabled: true },
            {
                text: 'Beacon 3D Plus',
                externalUrl: '/proplus/hover/jobList',
                enabled: true,
            },
        ];
        return menuItems.filter( ( m ) => m.enabled );
    }

    public get userPermPlaceOrder() {
        return (
            this.userService.permissions.order.submit ||
            this.userService.permissions.order.submitForApproval
        );

        // Incorrect Logic
        /* if (this.permissions && this.permissions.order) {
            if (
                this.permissions.order.submit ||
                this.permissions.order.submitForApproval
            ) {
                return true;
            } else {
                return false;
            }
        } */
    }

    constructor(
        private readonly breakpointObserver: BreakpointObserver,
        private readonly router: Router,
        private readonly navigationStateService: NavigationStateService,
        private readonly translationsPipe: TranslationsPipe,
        private readonly userService: UserService,
        private readonly cartService: ShoppingCartService,
        private readonly productService: ProductsService,
        private readonly api: ProPlusApiBase,
        private readonly chatService: ChatService,
        private readonly pendingOrdersService: PendingOrdersService,
        private readonly analyticsService: AnalyticsService,
        private readonly onboardSvc: OnboardingService,
        private readonly templateTourService: TemplateTourService,
        private readonly spanish: SpanishTranslationService,
        @Inject( PLATFORM_ID ) platformId: string,
        @Optional() page?: BrPageComponent
    ) {
        super( page );
        this.isBrowser = isPlatformBrowser( platformId );

        const searchResults = this.searchTerm$.pipe(
            debounceTime( 500 ),
            flatMap( ( search ) => from( this.getTypeAhead( search ) ) ),
            map( ( results ) => {
                return results;
            } )
        );
        this.searchResults$ = searchResults;
    }

    async ngOnInit() {
        this.spanish.getSpanishEnviron();
        this.spanish.spanishRef$.subscribe( ( ref: SpanishEnvironment ) => {
            this.spanishRef.next( ref );
        } );

        this.cartService.cartCnt$.subscribe( val => {
            this.cartCnt$.next( val );
        } );

        // Prelaoding MenuItems here.....
        this.myAccountMenuItems$ = this.api.userSession.pipe(
            map( ( x ) => {
                return this.getMyAccountMenuItems();
            } )
        );

        this.getMenuConfiguration();
        const layoutChangesLarge$ = this.breakpointObserver.observe( [
            Breakpoints.large,
        ] );

        this.layoutChangesLargeSub = layoutChangesLarge$.subscribe( ( result ) => {
            this.isLargeScreen = result.matches ? true : false;
        } );

        const layoutChangesMedium$ = this.breakpointObserver.observe( [
            Breakpoints.medium,
        ] );

        this.layoutChangesMediumSub = layoutChangesMedium$.subscribe(
            ( result ) => {
                this.isMediumScreen = result.matches ? true : false;
            }
        );

        const permissions = await this.userService.getCurrentUserPermission();
        const accountResponse = await this.userService.getAccounts();
        const accountList = (
            accountResponse ? accountResponse.accounts : []
        ).map( ( a ) => {
            const newName = a.accountName
                ? a.accountName.replace( /\d+\s+\((.+)\)/, '$1' )
                : '';
            return { ...a, accountName: newName };
        } );

        accountList.sort( ( a, b ) =>
            `${a.accountName}`.localeCompare( `${b.accountName}` )
        );
        this.accountList = accountList;

        this.proToolsMenuItems$ = this.api.userSession.pipe(
            map( ( x ) => this.getProToolsMenuItems() )
        );

        this.routerSub = this.router.events.subscribe( ( e ) => {
            if ( e instanceof NavigationEnd ) {
                this.closeAllMenus();
            }
        } );

        this.permissions = permissions;
    }

    /* Override Onboard Trigger */
    onKeyPress( event: KeyboardEvent ) {
        const term = this.onboardSvc.triggerTerm;
        const templateTerm = this.templateTourService.triggerTerm;
        if ( this.searchTerm$.value === term ) {
            this.onboardSvc.autoTriggerOnboardEvent( true );
        } else if ( this.searchTerm$.value === templateTerm ) {
            // Redirect to template tour if search text is "templatetour"
            // and the screen size is not mobile screen
            if ( this.isMediumScreen || this.isLargeScreen ) {
                this.templateTourService.autoTriggerOnboardEvent( true );
                this.router.navigate( ['/proplus/template-tour'] );
            }
        }
    }

    ngOnDestroy() {
        this.layoutChangesMediumSub?.unsubscribe();
        this.layoutChangesLargeSub?.unsubscribe();
        this.routerSub?.unsubscribe();
    }

    ngAfterViewInit() {
        setTimeout( () => {
            this.checkIfOverflowing();
        } );
    }

    mySwitchAccountCollapseToggle( evt: MouseEvent ) {
        this.mySwitchAccountCollapse = !this.mySwitchAccountCollapse;
        evt.preventDefault();
    }

    myAccountCollapseToggle( evt: MouseEvent ) {
        this.myAccountCollapse = !this.myAccountCollapse;
        evt.preventDefault();
    }

    myBranchCollapseToggle( evt: MouseEvent ) {
        this.myBranchCollapse = !this.myBranchCollapse;
        evt.preventDefault();
    }

    proPlusToolsCollapseToggle( evt: MouseEvent ) {
        this.proPlusToolsCollapse = !this.proPlusToolsCollapse;
        evt.preventDefault();
    }

    async getTypeAhead( filter: string ): Promise<TypeAhead> {
        try {
            const sessionInfo = this.api.userSession.value;
            if ( sessionInfo.accountId === null ) {
                throw new Error( 'No Account' );
            }
            const accountId = sessionInfo.accountId.toString();
            if ( filter ) {
                const params = {
                    accountId,
                    filter,
                };
                const response = await this.productService.getTypeAhead( params );
                if ( response && response.result ) {
                    return {
                        items: response.result.items.map( ( i ) => ( {
                            ...i,
                            link: fixProductLink( i.searchTypeAheadLink ),
                        } ) ),
                    };
                } else {
                    return { items: [] };
                }
            } else {
                return { items: [] };
            }
        } catch ( error ) {
            return { message: 'No results available', items: [] };
        }
    }

    /**
     * Fire methods that check if the scroll indicator should be displayed
     */
    @HostListener( 'window:resize' )
    runIndicatorChecks() {
        if ( !this.isMediumScreen && !this.isLargeScreen ) {
            return;
        }
        setTimeout( () => {
            this.checkIfOverflowing();
            this.closeAllMenus();
        } );
    }

    /**
     * Runs a check to see if navItemContainer is currently overflowing the navContainer by comparing
     * the combinded widths.  Sets value of isOverflowing accordingly.
     */
    checkIfOverflowing() {
        if ( this.navContainer && this.navItemContainer ) {
            if (
                this.navItemContainer.nativeElement.offsetHeight >
                this.navContainer.nativeElement.offsetHeight
            ) {
                this.isOverflowing = true;
            } else if ( this.isOverflowing ) {
                this.isOverflowing = false;
            }
        }
    }

    /**
     * Toggle the mobile search variable that determines whether the search bar is displayed on mobile
     */
    toggleMobileSearch() {
        this.mobileSearchActive = !this.mobileSearchActive;
    }

    /**
     * Takes in the newActiveIndex and the newActiveItem and sets appropriate variables to display the corrcet
     * megamenu items
     * @param newActiveIndex The new index of the active mega menu. -1 means none active.
     * @param newActiveNavItem The htmlELement of the menu item.  Used to calculate the menu position.
     * @param isMegaMenuHover isMegaMenuHover active.
     * @param isSmallClick is this a click from when in mobile view to show mega menu
     */
    setActiveMegaMenuAndNavItem(
        newActiveIndex: number,
        newActiveNavItem = this.activeNavItem,
        isMegaMenuHover = false,
        isSmallViewClick = false
    ) {
        // if we are from a small view and a nav item is clicked
        // we want to show the more menu action and set the correct mege menu to display
        if ( isSmallViewClick ) {
            this.menuActive = true;
            this.navigationStateService.setOverlayActive( true );
            this.setActiveMegaMenu( newActiveIndex );
        }
        if ( !this.menuActive && !isSmallViewClick ) {
            this.isMegaMenuHover = isMegaMenuHover;

            if ( newActiveIndex > -1 ) {
                this.activeIndex = newActiveIndex;
                this.navigationStateService.setOverlayActive( true );
            } else {
                setTimeout( () => {
                    if ( !this.isMegaMenuHover ) {
                        this.activeIndex = newActiveIndex;
                        this.navigationStateService.setOverlayActive( false );
                    }
                }, this._HOVER_INTENT_DELAY );
            }

            if (
                newActiveNavItem &&
                this.activeNavItem !== newActiveNavItem &&
                newActiveIndex > -1
            ) {
                this.activeNavItem = newActiveNavItem;

                const clientRect = newActiveNavItem.getBoundingClientRect();

                this.megaMenuHoriPosition =
                    clientRect.left - this._MEGA_MENU_PADDING_LEFT;
            }
        }
    }

    /**
     * Updates the active mega menu index.  Used for simpler click actions.
     * @param newActiveIndex The new index of the active mega menu. -1 means none active.
     */
    setActiveMegaMenu( newActiveIndex: number ) {
        this.activeIndex = newActiveIndex;

        if ( newActiveIndex > -1 ) {
            this.navigationStateService.setOverlayActive( true );
        } else {
            this.navigationStateService.setOverlayActive( false );
        }
    }

    /**
     * Toggles the "more" menu that displays all categories.
     */
    // TODO Why are we doing this programatically
    public toggleMenuActive( evt: MouseEvent | undefined ) {
        this.menuActive = !this.menuActive;

        if ( !this.menuActive ) {
            this.closeMenu();
        } else {
            this.navigationStateService.setOverlayActive( true );
        }
        if ( evt && evt.preventDefault ) {
            evt.preventDefault();
        }
    }

    private closeMenu() {
        this.activeIndex = -1;
        this.navigationStateService.setOverlayActive( false );
    }

    /**
     * Set all variables that control the mega menu showing to false/-1 so that they are all hidden.
     */
    closeAllMenus() {
        this.activeIndex = -1;
        this.navigationStateService.setOverlayActive( false );
        this.menuActive = false;
        this.activeNavItem = null;
    }

    getMenuConfiguration(): void {
        const menuComponent = this.page?.getComponent( 'menu' );
        const { main } = menuComponent?.getModels<any>();

        this.menuDocument = this.page?.getContent<DocumentData>( main );

        this.configuration = this.menuDocument?.model.data as {
            siteMenuItems: SiteMenuItem[];
        };

        const cmsMenuItems = this.configuration.siteMenuItems;

        /**
         * Set all the content for the main navigation by reformatting the content from the cms
         * into the format the components are expecting
         */
        if ( cmsMenuItems && cmsMenuItems.length ) {
            cmsMenuItems.forEach( ( cmsMenuSection: any ) => {
                switch ( cmsMenuSection.name ) {
                    case cmsNavTitles.utilityLinks:
                        this.utilityLinks =
                            convertHippoMenuItem( cmsMenuSection );
                        break;
                    case cmsNavTitles.otherBeaconSites:
                        this.otherSiteLinks =
                            convertHippoMenuItem( cmsMenuSection );
                        break;
                    case cmsNavTitles.findAStoreLink:
                        const cmsFindAStore = cmsMenuSection.childMenuItems[0];
                        this.findAStoreLink = this._stripSiteFromLink(
                            cmsFindAStore.links.site?.href
                        );
                        this.findAStoreText = cmsFindAStore.name;
                        this.findAStoreIsExternal =
                            cmsFindAStore.links.site?.type === 'external';
                        break;
                    case cmsNavTitles.logoLink:
                        const cmsLogoLink = cmsMenuSection.childMenuItems[0];
                        this.logoUrl = this._stripSiteFromLink(
                            cmsLogoLink.links.site?.href
                        );
                        this.logoAltText = cmsLogoLink.name;
                        this.logoIsExternal =
                            cmsLogoLink.links.site?.type === 'external';
                        break;
                    case cmsNavTitles.mainNavArea:
                        this.navItems = cmsMenuSection.childMenuItems.map(
                            ( curCMSNavItem: any ) => {
                                // Pull out the marketing block from the child nav items and save to it's own variable.
                                const marketingBlockCMS =
                                    curCMSNavItem.childMenuItems.find(
                                        ( menuItem: any ) =>
                                            menuItem.parameters &&
                                            menuItem.parameters.marketing
                                    );
                                let marketingBlockContentPath = '';
                                let marketingBlockCMSContent:
                                    | Record<string, string | any>
                                    | undefined;
                                if ( marketingBlockCMS ) {
                                    marketingBlockContentPath =
                                        marketingBlockCMS.parameters.marketing.replace(
                                            '/',
                                            '-'
                                        );
                                    marketingBlockCMSContent =
                                        this.configuration &&
                                            marketingBlockContentPath
                                            ? this.configuration[
                                            marketingBlockContentPath
                                            ]
                                            : undefined;
                                    const marketingBlockCMSIndex =
                                        curCMSNavItem.childMenuItems.indexOf(
                                            marketingBlockCMS
                                        );
                                    curCMSNavItem.childMenuItems[
                                        marketingBlockCMSIndex
                                    ].isMarketingBlock = true;
                                }

                                const newNavItem: NavItem = {
                                    title: curCMSNavItem.name,
                                    url: this._stripSiteFromLink(
                                        curCMSNavItem.links.site?.href
                                    ),
                                    isExternal:
                                        curCMSNavItem.links.site?.type ===
                                        'external',
                                    megaMenu: {
                                        megaMenuSections:
                                            curCMSNavItem.childMenuItems.map(
                                                ( cmsMegaMenuSection: any ) => {
                                                    return {
                                                        isMarketingBlock:
                                                            cmsMegaMenuSection.isMarketingBlock,
                                                        title:
                                                            !cmsMegaMenuSection.parameters ||
                                                                !cmsMegaMenuSection
                                                                    .parameters[
                                                                'Show Title (Y/N)?'
                                                                ] ||
                                                                cmsMegaMenuSection.parameters[
                                                                    'Show Title (Y/N)?'
                                                                ]
                                                                    .toLowerCase()
                                                                    .trim() !== 'n'
                                                                ? cmsMegaMenuSection.name
                                                                : null,
                                                        links: convertHippoMenuItem(
                                                            cmsMegaMenuSection
                                                        ),
                                                    };
                                                }
                                            ),
                                        marketingBlock: marketingBlockCMSContent
                                            ? {
                                                imageSrc:
                                                    marketingBlockCMSContent.backgroundImage
                                                        ? this.getImageUrl(
                                                            marketingBlockCMSContent.backgroundImage
                                                        )
                                                        : null,
                                                btnText:
                                                    marketingBlockCMSContent.btnText,
                                                btnUrl: marketingBlockCMSContent.btnUrl,
                                                textContent:
                                                    marketingBlockCMSContent.content,
                                                isExternal:
                                                    marketingBlockCMSContent.external,
                                                title: marketingBlockCMSContent.title,
                                                primaryDocument:
                                                    marketingBlockCMSContent.primaryDocument,
                                            }
                                            : null,
                                    },
                                };
                                return newNavItem;
                            }
                        );
                        break;
                }
            } );
        }
    }

    async submitSearch() {
        const searchTermTrim = this.searchTerm || '';
        this.searchTerm = '';
        await this.router.navigate( ['/search/', searchTermTrim.trim()] );
    }

    /**
     * If "site" is present in the url, strip from url and return that string.
     * @param navItem the string to be reformatted
     */
    private _stripSiteFromLink( navItem: string ): string {
        if ( navItem ) {
            if (
                !navItem.includes( 'site/_cmsinternal' ) &&
                navItem.includes( 'site/' )
            ) {
                navItem = navItem.replace( 'site/', '' );
            }
        }

        return navItem;
    }

    public get accountId() {
        if ( !this.account ) {
            return '0';
        }
        return this.account.accountLegacyId;
    }

    public get cashAccount() {
        if ( !this.account ) {
            return false;
        }
        return this.account.cashAccount;
    }

    public get branchInfo() {
        const sessionInfo = this.sessionInfo;
        const account = this.account;
        if ( !account ) {
            return null;
        }
        if ( !sessionInfo || !sessionInfo.accountBranch ) {
            return null;
        }
        const { address, branchName, branchPhone } = sessionInfo.accountBranch;
        const addressLines = address ? `${address.address1}` : '';
        const cityLine = address
            ? `${address.city}, ${address.state} ${address.postalCode}`
            : '';
        return {
            account: `${account.accountLegacyId} - ${account.accountName}`,
            branchName: branchName,
            address: addressLines,
            cityLine,
            branchPhone,
        };
    }

    async switchAccount(
        account: AccountDetails,
        url: string = '/proplus/home'
    ) {
        const title = 'Warning';
        const message =
            'You have items in your cart. If you switch accounts, you will lose your cart. Do you want to proceed?';
        this.closeAllMenus();
        await this.cartService.switchAccount(
            account,
            ['/proplus/home'],
            title,
            message
        );
    }

    async logout() {
        this.chatService.displayChat( false );
        await this.userService.logout();
        // hide pending orders
        await this.pendingOrdersService.resetOrdersApproverInfo();
        await this.router.navigate( ['/'] );
        this.analyticsService.clearDatalayer();
    }

    async navigateUrl( url: string ) {
        await this.router.navigate( [url] );
    }

    goToSpanish() {
        let pathname = window.location.pathname;
        let search = window.location.search;
        let spUrl = this.spanishRef.value.spanishUrl;
        console.log( { spUrl } )
        const url: string = spUrl + pathname + search;
        window.open( url, "_self" );
    }
    goToEnglish() {
        let pathname = window.location.pathname;
        let search = window.location.search;
        let enUrl = this.spanishRef.value.englishUrl;
        console.log( { enUrl } )
        const url: string = enUrl + pathname + search;
        window.open( url, "_self" );
    }

}

function fixProductLink( link: string ) {
    const url = new URL( link, 'http://dontusethishost.com' );
    const pathname = url.pathname;
    const searchParams = url.searchParams;
    const skuId = searchParams.get( 'skuId' );
    if ( skuId ) {
        return `${pathname}/${skuId}`;
    }
    return pathname;
}

interface AccountMenuItem {
    icon: string;
    text: string;
    address: string;
    enabled: boolean;
}
