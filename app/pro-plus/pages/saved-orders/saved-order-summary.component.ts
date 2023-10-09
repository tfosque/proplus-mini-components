import { Component, OnInit, ViewChild } from '@angular/core';
import { SavedOrderDataSource } from './saved-order-data-source';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import {
    SearchOption,
    SearchBarComponent,
} from '../../../common-components/components/search-bar/search-bar.component';
import {
    Pagination,
    ApprovalOrder,
    SavedOrdersService,
} from '../../services/saved-orders.service';
import { ConfirmationDialogComponent } from '../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-saved-orders',
    templateUrl: './saved-order-summary.component.html',
    styleUrls: ['./saved-order-summary.component.scss'],
})
export class SavedOrderSummaryComponent implements OnInit {
    @ViewChild('searchBar',{static:true}) searchBar!: SearchBarComponent;

    public searchTypes: SearchOption[] = [
        { name: 'Order Name', type: 'search', fieldName: 'displayName' },
        {
            name: 'Status',
            type: 'options',
            fieldName: 'status',
            options: this.approverPermission
                ? [
                      {
                          name: 'Pending Submission',
                          value: 'READY_FOR_SUBMISSION',
                      },
                      { name: 'Rejected', value: 'REJECTED_ORDER' },
                  ]
                : [
                      {
                          name: 'Pending Submission',
                          value: 'READY_FOR_SUBMISSION',
                      },
                      { name: 'Rejected', value: 'REJECTED_ORDER' },
                      { name: 'Pending Approval', value: 'READY_FOR_APPROVAL' },
                  ],
        },
        { name: 'Account', type: 'search', fieldName: 'accountNumber' },
        { name: 'Created Date', type: 'date', fieldName: 'creationDate' },
        {
            name: 'Created User Name',
            type: 'search',
            fieldName: 'createdUser.name',
        },
        {
            name: 'Created User Email',
            type: 'search',
            fieldName: 'createdUser.email',
        },
        {
            name: 'LastModified Date',
            type: 'date',
            fieldName: 'lastModifiedDate',
        },
        {
            name: 'LastModified User Name',
            type: 'search',
            fieldName: 'lastModifiedUser.name',
        },
        {
            name: 'LastModified User Email',
            type: 'search',
            fieldName: 'lastModifiedUser.email',
        },
        { name: 'Submitted Date ', type: 'date', fieldName: 'submittedDate' },
        {
            name: 'Submitted User Name',
            type: 'search',
            fieldName: 'submittedUser.name',
        },
        {
            name: 'Submitted User Email',
            type: 'search',
            fieldName: 'submittedUser.email',
        },
    ];

    @ViewChild(MatSort,{static:true}) sort!: MatSort;
    @ViewChild(MatPaginator,{static:true}) paginator!: MatPaginator;
    displayedColumns: string[] = [
        'displayName',
        'accountNumber',
        'lastModifiedDate',
        'status',
        'creationDate',
        'submittedDate',
        'action',
    ];
    displayedColumnsMobile: string[] = ['displayName', 'action'];
    isLoading = true;
    pageInfo?: Pagination;
    reload$ = new BehaviorSubject(0);
    orderCount: number = 0;

    public get approverPermission() {
        return this.userService.permissions.order.approve;
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        public readonly savedOrderSource: SavedOrderDataSource,
        public dialog: MatDialog,
        private readonly cartService: ShoppingCartService,
        private readonly _snackBar: MatSnackBar,
        private readonly savedOrdersService: SavedOrdersService,
        private readonly userService: UserService
    ) {}

    async ngOnInit() {
        try {
            // console.log('Loading');
            this.isLoading = true;

            this.sort.sortChange.subscribe(
                () => (this.paginator.pageIndex = 0)
            );
            this.sort.active = 'creationDate';
            this.sort.direction = 'desc';

            const defaultSort = this.savedOrderSource.defaultSort;
            const defaultPageEvent = this.savedOrderSource.defaultPageEvent;
            const defaultSearchEvent = this.savedOrderSource.defaultSearchEvent;

            this.searchBar.search.subscribe(() => {
                this.paginator.pageIndex = 0;
                this.paginator.page.next({
                    length: defaultPageEvent.length,
                    pageIndex: defaultPageEvent.pageIndex,
                    pageSize:
                        this.paginator.pageSize || defaultPageEvent.pageSize,
                });
            });
            this.searchBar.clear.subscribe(() => {
                this.paginator.pageIndex = 0;
                this.paginator.page.next({
                    length: defaultPageEvent.length,
                    pageIndex: defaultPageEvent.pageIndex,
                    pageSize:
                        this.paginator.pageSize || defaultPageEvent.pageSize,
                });
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
                        sort.direction = this.sort.direction || 'asc';
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

            this.savedOrderSource.pageInfo$.subscribe((p) => {
                this.pageInfo = p;
            });
            this.savedOrderSource.results$.subscribe((v) => {
                if (v.result && v.result.pagination) {
                    this.orderCount = v.result.pagination.totalCount;
                } else {
                    this.orderCount = 100;
                }
            });
        } finally {
            this.triggerReload();
            this.isLoading = false;
        }
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
                    const response = await this.savedOrdersService.deleteSavedOrder(
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
        const url = ['/proplus/saved-orders/', order.id];

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
}
