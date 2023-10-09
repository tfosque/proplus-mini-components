import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AllPermissions } from '../services/UserPermissions';

@Injectable({
    providedIn: 'root'
})
export class ShippingFormGuard implements CanActivate {
    userPerm?: AllPermissions
    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) { }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        try {
            const info = await this.userService.getSessionInfo();
            this.userPerm = await this.userService.getCurrentUserPermission();

            if (info && this.userService.isLoggedIn) {
                if (!this.userPerm || !this.userPerm.order.checkoutShippingAddress) {
                    await this.router.navigate(['error'], {
                        queryParams: {
                            type: 'forbidden',
                        }
                    });
                    return false;
                } else {
                    return true;
                }
            } else {
                await this.router.navigate(['/proplus/login']);
                return false;
            }
        } catch (err) {
            console.error('Shipping Form Guard', err);
            await this.router.navigate(['/proplus/login']);
            return false;
        }
    }
}
