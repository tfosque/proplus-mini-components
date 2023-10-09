import {
    Component,
    Inject,
    InjectionToken,
    OnDestroy,
    OnInit,
    Optional,
    PLATFORM_ID,
    Type,
} from '@angular/core';
import { Router } from '@angular/router';
import { BrPageComponent, BrProps } from '@bloomreach/ng-sdk';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { filter, map, skipWhile, switchMapTo, takeWhile, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AnalyticsService } from '../../common-components/services/analytics.service';
import { GetCurrentUserInfoResponseV2 } from '../../pro-plus/model/get-current-user-response-v2';
import { ChatService } from '../../pro-plus/services/chat.service';
import {
    PendingOrdersUserCredentials,
    PendingOrdersService,
} from '../../pro-plus/services/pending-orders.service';
import { SessionInfo } from '../../pro-plus/services/SessionInfo';
import { UserService } from '../../pro-plus/services/user.service';
import { SeoService } from '../../services/seo.service';
import { NavigationStateService } from '../../services/navigation-state.service';
import { PageService } from '../../services/page.service';
import { Page } from '@bloomreach/spa-sdk';
import { PageNotFoundService } from 'src/app/services/page-not-found.service';

export const MAPPING = new InjectionToken<string>( 'brXM components mapping' );

@Component( {
    selector: 'app-index-page',
    templateUrl: './index-page.component.html',
    styleUrls: ['./index-page.component.scss'],
} )
export class IndexPageComponent implements OnInit, OnDestroy {
    isBrowser!: boolean;
    local = environment.local;
    configuration?: BrPageComponent['configuration'];
    isPreview!: boolean;

    // Pending Orders User State
    user = new BehaviorSubject<PendingOrdersUserCredentials>( {
        accountId: '0',
        isLoggedIn: false,
        approver: false,
        approverId: null,
    } );

    public pendingOrdersCount$: Observable<number> = of( 0 );
    public isOrderApprover$: Observable<boolean | undefined> = of( false );
    public isLastSelectedAccountClosed$: Observable<boolean | undefined> = of( false );
    public overlayActive$ = this.navigationStateService.overlayActive$;

    /**
     * Adding to page within the typescript instead of the index.html file as it was causing a js error when loaded
     * before angular processing finished.
     */
    optinMosterScript = `
      <!-- This site is converting visitors into subscribers and customers with OptinMonster - https://optinmonster.com -->
      <script type="text/javascript" src="https://a.optmnstr.com/app/js/api.min.js" data-account="62532" data-user="55555"></script>
      <!-- / OptinMonster -->
    `;

    pageConfigurationSub!: Subscription;
    pageSub!: Subscription;

    get isPageLoading$() {
        return this.pageService.isPageLoading$;
    }

    get isPageProductNotFound() {
        return this.pageNotFound.isPageProductNotFound$;
    }

    get isPageContentNotFound() {
        return this.pageNotFound.isPageContentNotFound$;
    }

    constructor(
        private router: Router,
        private readonly pageService: PageService,
        @Inject( PLATFORM_ID ) platformId: string,
        private readonly chatService: ChatService,
        public readonly userService: UserService,
        public readonly analytics: AnalyticsService,
        private readonly pendingOrdersService: PendingOrdersService,
        private readonly seoService: SeoService,
        // TODO (Luis Sardon): to review when looking at navigation
        private readonly navigationStateService: NavigationStateService,
        private readonly pageNotFound: PageNotFoundService,
        @Inject( MAPPING )
        @Optional()
        public mapping?: Record<keyof any, Type<BrProps>>
    ) {
        // console.log('chat service', this.chatService);
        this.isBrowser = isPlatformBrowser( platformId );
    }

    ngOnInit() {
        this.pendingOrdersCount$ = this.pendingOrdersService.getPendingOrdersCount$( this.userService.isLoggedIn );

        this.isOrderApprover$ = this.pendingOrdersService.isApprover$;

        this.isLastSelectedAccountClosed$ = this.userService.sessionBehavior.pipe(
            map( ( s ) => s.lastSelectedAccount ? s.lastSelectedAccount.isAccountClosed : false )
        );

        this.pageConfigurationSub = this.pageService.configuration$
            .pipe( skipWhile( ( configuration ) => !configuration ) )
            .subscribe( ( configuration ) => {
                // console.log('config', { configuration });
                if ( configuration && configuration !== this.configuration ) {
                    this.configuration = configuration;
                }
            } );

        //  The login session has changed.  We might need to
        //  move the user to a new page.
        //  TODO:  Figure out the kosher way of doing this in
        //         in Angular.
        this.pageSub = this.pageService.page$
            .pipe(
                skipWhile( ( page ) => !page ),
                takeWhile( ( page ) => !page, true ),
                tap( ( page ) => {
                    this.isPreview = Boolean( page?.isPreview() );
                } ),
                switchMapTo( this.userService.sessionBehavior ),
                filter( ( s ) => s.session.loggedOut === false )
            )
            .subscribe( async ( s ) => {
                const url = this.router.url.replace( /\?.*$/, '' );
                if ( !this.isBrowser ) return;

                // const windowUrl = window.location?.href || '';
                const isNotLoggedIn = s.tag !== 'loggedIn';
                const isPreview = this.isPreview;
                //  Do nothing if we're on the login page
                if (
                    url.startsWith( '/proplus/login' )
                ) {
                    return;
                }
                //  Redirect to the login page if we're on one of these pages and we're logged out
                // TODO are we redirecting to cms landing page or proplus login page?
                if (
                    isNotLoggedIn &&
                    !isPreview &&
                    url.startsWith( '/proplus/' ) &&
                    !url.endsWith( '/sign-up' ) &&
                    !url.endsWith( '/forgot-password' ) &&
                    !url.endsWith( '/diagnostics' ) &&
                    !url.endsWith( '/profile/change-password' ) &&
                    !url.endsWith( '/profile/change-password/' )
                ) {
                    await this.router.navigateByUrl( '/proplus/login' );
                }
            } );

        // If this is not the prod environment, add robots header to prevent indexing.
        if ( !environment.prodServer ) {
            this.seoService.createMetaRobots();
        }
        console.log( 'this:::', this )
    }

    ngOnDestroy() {
        this.pageConfigurationSub.unsubscribe();
        this.pageSub.unsubscribe();
    }

    ngAfterViewInit() {
        this.checkUser();
        // TODO afterPageLoad detect userPendingOrders Status

        // subscribe to latest pending orders count TODO: should this be done before checking if user is logged in?

        // get Credentials

        // TEST on chatbox expand DO NOT DELETE this comment
        /*  win.olark('api.box.onExpand', function () {
             chatSvc.sendEmailToOlark();
         }) */

    }

    private async checkUser() {
        if ( this.isBrowser ) {
            try {
                await this.userService
                    .getCurrentUserInfo()
                    .then( ( userInfo ) => userInfo )
                    .then( ( results ) => {
                        // TEST console.log({ results });
                        const email = results && results.email;
                        if ( email ) {
                            this.chatService.updateOlarkEmail( email );
                        } else {
                            this.chatService.displayChat( false );
                        }
                        if ( results ) {
                            const changeType:
                                | SessionInfo
                                | GetCurrentUserInfoResponseV2 = results;
                            this.analytics.userData( changeType );
                        }
                    } );
            } catch ( err ) { }
        }
    }

    setVisitor( page?: Page ): void {
        if ( this.configuration ) this.configuration.visitor = page?.getVisitor();
    }

    setPage( page: Page ) {
        if ( page ) this.pageService.setPage( page );
    }

    onError( e: any ) {
        console.log( 'e', { e } );
    }
}
