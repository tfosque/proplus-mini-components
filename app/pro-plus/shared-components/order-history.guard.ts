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
import { AllPermissions } from '../services/UserPermissions';

@Injectable({
    providedIn: 'root',
})
export class OrderHistoryGuard implements CanActivate {
    userPerm?: AllPermissions
    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        try {
            const info = await this.userService.getSessionInfo();
            this.userPerm = await this.userService.getCurrentUserPermission();
            const accessResult = canAccessOrderHistory(this.userService.isLoggedIn, info, this.userPerm);
            if (accessResult === true) {
                return true;
            } else {
                this.userService.loginWithProduct( state.url );
                await this.router.navigate(accessResult.path, {
                    queryParams: accessResult.queryParams
                });
                return false;
            }
        } catch (err) {
            console.error('Order History Guard', err);
            this.userService.loginWithProduct( state.url );
            await this.router.navigate(['/proplus/login']);
            return false;
        }
    }
}

export function canAccessOrderHistory(isLoggedIn: boolean, info: GetCurrentUserInfoResponse | null, 
    userPerm: AllPermissions | undefined) {
        if (info && isLoggedIn) {
            if (!userPerm || !userPerm.orderhistory.queryList) {
                return({
                    path: ['error'],
                    queryParams: {
                        type: 'forbidden',
                    }
                });
            } else {
                return true;
            }
        } else {
            return { 
                path: ['/proplus/login']
            };
        }
    }
