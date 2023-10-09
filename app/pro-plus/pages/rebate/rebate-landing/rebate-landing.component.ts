import { UserService } from './../../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { RebateService } from '../../../services/rebate.service';
import { RebateLanding } from '../../../model/rebate-landing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-rebate-landing',
    templateUrl: './rebate-landing.component.html',
    styleUrls: ['./rebate-landing.component.scss'],
})
export class RebateLandingComponent implements OnInit {
    public dataSource: RebateLanding[] = [];
    public rebatePermissions = {
        form: false,
        landing: false,
        redeemedDetail: false,
        redeemedSummary: false,
        submit: false,
    };
    // user can't submit
    internalUser = false;
    view = new BehaviorSubject<boolean>(false);
    noPerms= false;

    get isAccountClosed() {
        return this.user.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly router: Router,
        private readonly rebateService: RebateService,
        private readonly user: UserService
    ) {}

    async ngOnInit() {
        //const permission= this.user.session;
        //console.log(permission)
        if (this.user.session && this.user.session.userPermissions) {
            const perm = this.user.session.userPermissions.computed;
            //await this.user.getCurrentUserPermission();
            console.log(perm);
            if (!perm) {
                this.noPerms=true;
            } else {
                this.rebatePermissions = perm.rebate;
                const { landing } = this.rebatePermissions;
                if (!landing) {
                    this.noPerms=true;
                }
            }
            const response = await this.rebateService.getRebateLandingData();
            if (response) {
                if (response.result) {
                    this.dataSource = response.result;
                }
            }
        }
    }

    rebateLink(action: string, rebateName: string, rebateId: string): string {
        if (action.toUpperCase() === 'VIEW PROMOTION') {
            return '/proplus/rebateRedeemed/summary';
        } else {
            // if (rebateName.toUpperCase() === 'IKO BONUS REWARDS ELEVATED PROGRAM') {
            //   return '/proplus/rebate/form/iKO2020Pro4PromotionForm/' + rebateId;
            // } else {
            //   return '/proplus/rebate/form/ctContractorCashBackRebateForm/' + rebateId;
            // }
            return `/proplus/rebate/form/${rebateId}`;
        }
    }

    async viewRebateSummary(
        action: string,
        rebateName: string,
        rebateId: string
    ) {
        if (action.toUpperCase() === 'VIEW PROMOTION') {
            await this.router.navigate(['/proplus/rebateRedeemed/summary']);
        } else {
            await this.router.navigate([`/proplus/rebate/form/${rebateId}`]);
        }
    }
}
