import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router';
// import { of } from 'rxjs';
// import { switchMapTo } from 'rxjs/operators';
// import { PageService } from 'src/app/services/page.service';

@Injectable( {
    providedIn: 'root',
} )
export class UnsecuredProPlusGuard implements CanActivate {
    isBrowser: boolean;

    constructor(
        // private readonly pageService: PageService,
        @Inject( PLATFORM_ID ) platformId: string
    ) {
        this.isBrowser = isPlatformBrowser( platformId );
    }

    canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        /* return this.pageService
            .fakePreload(state.url, '/proplus-login')
            .pipe(switchMapTo(of(true))); */
        return true;
    }
}
