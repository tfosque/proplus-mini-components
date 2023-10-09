import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
    Router,
} from '@angular/router';
import { CanActivate } from '@angular/router';
import { GetCurrentUserInfoResponse } from '../model/get-current-user-response';
import { UserService } from '../services/user.service';

@Injectable({
    providedIn: 'root',
})
export class UserAdminGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) { }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        try {
            const info = await this.userService.ensureCurrentUserInfo();
            const accessResult = canAccessUserAdmin(this.userService.isLoggedIn, info);
            if (accessResult === true) {
                return true;
            } else {
                await this.router.navigate(accessResult.path, {
                    queryParams: accessResult.queryParams
                });
                return false;
            }
        } catch (err) {
            console.error('User Admin Guard', err);
            await this.router.navigate(['/proplus/login']);
            return false;
        }
    }
}

export function canAccessUserAdmin(isLoggedIn: boolean, info: GetCurrentUserInfoResponse | null) {
    if (info && isLoggedIn) {
        if (info.roleType) {
            if (info.roleType === 'Site User') {
                return ({
                    path: ['error'],
                    queryParams: {
                        type: 'forbidden',
                    }
                });
            } else {
                return true;
            }
        } else {
            return ({
                path: ['error'],
                queryParams: {
                    type: 'forbidden',
                }
            });
        }
    } else {
        return {
            path: ['/proplus/login']
        };
    }
}
