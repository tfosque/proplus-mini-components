import { isPlatformBrowser } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
import {
    Inject,
    Injectable,
    InjectionToken,
    Optional,
    PLATFORM_ID,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BrPageComponent } from '@bloomreach/ng-sdk';
import {
    //initialize,
    Configuration,
    //PageModel
} from '@bloomreach/spa-sdk';
import { Page } from '@bloomreach/spa-sdk';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import {
    BehaviorSubject, Observable,
    // from
} from 'rxjs';
import {
    filter,
    // map, tap
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export const CONFIGURATION = new InjectionToken<
    Omit<Configuration, 'request' | 'path' | 'request'>
>( 'brXM API endpoint' );
export type PageLoadInterceptor = ( page: Page ) => Observable<any>;

@Injectable( {
    providedIn: 'root',
} )
export class PageService {
    isBrowser: boolean;
    currUrl = '';

    private _interceptors: PageLoadInterceptor[] = [];
    fakePreloaded: Record<string, string[]> = {
        '/proplus-login': ['/proplus-login'],
        '/pagenotfound': ['/pagenotfound'],
    };

    get interceptors() {
        return this._interceptors;
    }

    private _configuration = new BehaviorSubject<
        BrPageComponent['configuration'] | null
    >( null );
    configuration$ = this._configuration.asObservable();

    private _page = new BehaviorSubject<Page | null>( null );
    page$ = this._page.asObservable();

    private _isPageLoading = new BehaviorSubject( false );
    isPageLoading$ = this._isPageLoading.asObservable();

    isPreloading = false;

    constructor(
        @Inject( PLATFORM_ID ) platformId: string,
        // private httpClient: HttpClient,
        protected router: Router,
        @Inject( CONFIGURATION ) protected configuration?: Configuration,
        @Inject( REQUEST ) @Optional() protected request?: Request
    ) {
        // this.customRequest = this.customRequest.bind( this );
        this.isBrowser = isPlatformBrowser( platformId );
        router.events
            .pipe(
                filter(
                    ( event ) =>
                        event instanceof NavigationEnd && !this.isPreloading
                )
            )
            .subscribe( ( event: any ) => {
                this.updateConfiguration( event.url );
            } );
    }

    private getCleanUrl( url?: string | null ) {
        return url?.replace( /(\/[^?]+).*/, '$1' ) || '';
    }

    private updateConfiguration( url: string ) {
        // Remove querystring from URL
        const cleanURL = this.getCleanUrl( url );

        if ( this.currUrl !== cleanURL ) {
            this._isPageLoading.next( true );

            this.currUrl = cleanURL;

            this._configuration.next( {
                ...this.configuration,
                request: this.request,
                path: url,
            } as BrPageComponent['configuration'] );
        }
    }

    setPage( page: Page ) {
        if ( this.isPreloading ) {
            this.isPreloading = false;
            return;
        }

        console.log( { page } )
        this._page.next( page );
        this._isPageLoading.next( false );
    }

    /*     private async customRequest(
            ...[{ data: body, headers, method, url }]: Parameters<
                Configuration['httpClient']
            >
        ): Promise<void | {
            data: PageModel;
        }> {
            return this.httpClient
                .request<PageModel>( method, url, {
                    body,
                    headers: headers as Record<string, string | string[]>,
                    responseType: 'json',
                } )
                .pipe( map( ( data ) => ( { data } ) ) )
                .toPromise()
                .catch( ( error ) => console.log( 'Request Error', error ) );
        } */

    forcePageLoading( value: boolean ) {
        this._isPageLoading.next( value );
    }

    /*  preload( url: string ) {
         const cleanURL = this.getCleanUrl( url );
 
         if ( this.currUrl !== cleanURL ) {
             this.isPreloading = true;
 
             const configuration = {
                 httpClient: this.customRequest,
                 ...this.configuration,
                 path: url,
             } as Configuration;
 
             return from( initialize( configuration ) ).pipe(
                 tap( ( page ) => {
                     this.isPreloading = false;
                     this.setPage( page );
                 } )
             );
         }
 
         return from( this._page );
     } */

    fakePreload( originUrl: string, fakeUrl: string ) {
        if ( !this.fakePreloaded[fakeUrl].includes( originUrl ) ) {
            this.fakePreloaded[fakeUrl].push( originUrl );
        }
        return null;
        /* return this.preload( fakeUrl ); */
    }

    getFakePreloaded( url?: string | null ) {
        const cleanURL = this.getCleanUrl( url ).replace(
            environment.brxmEndpoint,
            ''
        );

        if ( !cleanURL ) return undefined;

        return Object.keys( this.fakePreloaded ).find( ( key ) =>
            this.fakePreloaded[key].includes( cleanURL )
        );
    }
}
