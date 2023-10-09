import { ShoppingCartService } from './../../services/shopping-cart-service';
import { UserNotifierService } from './../../../common-components/services/user-notifier.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CurrentUser } from '../../model/get-current-user-response';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AccountDetails } from '../../model/account-with-branch';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
    isLoading = true;
    dataSource = new MatTableDataSource<AccountDetails>([]);
    displayedColumns: string[] = ['accountName', 'branch', 'accountLegacyId'];
    displayedColumnsMobile: string[] = ['accountName'];
    error: any;
    currentAccount!: String | undefined;
    constructor(
        private readonly user: UserService,
        public readonly userNotifier: UserNotifierService,
        public readonly cartService: ShoppingCartService
    ) {}

    @ViewChild(MatSort) sort?: MatSort;
    @ViewChild(MatPaginator) paginator?: MatPaginator;

    userInfo: CurrentUser | null = null;

    async ngOnInit() {
        try {
            this.isLoading = true;
            if (this.sort) {
                this.dataSource.sort = this.sort;
            }
            if (this.paginator) {
                this.dataSource.paginator = this.paginator;
            }

            this.userInfo = await this.user.getSessionInfo();
            if (this.userInfo) {
                this.currentAccount = `${this.userInfo.lastSelectedAccount.accountLegacyId}
        (${this.userInfo.lastSelectedAccount.accountName})`;
            } else {
                this.currentAccount = 'No Account Selected';
            }
            const response = await this.user.ensureGetAccounts();
            this.dataSource.data = response.accounts;
        } catch (error) {
            this.error = error;
        } finally {
            this.isLoading = false;
        }
    }
    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    async viewQuote(account: AccountDetails) {
        await this.cartService.switchAccount(account, [
            '/proplus/accounts',
            account.accountLegacyId,
            'quotes',
        ]);
    }
    async viewOrder(account: AccountDetails) {
        await this.cartService.switchAccount(account, [
            '/proplus/accounts',
            account.accountLegacyId,
            'orders',
        ]);
    }
    async switchAccount(account: AccountDetails) {
        await this.cartService
            .switchAccount(account, ['/proplus/accounts'])
            .then((x) => {
                this.currentAccount = `${account.accountLegacyId} (${account.accountName})`;
            });
    }
}
