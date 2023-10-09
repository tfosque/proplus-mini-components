import { UserService } from './../../../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { RebateService } from '../../../../services/rebate.service';
import { RebateRedeemedSummaryItem } from '../../../../model/rebate-redeemed-summary';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-rebate-redeemed-summary',
    templateUrl: './rebate-redeemed-summary.component.html',
    styleUrls: ['./rebate-redeemed-summary.component.scss'],
})
export class RebateRedeemedSummaryComponent implements OnInit {
    dataSource: RebateRedeemedSummaryItem[] = [];
    displayedColumns: string[] = [
        'promotion',
        'brand',
        'invoicePeriod',
        'projectedRewards',
    ];
    selectedRowIndex = -1;
    rebatePermissions: any = {};
    view = new BehaviorSubject<boolean>(false);
    constructor(
        private readonly rebateService: RebateService,
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    async ngOnInit() {
        const response =
            await this.rebateService.getRebateRedeemedSummaryItems();
        if (this.userService.session && this.userService.session.userPermissions) {
            const perm = this.userService.session.userPermissions.computed;
            if (!perm) {
                this.router.navigate(['error'], {
                    queryParams: {
                        type: 'forbidden',
                    },
                });
                this.view.next(true);
            } else {
                this.rebatePermissions = perm.rebate;
                const { redeemedSummary } = this.rebatePermissions;
                if (!redeemedSummary) {
                    this.router.navigate(['error'], {
                        queryParams: {
                            type: 'forbidden',
                        },
                    });
                    this.view.next(true);
                }
            }
            if (response) {
                if (response.result) {
                    this.dataSource = response.result;
                }
            }
        }
    }

    highlight(row: any) {
        this.selectedRowIndex = row.id;
    }

    getRebateDetailLink(rebateId: string): string {
        return '/proplus/rebateRedeemed/detail/' + rebateId;
    }
}
