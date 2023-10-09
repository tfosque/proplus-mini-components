import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    // Router,
} from '@angular/router';
import { CanActivate } from '@angular/router';
// import { from, of, throwError } from 'rxjs';
// import { catchError, switchMap, tap } from 'rxjs/operators';
// import { PageService } from 'src/app/services/page.service';
// import { UserService } from '../services/user.service';

@Injectable( {
    providedIn: 'root',
} )
export class ProPlusGuard implements CanActivate {
    isBrowser: boolean;

    constructor(
        // private readonly pageService: PageService,
        // private readonly userService: UserService,
        // private readonly router: Router,
        @Inject( PLATFORM_ID ) platformId: string
    ) {
        this.isBrowser = isPlatformBrowser( platformId );
    }

    canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        /* return this.pageService.fakePreload(state.url, '/proplus-login').pipe(
            switchMap((page) => {
                if (!this.isBrowser) {
                    return of(true);
                }

                this.pageService.forcePageLoading(true);

                return from(this.userService.getSessionInfo()).pipe(
                    switchMap((info) => {
                        if (info && this.userService.isLoggedIn) {
                            return of(true);
                        }

                        return throwError('Missing User Info');
                    }),
                    catchError((err) => {
                        console.error('ProPlus Guard', err);

                        this.router.navigate(['/proplus/login']);

                        return of(false);
                    }),
                    tap(() => {
                        this.pageService.forcePageLoading(false);
                    })
                );
            }),
            switchMap(() => {
                return from(this.userService.getCurrentUserPermission()).pipe(
                    switchMap(() => of(true))
                );
            })
        ); */
        return true;
    }
}
