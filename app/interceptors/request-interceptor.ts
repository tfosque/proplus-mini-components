import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
} from '@angular/common/http';
import pointer from 'jsonpointer';
import { filter, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ServiceUrls } from '../enums/service-urls.enum';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { beaconServiceRoot, isProductHeader } from '../app.constants';
import { trace } from '../misc-utils/log';
import { PageService } from '../services/page.service';
import { PageTypes } from '../enums/page-types.enum';
import { PageNotFoundService } from '../services/page-not-found.service';

/**
 * Intercepts all outgoing http requests and incoming responses.  Allows us to globally handle errors and redirect when needed.
 * Also useful if we need to include an auth token on requests.
 */
@Injectable()
export class RequestInterceptor implements HttpInterceptor {
    isBrowser: boolean;
    preloaded!: { request: HttpRequest<any>; response: HttpResponse<any> };
    fakePageResponses: Record<string, HttpResponse<any>> = {};

    constructor(
        private readonly pageService: PageService,
        private readonly pageNotFoundService: PageNotFoundService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    /**
     * Method called on all http requests/responses.
     * @param request the outgoing request object.
     * @param next HttpHandler that returns the observable from the http response.
     */
    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        logRequest(request);
        // if (!request.url.includes('https://maps.googleapis.com/maps')) {
        //     request = request.clone({
        //         // Workaround for sdk requests doubling up on the cmsinternal and site vars.
        //         url: request.url.replace(
        //             '/site/_cmsinternal/resourceapi/site/_cmsinternal',
        //             '/site/_cmsinternal/resourceapi'
        //         ),
        //     });
        // }
        // console.log('request', request.url);

        // if fakePreload requested via proplus-guard or product-data-resolver
        const fakePreloaded = this.pageService.getFakePreloaded(request.url);
        if (!!fakePreloaded && this.fakePageResponses[fakePreloaded]) {
            return of(this.fakePageResponses[fakePreloaded]);
        }

        // Return previously loaded bloomreach urls
        if (
            isBloomreachUrl(request.url) &&
            this.preloaded &&
            this.preloaded.request.url === request.url
        ) {
            return of(this.preloaded.response);
        }

        return next.handle(request).pipe(
            filter((event) => event instanceof HttpResponse),
            tap((curEvent: HttpEvent<unknown>) => {
                const curResponse = curEvent as HttpResponse<any>;
                logResponse(curResponse);

                // console.log('handle', curResponse, request.url);

                switch (this.getRequestType(request.url)) {
                    case 'cms':
                        return this.resolveCmsRequest(request, curResponse);
                    default:
                        return curResponse;
                }
            })
        );
    }

    private getRequestType(url: string) {
        if (url.includes(`${beaconServiceRoot}${ServiceUrls.items}`)) {
            return 'product';
        } else if (url.includes('proplus/account')) {
            return 'account';
        } else if (isBloomreachUrl(url)) {
            return 'cms';
        }

        return '';
    }

    private resolveCmsRequest(
        request: HttpRequest<any>,
        response: HttpResponse<any>
    ) {
        //  If we're requesting some content from Hippo, we want to...
        const body = response.body;
        const responseHeaders = response.headers;

        //  We know it's a product page when because the Is-Product-Page HTTP header is set
        let isProduct = false;

        if (responseHeaders) {
            isProduct = responseHeaders.get(isProductHeader) === 'true';
        }

        if (isProduct && body?.page) {
            pointer.set(
                body,
                `${body.root.$ref}/name`,
                PageTypes.productDetails
            );
        }

        // console.log('body', { body }, request.url);

        if (body) {
            const { name: pageName } = pointer.get(body, body.root.$ref);

            if (pageName.includes(PageTypes.pageNotFound) && !request.url.includes('profile/change-password') &&
                !request.url.includes('eagle-view/process-account')) {
                //  Again, if the page is claims it's not found, lets redirect to page not found
                this.pageNotFoundService.setIsPageContentNotFound(true);
            } else {
                this.pageNotFoundService.setIsPageContentNotFound(false);
            }
        }

        const fakePreloaded = this.pageService.getFakePreloaded(response.url);

        if (response.url && !!fakePreloaded) {
            this.fakePageResponses[fakePreloaded] = response;
        }

        this.preloaded = {
            request,
            response,
        };

        return response;
    }
}

function isBloomreachUrl(url?: string | null) {
    return url?.includes(environment.brxmEndpoint);
}

function logRequest(request: HttpRequest<unknown>) {
    const { url, method, body, params } = request;
    trace({ event: 'http-request', url, method, body, params });
}

function logResponse(response: HttpResponse<unknown>) {
    const { url, ok, status, statusText, body, type } = response;
    if (!ok && url) {
        console.error({
            event: 'http-error',
            url,
            status,
            statusText,
            body,
            type,
        });
    } else if (ok) {
        trace({ event: 'http-ok', url, ok });
    }
}
