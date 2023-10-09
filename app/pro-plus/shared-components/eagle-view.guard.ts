import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
    Router,
} from '@angular/router';
import { CanActivate } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
    providedIn: 'root',
})
export class EagleViewGuard implements CanActivate {
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

            // if (this.userService.isLoggedIn) {
            //   return true;
            // }

            if (info && this.userService.isLoggedIn) {
                const userEVPurchaseStatus = this.userService.sessionInfo ? 
                    this.userService.sessionInfo.profileEagleViewPurchaseStatus || false : false;
                let acctEVPurchaseStatus = false;
                const accountResponse = await this.userService.getAccounts();
                const accountList = accountResponse
                    ? accountResponse.accounts
                    : [];
                const accountId = this.userService.lastSelectedAccount 
                    ? this.userService.lastSelectedAccount.accountLegacyId 
                    : '0';
                const currentAccounts = accountList.filter(a => a.accountLegacyId === accountId);
                if (currentAccounts.length > 0) {
                    acctEVPurchaseStatus =  currentAccounts[0].accountEagleViewPurchaseStatus || false;
                }
                if (this.userService.lastSelectedAccount && this.userService.lastSelectedAccount.cashAccount) {
                    await this.router.navigate(['error'], {
                        queryParams: {
                            type: 'account-setup',
                        },
                    });
                    return false;
                } else if (!acctEVPurchaseStatus) {
                    await this.router.navigate(['error'], {
                        queryParams: {
                            type: 'account-setup',
                        },
                    });
                    return false;
                } else if (!userEVPurchaseStatus) {
                    await this.router.navigate(['error'], {
                        queryParams: {
                            type: 'no-ev-access',
                        },
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
            console.error('EagleView Guard', err);
            await this.router.navigate(['/proplus/login']);
            return false;
        }
    }
}
