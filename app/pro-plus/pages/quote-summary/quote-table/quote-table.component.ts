import {
    Component,
    OnInit,
    ViewChild,
    Input,
    AfterViewInit,
} from '@angular/core';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { QuoteDataSource } from '../quote-data-source';
import { QuoteType, FilterBy } from '../../../model/quote-request';
import { QuoteService } from '../../../services/quote-service';
import {
    QuoteBrowseResponse,
    QuoteListItem,
} from '../../../model/quote-browse-response';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
import { DeleteDraftQuoteComponent } from './delete-draft-quote/delete-draft-quote.component';
import { ParamMap, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { UserService } from '../../../services/user.service';

type LookupFieldName =
    | 'quoteId'
    | 'quoteName'
    | 'creationDate'
    | 'quoteStatus'
    | 'createdBy';

@Component({
    selector: 'app-quote-table',
    templateUrl: './quote-table.component.html',
    styleUrls: ['./quote-table.component.scss'],
})
export class QuoteTableComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort!: MatSort;
    dataSource!: QuoteDataSource;
    displayedColumns: string[] = [
        'quoteId',
        'quoteName',
        'creationDate',
        'quoteStatus',
        'createdBy',
        'createdByDate',
        'action',
    ];
    displayedColumnsMobile: string[] = [
        'quoteId',
        'quoteStatus',
        'createdByDate',
        'action',
    ];
    @Input() dataType!: 'receivedQuote' | 'inProcessQuote' | 'draftQuote';
    @Input() response!: QuoteBrowseResponse;
    @Input() title = '';
    @Input() accountId!: number;
    quotes!: QuoteListItem[];
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    isLoading = true;
    searchTypes = [
        {
            name: 'Quote Name',
            value: 'Quote Name',
            type: 'search',
            fieldName: 'quoteName',
        },
        {
            name: 'Quote ID',
            value: 'Quote ID',
            type: 'search',
            fieldName: 'quoteId',
        },
        {
            name: 'Created Date',
            value: 'Created Date',
            type: 'date',
            fieldName: 'creationDate',
        },
        {
            name: 'Status',
            value: 'Status',
            type: 'options',
            fieldName: 'status',
            options: [
                { name: 'Open' },
                { name: 'InProgress' },
                { name: 'Revised' },
                { name: 'Ready for Review' },
                { name: 'Approved' },
                { name: 'Closed' },
            ],
        },
    ];
    searchText$ = new BehaviorSubject<string>('');
    selectedSearchValue = 'Quote Name';
    selectedOption = 'Open';
    createdDate = '';
    isFiltering = false;
    filterValue = '';

    get isEmpty() {
        return !this.quotes?.length;
    }

    get orderBy() {
        const lookup = {
            quoteId: 'quoteId',
            quoteName: 'quoteName',
            creationDate: 'creationDate',
            quoteStatus: 'status',
            createdBy: 'createdBy',
            createdByDate: 'creationDate',
        };
        const direction = this.sort?.direction;
        const active = this.sort?.active as LookupFieldName;
        const fieldName = lookup[active] || 'quoteId';
        return `${fieldName} ${direction || 'asc'}`;
    }

    get quoteTypeDesc() {
        if (this.dataType === 'receivedQuote') {
            return 'received quotes';
        }
        if (this.dataType === 'inProcessQuote') {
            return 'quotes in process';
        }
        if (this.dataType === 'draftQuote') {
            return 'draft quotes';
        }
        return '';
    }

    get quoteType(): QuoteType {
        if (this.dataType === 'receivedQuote') {
            return 'received';
        }
        if (this.dataType === 'inProcessQuote') {
            return 'inProcess';
        }
        if (this.dataType === 'draftQuote') {
            return 'draft';
        }
        return 'draft';
    }

    get searchText() {
        return this.searchText$.value;
    }

    set searchText(newText: string) {
        this.searchText$.next(newText);
    }

    get selectedSearchType() {
        return this.searchTypes.find(
            (i) => i.value === this.selectedSearchValue
        );
    }

    get selectedSearch() {
        const t = this.getSearchTypeInfo();
        return {
            value: this.selectedSearchValue,
            type: t.type,
            options: t.options || [],
        };
    }

    private getSearchTypeInfo() {
        const info = this.searchTypes.find(
            (i) => i.value === this.selectedSearchValue
        );
        if (!info) {
            return {
                name: 'Quote Name',
                value: 'Quote Name',
                type: 'search',
                fieldName: 'quoteName',
                options: undefined,
            };
        }
        return info;
    }

    getFilterField() {
        const searchTypeInfo = this.getSearchTypeInfo();
        return searchTypeInfo.name;
    }

    get filterQuery(): QuoteFilter {
        const t = this.getSearchTypeInfo();
        if (t.type === 'search') {
            return {
                filter: this.searchText,
                filterBy: t.fieldName as FilterBy,
            };
        } else if (t.type === 'options') {
            return {
                filter: this.selectedOption,
                filterBy: t.fieldName as FilterBy,
            };
        } else if ((t.type = 'date')) {
            return {
                filter:
                    this.createdDate === ''
                        ? ''
                        : this.formatDateForFilter(this.createdDate),
                filterBy: t.fieldName as FilterBy,
            };
        }
        return { filter: '', filterBy: '' as FilterBy };
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private route: ActivatedRoute,
        private readonly _snackBar: MatSnackBar,
        public deleteItemDialog: MatDialog,
        private readonly quoteService: QuoteService,
        private readonly userService: UserService
    ) {}

    async ngOnInit() {
        try {
            this.isLoading = true;
            const p: ParamMap = this.route.snapshot.paramMap;
            const account = p.get('accountId') || '0';
            const pageSize = 10;
            const pageNo = 0;
            const orderBy = 'creationDate desc';

            if (this.sort) {
                this.sort.active = 'creationDate';
                this.sort.direction = 'desc';
            }

            this.response = await this.quoteService.getQuotes({
                account,
                pageNo,
                pageSize,
                orderBy,
            });
            // this.dataSource.sort = this.sort;
            const quotes = this.response[this.dataType];
            if (this.dataType === 'draftQuote') {
                const quoteIdSearchType = this.searchTypes.find(
                    (st) => st.fieldName === 'quoteId'
                );
                if (quoteIdSearchType) {
                    const quoteIdIndex = this.searchTypes.indexOf(
                        quoteIdSearchType,
                        0
                    );
                    this.searchTypes.splice(quoteIdIndex, 1);
                    this.selectedSearchValue = 'Quote Name';
                }
            }
            this.dataSource = new QuoteDataSource(
                this.accountId,
                this.quoteType,
                this.quoteService,
                quotes
            );
            this.dataSource.quotes$.subscribe((q) => {
                this.quotes = q.quoteList;
            });
        } finally {
            this.isLoading = false;
        }
    }
    ngAfterViewInit() {
        if (this.sort) {
            this.sort?.sortChange.subscribe(
                () => (this.paginator.pageIndex = 0)
            );

            merge(this.sort?.sortChange, this.paginator.page)
                .pipe(
                    tap(() =>
                        this.loadQuotes(
                            this.isFiltering,
                            this.isFiltering
                                ? this.filterQuery
                                : { filter: '', filterBy: '' }
                        )
                    )
                )
                .subscribe();
        }
    }

    openDialogOneItem(element: any) {
        const dialogRef = this.deleteItemDialog.open(DeleteDraftQuoteComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await this.deleteQuote(element);
                await this.loadQuotes(
                    this.isFiltering,
                    this.isFiltering
                        ? this.filterQuery
                        : { filter: '', filterBy: '' }
                );
            }
        });
    }

    async deleteQuote(quote: any) {
        try {
            this.isLoading = true;
            const request = {
                quoteId: quote.quoteId,
            };
            const response = await this.quoteService.deleteQuote(request);
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            if (response.success) {
                this._snackBar.open(
                    `Quote ${quote.quoteName} deleted`,
                    'Close',
                    config
                );
            } else {
                this._snackBar.open(
                    `${response.messages[0].value}`,
                    'Close',
                    config
                );
            }
        } finally {
            this.isLoading = false;
        }
    }

    private async loadQuotes(useFilter: boolean, filter: QuoteFilter) {
        this.isLoading = true;
        try {
            const pageNo = this.paginator.pageIndex;
            const pageSize = this.paginator.pageSize;
            const orderBy = this.orderBy;
            const quoteFilter = filter.filter;
            const filterBy = filter.filterBy;
            // const filter = `UPPER(PurchaseOrderNumber) like UPPER('%${enteredSearchText}%')`;
            await this.dataSource.loadQuotes(
                pageNo,
                pageSize,
                quoteFilter,
                orderBy,
                filterBy
            );
        } finally {
            this.isLoading = false;
        }
    }

    get quoteCount() {
        if (!this.dataSource) {
            return 0;
        }
        const quotes$ = this.dataSource.quotes$;
        if (!quotes$) {
            return 0;
        }
        if (!quotes$.value) {
            return 0;
        }
        if (!quotes$.value.pagination) {
            return 0;
        }
        if (!quotes$.value.pagination.totalCount) {
            return 0;
        }
        return quotes$.value.pagination.totalCount;
    }

    async doSearch() {
        this.isFiltering = true;
        const quoteFilter = this.filterQuery;
        this.filterValue = quoteFilter.filter;
        this.paginator.pageIndex = 0;

        await this.loadQuotes(true, quoteFilter);
    }

    formatDateForFilter(d: string): string {
        try {
            const inputDate = moment(d);
            return inputDate.format('MM-DD-YYYY');
        } catch {
            return d;
        }
    }

    async clearFilter() {
        this.filterValue = '';
        this.selectedSearchValue =
            this.dataType === 'draftQuote' ? 'Quote Name' : 'Quote ID';
        this.isFiltering = false;
        this.searchText$ = new BehaviorSubject<string>('');
        this.createdDate = '';
        this.paginator.pageIndex = 0;
        this.applyFilter('');

        await this.loadQuotes(false, { filter: '', filterBy: '' });
    }

    applyFilter(filterValue: string) {
        this.searchText$.next(filterValue);
    }
}

export interface QuoteFilter {
    filter: string;
    filterBy: FilterBy;
}
