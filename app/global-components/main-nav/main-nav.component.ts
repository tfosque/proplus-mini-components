// import { LoginModalComponent } from './../../pro-plus/pages/login-modal/login-modal.component';
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
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NavigationStateService } from '../../services/navigation-state.service';
import { TranslationsPipe } from '../../pipes/translations.pipe';
import {
    convertHippoMenuItem,
    SiteMenuItem,
} from '../../misc-utils/utility-methods';
import { isPlatformBrowser } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';
import { BrBaseComponent } from '../../core/BrBaseComponent';
import { BrPageComponent } from '@bloomreach/ng-sdk';
import { DocumentData } from 'src/declarations';
import { LoginModalComponent } from '../../pro-plus/pages/login-modal/login-modal.component';
import { SpanishEnvironment } from 'src/app/models/spanish-environment';
import { SpanishTranslationService } from 'src/app/services/spanish-translation.service';

// Enums used to find the content for different sections in the hippo nav data.
enum cmsNavTitles {
    mainNavArea = 'Main Nav Area',
    utilityLinks = 'Utility Links',
    otherBeaconSites = 'Other Beacon Sites',
    logoLink = 'Logo Link',
    findAStoreLink = 'Find a Store',
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
        megaMenuSections: MegaMenuSection[];
    };
}

interface MegaMenuSection {
    isMarketingBlock?: boolean;
    title: string | null;
    links: NavItemMegaMenuLink[];
}

interface NavItemMegaMenuLink {
    title: string | null;
    url: string;
    isExternal: boolean;
}

@Component( {
    selector: 'app-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
} )
export class MainNavComponent
    extends BrBaseComponent
    implements OnInit, AfterViewInit, OnDestroy {
    configuration?: {
        siteMenuItems: SiteMenuItem[];
        [key: string]: any;
    };
    menuDocument?: DocumentData;
    searchTerm?: string;
    isBrowser: boolean;

    @ViewChild( 'navContainer' ) navContainer?: ElementRef;
    @ViewChild( 'navItemContainer' )
    navItemContainer?: ElementRef;
    isOverflowing?: boolean;

    activeIndex = -1;
    activeNavItem?: HTMLElement | null;
    megaMenuHoriPosition?: number;
    isMegaMenuHover = false;

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

    currentSiteName = this.translationsPipe.transform(
        'Beacon',
        'current-site-name'
    );

    navItems: NavItem[] = [];
    spanishRef = new BehaviorSubject<SpanishEnvironment>( {
        spanishUrl: '',
        englishUrl: '',
        showEnglishBtn: false,
        showSpanishBtn: false,
    } );
    constructor(
        public dialog: MatDialog,
        private readonly breakpointObserver: BreakpointObserver,
        private readonly router: Router,
        private readonly navigationStateService: NavigationStateService,
        private readonly translationsPipe: TranslationsPipe,
        private readonly spanish: SpanishTranslationService,
        @Inject( PLATFORM_ID ) platformId: string,
        @Optional() page?: BrPageComponent
    ) {
        super( page );
        this.isBrowser = isPlatformBrowser( platformId );
    }

    ngOnInit() {
        this.getMenuConfiguration();

        const layoutChangesLarge$ = this.breakpointObserver.observe( [
            Breakpoints.large,
        ] );

        this.layoutChangesLargeSub = layoutChangesLarge$.subscribe( ( result ) => {
            if ( result.matches ) {
                this.isLargeScreen = true;
            } else {
                this.isLargeScreen = false;
            }
        } );

        const layoutChangesMedium$ = this.breakpointObserver.observe( [
            Breakpoints.medium,
        ] );

        this.layoutChangesMediumSub = layoutChangesMedium$.subscribe(
            ( result ) => {
                if ( result.matches ) {
                    this.isMediumScreen = true;
                } else {
                    this.isMediumScreen = false;
                }
            }
        );
        this.spanish.getSpanishEnviron();
        this.spanish.spanishRef$.subscribe( ( ref: SpanishEnvironment ) => {
            this.spanishRef.next( ref );
        } );
    }

    ngOnDestroy() {
        this.layoutChangesMediumSub.unsubscribe();
        this.layoutChangesLargeSub.unsubscribe();
    }

    ngAfterViewInit() {
        setTimeout( () => {
            this.checkIfOverflowing();
        } );
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

    logIn() {
        this.dialog.open( LoginModalComponent );
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
    toggleMenuActive( evt: MouseEvent | undefined ) {
        this.menuActive = !this.menuActive;

        if ( !this.menuActive ) {
            this.activeIndex = -1;
            this.navigationStateService.setOverlayActive( false );
        } else {
            this.navigationStateService.setOverlayActive( true );
        }
        if ( evt && evt.preventDefault ) {
            evt.preventDefault();
        }
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
            cmsMenuItems.forEach( ( cmsMenuSection ) => {
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
                        const navItems = this.getNavItems( cmsMenuSection );
                        this.navItems = navItems;
                        break;
                }
            } );
        }
    }

    private getNavItems( cmsMenuSection: SiteMenuItem ): NavItem[] {
        return cmsMenuSection.childMenuItems.map( ( curCMSNavItem ) => {
            // Pull out the marketing block from the child nav items and save to it's own variable.
            const marketingBlockCMS = curCMSNavItem.childMenuItems.find(
                ( menuItem ) =>
                    !!( menuItem.parameters && menuItem.parameters.marketing )
            );

            // TODO (Luis Sardon): review with Tim
            let marketingBlockContentPath = '';
            let marketingBlockCMSContent:
                | Record<string, string | any>
                | undefined;
            if ( marketingBlockCMS ) {
                marketingBlockContentPath =
                    marketingBlockCMS.parameters.marketing.replace( '/', '-' );
                marketingBlockCMSContent =
                    this.configuration && marketingBlockContentPath
                        ? this.configuration[marketingBlockContentPath]
                        : undefined;
                const marketingBlockCMSIndex =
                    curCMSNavItem.childMenuItems.indexOf( marketingBlockCMS );
                curCMSNavItem.childMenuItems[
                    marketingBlockCMSIndex
                ].isMarketingBlock = true;
            }

            const title = curCMSNavItem.name;
            const url = this._stripSiteFromLink( curCMSNavItem.links.site?.href );
            const isExternal = curCMSNavItem.links.site?.type === 'external';

            const megaMenuSections = curCMSNavItem.childMenuItems.map(
                ( cmsMegaMenuSection ) => {
                    const menuParameters = cmsMegaMenuSection.parameters;
                    const showingTitle =
                        !menuParameters ||
                        !menuParameters['Show Title (Y/N)?'] ||
                        menuParameters['Show Title (Y/N)?']
                            .toLowerCase()
                            .trim() !== 'n';

                    const section = {
                        isMarketingBlock: cmsMegaMenuSection.isMarketingBlock,
                        title: showingTitle ? cmsMegaMenuSection.name : null,
                        links: convertHippoMenuItem( cmsMegaMenuSection ),
                    };
                    return section;
                }
            );

            const megaMenu: NavItem['megaMenu'] = {
                megaMenuSections: megaMenuSections,
                marketingBlock: !!marketingBlockCMSContent
                    ? {
                        imageSrc: marketingBlockCMSContent?.backgroundImage
                            ? this.getImageUrl(
                                marketingBlockCMSContent.backgroundImage
                            )
                            : null,
                        btnText: marketingBlockCMSContent?.btnText,
                        btnUrl: marketingBlockCMSContent?.btnUrl,
                        textContent: marketingBlockCMSContent?.content,
                        isExternal: marketingBlockCMSContent?.external,
                        title: marketingBlockCMSContent?.title,
                        primaryDocument:
                            marketingBlockCMSContent?.primaryDocument,
                    }
                    : null,
            };

            const newNavItem: NavItem = {
                title: title,
                url: url,
                isExternal: isExternal,
                megaMenu: megaMenu,
            };
            return newNavItem;
        } );
    }

    async submitSearch() {
        const searchTermTrim = this.searchTerm || '';
        await this.router.navigate( ['/search/', searchTermTrim.trim()] );
    }

    /**
     * If "site" is present in the url, strip from url and return that string.
     * @param navItem the string to be reformatted
     */
    private _stripSiteFromLink( navItem?: string ): string {
        if ( navItem ) {
            if (
                !navItem.includes( 'site/_cmsinternal' ) &&
                navItem.includes( 'site/' )
            ) {
                navItem = navItem.replace( 'site/', '' );
            }
        }

        return navItem || '';
    }
    goToSpanish() {
        let pathname = window.location.pathname;
        let search = window.location.search;
        let spUrl = this.spanishRef.value.spanishUrl;
        const url: string = spUrl + pathname + search;
        window.open( url, '_self' );
    }
    goToEnglish() {
        let pathname = window.location.pathname;
        let search = window.location.search;
        let enUrl = this.spanishRef.value.englishUrl;
        const url: string = enUrl + pathname + search;
        window.open( url, '_self' );
    }
}
