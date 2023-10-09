import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpResponse,
} from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestCacheService } from '../services/request-cache.service';
import { environment } from '../../environments/environment';

const {
    beaconV1ServiceUri,
    beaconV2ServiceUri,
    beaconServiceUri,
} = environment;

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
    constructor(private readonly cache: RequestCacheService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // continue if not cachable.
        if (!isCachable(req)) {
            return next.handle(req);
        }

        //  Try to get from cache
        const cachedResponse = this.cache.get(req);
        //  Return the cash version if it's available
        if (cachedResponse) {
            return of(cachedResponse);
        }
        //  Otherwise send a request to the web server and save the response in cash
        return sendRequest(req, next, this.cache);
    }
}

const cachablePages = new Set<string>([
    //  Daily - Updated by ETL
    'v2/itemDetails',
    'v3/itemDetails',
    'v2/suggestiveSelling',
    'v2/pricing',
    'v2/itemlist',
    'v3/itemlist',
    'v1/branchlist',
    // // Less likely to change
    // 'v1/accounts',
    // 'v1/jobs',
    // //  User can change
    // 'v2/getAddressBook',
    // 'v2/template',
    // //  Likely to change
    // 'v2/getCurrentUserPermission',
    // 'v2/getCurrentUserInfo',
]);

function isCachable(req: HttpRequest<any>) {
    const info = apiInfo(req.url);
    if (req.method === 'GET' && info) {
        const page = `${info.version}${info.page}`;
        const shouldCached = cachablePages.has(page);
        return shouldCached;
    }
    return false;
}

function apiInfo(url: string) {
    if (url.startsWith(beaconServiceUri)) {
        return { version: 'v3', page: url.replace(beaconServiceUri, '') };
    }
    if (url.startsWith(beaconV1ServiceUri)) {
        return { version: 'v1', page: url.replace(beaconV1ServiceUri, '') };
    }
    if (url.startsWith(beaconV2ServiceUri)) {
        return { version: 'v2', page: url.replace(beaconV2ServiceUri, '') };
    }
    return null;
}

/**
 * Get server response observable by sending request to `next()`.
 * Will add the response to the cache on the way out.
 */
function sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
    cache: RequestCacheService
): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
        tap((event) => {
            // There may be other events besides the response.
            if (event instanceof HttpResponse) {
                if (event.ok) {
                    cache.put(req, event); // Update the cache.
                }
            }
        })
    );
}
