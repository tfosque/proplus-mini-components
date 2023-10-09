import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import {
    SearchOption,
    SearchBarComponent,
} from '../../../../common-components/components/search-bar/search-bar.component';
import {
    Pagination,
    ApprovalOrder,
    SavedOrdersService,
} from '../../../services/saved-orders.service';
import { ConfirmationDialogComponent } from '../../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import {
    ShoppingCartService,
    Approver,
} from '../../../services/shopping-cart-service';
import { PendingOrderDataSource } from './pending-order-data-source';
import { UserService } from '../../../../pro-plus/services/user.service';
import { SevereError } from '../../../../common-components/classes/app-error';

@Component({
    selector: 'app-pending-order-summary',
    templateUrl: './pending-order-summary.component.html',
    styleUrls: ['./pending-order-summary.component.scss'],
})
export class PendingOrderSummaryComponent implements OnInit, OnDestroy {
    @ViewChild('searchBar',{static:true}) searchBar!: SearchBarComponent;

    public searchTypes: SearchOption[] = [
        { name: 'Order Name', type: 'search', fieldName: 'displayName' },
        { name: 'Account', type: 'search', fieldName: 'accountNumber' },
        {
            name: 'Created By',
            type: 'search',
            fieldName: 'createdUser.email',
        },
        { name: 'Submitted Date ', type: 'date', fieldName: 'submittedDate' },
    ];

    @ViewChild(MatSort,{static:true}) sort!: MatSort;
    @ViewChild(MatPaginator,{static:true}) paginator!: MatPaginator;
    displayedColumns: string[] = [
        'displayName',
        'accountNumber',
        // 'lastModifiedDate',
        // 'status',
        'createdUser',
        'submittedDate',
        // 'action',
    ];
    displayedColumnsMobile: string[] = ['displayName', 'action'];
    isLoading = true;
    pageInfo?: Pagination;
    reload$ = new BehaviorSubject(0);
    otherApprovers?: Approver[];
    selectedOtherApprover = '';
    private ordersSub!: Subscription;
    private sortSub!: Subscription;
    private searchSub!: Subscription;
    private clearSub!: Subscription;
    private comboSub!: Subscription;
    private pageInfoSub!: Subscription;
    myOrdersDisplayed = true;

    constructor(
        public readonly savedOrderSource: PendingOrderDataSource,
        public dialog: MatDialog,
        private readonly cartService: ShoppingCartService,
        private readonly _snackBar: MatSnackBar,
        private readonly savedOrdersService: SavedOrdersService,
        private readonly userService: UserService
    ) {}

    async ngOnInit() {
        try {
            //Verify that you have permissions
            const isApprove = this.userService.permissions.order.approve;
            if (!isApprove) {
                throw new SevereError('forbidden');
            }
            // TODO savedOrderSource and cnt
            this.ordersSub = this.savedOrderSource.orders$.subscribe(
                (orders) => {
                    this.updatePendingOrdersCnt(orders.length);
                }
            );
            this.isLoading = true;

            this.sortSub = this.sort.sortChange.subscribe(
                () => (this.paginator.pageIndex = 0)
            );

            const defaultSort = this.savedOrderSource.defaultSort;
            const defaultPageEvent = this.savedOrderSource.defaultPageEvent;
            const defaultSearchEvent = this.savedOrderSource.defaultSearchEvent;

            this.searchSub = this.searchBar.search.subscribe(() => {
                this.paginator.pageIndex = 0;
                this.paginator.page.next(defaultPageEvent);
            });
            this.clearSub = this.searchBar.clear.subscribe(() => {
                this.paginator.pageIndex = 0;
                this.paginator.page.next(defaultPageEvent);
            });

            const sortChange$ = this.sort.sortChange
                .asObservable()
                .pipe(startWith(defaultSort));
            const page$ = this.paginator.page
                .asObservable()
                .pipe(startWith(defaultPageEvent));
            const search$ = this.searchBar.search
                .asObservable()
                .pipe(startWith(defaultSearchEvent));
            const clearSearch$ = this.searchBar.clear
                .asObservable()
                .pipe(startWith(false));
            this.comboSub = combineLatest([
                sortChange$,
                page$,
                search$,
                clearSearch$,
                this.reload$,
            ]).subscribe(
                async (r) => {
                    const isLoggedIn = this.userService.isLoggedIn;
                    // console.log('user is logged in: ', isLoggedIn);
                    if (!isLoggedIn) return;
                    try {
                        this.isLoading = true;
                        const [sort, page, search, clear, reload] = r;
                        let filterSearch = search;
                        if (clear) {
                            filterSearch = {
                                fieldName: 'displayName',
                                option: '',
                                searchValue: '',
                            };
                        }
                        this.savedOrderSource.searchSavedOrders({
                            sort,
                            page,
                            search: filterSearch,
                            reload: reload,
                        });
                    } finally {
                        this.isLoading = false;
                    }
                },
                (err) => {
                    throw err;
                }
            );

            this.pageInfoSub = this.savedOrderSource.pageInfo$.subscribe(
                (p) => {
                    this.pageInfo = p;
                }
            );
            const otherApproverResponse =
                await this.cartService.getApproverList(true);
            this.otherApprovers = otherApproverResponse.result;
        } finally {
            this.triggerReload();
            this.isLoading = false;
        }
    }

    ngOnDestroy() {
        if (this.ordersSub) this.ordersSub.unsubscribe();
        if (this.sortSub) this.sortSub.unsubscribe();
        if (this.searchSub) this.searchSub.unsubscribe();
        if (this.clearSub) this.clearSub.unsubscribe();
        if (this.comboSub) this.comboSub.unsubscribe();
        if (this.pageInfoSub) this.pageInfoSub.unsubscribe();
    }

    // TODO
    updatePendingOrdersCnt(cnt: number) {
        this.savedOrdersService.updateSavedOrderListCnt(cnt);
    }

    askUserToConfirm<T>(config: {
        title: string;
        yesButton?: string;
        noButton?: string;
        question: string;
        whenYes: () => void;
    }) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                confimation: config.yesButton || 'Yes',
                no: config.noButton || 'No',
                question: config.question,
                title: config.title,
            },
        });
        dialogRef.afterClosed().subscribe(async (result: boolean) => {
            if (result) {
                config.whenYes();
            }
        });
    }

    showSnack(
        message: string,
        title: string = 'Close',
        duration: number = 3000
    ) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = duration;
        this._snackBar.open(message, title, config);
    }

    async deleteSavedOrder(savedOrder: ApprovalOrder) {
        this.askUserToConfirm({
            title: 'Delete Saved Order',
            question: 'Are you sure you want to delete this order?',
            yesButton: 'Delete',
            noButton: 'No',
            whenYes: async () => {
                try {
                    this.isLoading = true;
                    if (!savedOrder.id) {
                        throw new Error('Error deleting the saved order');
                    }
                    const response =
                        await this.savedOrdersService.deleteSavedOrder(
                            savedOrder.id
                        );
                    if (response.success) {
                        this.showSnack(
                            `Order ${savedOrder.displayName} deleted`,
                            'Close'
                        );
                        this.triggerReload();
                    }
                } finally {
                    this.isLoading = false;
                }
            },
        });
    }

    private triggerReload() {
        this.reload$.next(new Date().getTime());
    }

    selectOrder(order: ApprovalOrder): void {
        const title = 'Switch Account';
        const message = `Your current account will be changed to
        ${order.accountName} (${order.accountNumber}) and the cart will be deleted. Do you wish to continue?`;
        const url = ['/proplus/pending-orders/', order.id];

        // tslint:disable-next-line: no-floating-promises
        this.cartService.switchAccount(
            {
                accountLegacyId: order.accountNumber,
                accountName: order.accountName,
            },
            url,
            title,
            message
        );
    }

    searchClass(): string {
        if (this.otherApprovers && this.otherApprovers.length > 0) {
            return 'medium-8 small-12';
        } else {
            return 'medium-12 small-12';
        }
    }

    async otherApproverChange() {
        // console.log('selected other approver: ', this.selectedOtherApprover);
        if (!this.selectedOtherApprover) return;
        try {
            this.paginator.pageIndex = 0;
            // console.log('Loading');
            // TODO savedOrderSource and cnt
            this.savedOrderSource.orders$.subscribe((orders) => {
                // console.log({ orders });
                this.updatePendingOrdersCnt(orders.length);
            });
            this.isLoading = true;
            this.sort.sortChange.subscribe(
                () => (this.paginator.pageIndex = 0)
            );

            const defaultSort = this.savedOrderSource.defaultSort;
            const defaultPageEvent = this.savedOrderSource.defaultPageEvent;
            const defaultSearchEvent = this.savedOrderSource.defaultSearchEvent;

            this.searchBar.search.subscribe(() => {
                this.paginator.pageIndex = 0;
                this.paginator.page.next(defaultPageEvent);
            });
            this.searchBar.clear.subscribe(() => {
                this.paginator.pageIndex = 0;
                this.paginator.page.next(defaultPageEvent);
            });

            const sortChange$ = this.sort.sortChange
                .asObservable()
                .pipe(startWith(defaultSort));
            const page$ = this.paginator.page
                .asObservable()
                .pipe(startWith(defaultPageEvent));
            const search$ = this.searchBar.search
                .asObservable()
                .pipe(startWith(defaultSearchEvent));
            const clearSearch$ = this.searchBar.clear
                .asObservable()
                .pipe(startWith(false));
            combineLatest([
                sortChange$,
                page$,
                search$,
                clearSearch$,
                this.reload$,
            ]).subscribe(
                async (r) => {
                    try {
                        this.isLoading = true;
                        const [sort, page, search, clear, reload] = r;
                        let filterSearch = search;
                        if (clear) {
                            filterSearch = {
                                fieldName: 'displayName',
                                option: '',
                                searchValue: '',
                            };
                        }
                        this.savedOrderSource.searchSavedOrdersByApprover(
                            this.selectedOtherApprover,
                            {
                                sort,
                                page,
                                search: filterSearch,
                                reload: reload,
                            }
                        );
                    } finally {
                        this.isLoading = false;
                    }
                },
                (err) => {
                    throw err;
                }
            );

            this.savedOrderSource.pageInfo$.subscribe((p) => {
                this.pageInfo = p;
            });
        } finally {
            this.triggerReload();
            this.isLoading = false;
            this.myOrdersDisplayed = false;
            this.searchBar.selectedSearchOption = 'Order Name';
            this.searchBar.clear.next(true);
        }
    }

    async viewMyOrders() {
        this.searchBar.selectedSearchOption = 'Order Name';
        this.searchBar.clear.next(true);
        this.savedOrderSource.searchSavedOrders();
        this.myOrdersDisplayed = true;
        this.selectedOtherApprover = '';
    }
}
