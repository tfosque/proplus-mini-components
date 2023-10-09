import { Injectable, EventEmitter } from '@angular/core';
import {
    SavedOrdersService,
    ApprovalOrder,
    GetOrderApprovalListRequest,
    GetOrderApprovalListResponse,
    Pagination,
} from '../../services/saved-orders.service';
import { UserService } from '../../services/user.service';
import { map, switchMap, debounceTime, filter } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { Observable, Subject } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { SearchEvent } from '../../../common-components/components/search-bar/search-bar.component';
import { ApiResponse } from '../../services/pro-plus-api-base.service';
import moment from 'moment';

type SavedOrderSearch = {
    sort: Sort;
    page: PageEvent;
    search: SearchEvent;
    reload: number;
};

@Injectable({
    providedIn: 'root',
})
export class SavedOrderDataSource implements DataSource<ApprovalOrder> {
    public readonly defaultSort: Sort = {
        active: 'creationDate',
        direction: 'desc',
    };
    public readonly defaultPageEvent: PageEvent = {
        length: 100,
        pageIndex: 0,
        pageSize: 10,
    };
    public readonly defaultSearchEvent: SearchEvent = {
        fieldName: 'displayName',
        option: '',
        searchValue: '',
    };
    private readonly defaultSearch = {
        sort: this.defaultSort,
        page: this.defaultPageEvent,
        search: this.defaultSearchEvent,
        reload: new Date().getTime(),
    };
    public readonly searches$ = new EventEmitter<SavedOrderSearch>();
    public readonly results$ = new Subject<
        ApiResponse<GetOrderApprovalListResponse>
    >();
    public readonly orders$: Observable<ApprovalOrder[]>;
    public readonly pageInfo$: Observable<Pagination>;
    public readonly errorMessage$: Observable<string | null>;
    constructor(
        private readonly savedOrder: SavedOrdersService,
        private readonly userService: UserService
    ) {
        const responses = this.results$.pipe(map((r) => r.result));
        this.orders$ = responses.pipe(
            map((r) => (r && r.orders ? r.orders : []))
        );
        this.pageInfo$ = responses.pipe(
            map((r) =>
                r && r.pagination
                    ? r.pagination
                    : { totalCount: 0, currentPage: 0, pageSize: 10 }
            )
        );
        this.errorMessage$ = this.results$.pipe(
            map((r) => (r.messages && r.messages ? r.messages[0].value : null))
        );

        this.connectToBackend();
    }
    private connectToBackend() {
        this.searches$
            .pipe(
                filter((s) => this.userService.isLoggedIn),
                debounceTime(100),
                switchMap((s) => {
                    const { sort, page, search } = s;
                    let searchTerm = (search.searchValue || '').toString();
                    if (
                        searchTerm !== '' &&
                        (search.fieldName === 'creationDate' ||
                            search.fieldName === 'lastModifiedDate' ||
                            search.fieldName === 'submittedDate')
                    ) {
                        searchTerm = this.formatDateForFilter(searchTerm);
                    }
                    const req: Partial<GetOrderApprovalListRequest> = {
                        approverId: '',
                        currentPage: page.pageIndex,
                        pageSize: page.pageSize,
                        sortBy: sort.active || '',
                        sortType: sort.direction || undefined,
                        searchBy: search.fieldName,
                        searchTerm: searchTerm,
                    };
                    return this.savedOrder.getOrderApprovalList(req);
                })
            )
            .subscribe((r) => {
                this.results$.next(r);
            });
    }

    public searchSavedOrders(s: SavedOrderSearch = this.defaultSearch) {
        this.searches$.emit(s);
    }

    connect(collectionViewer: CollectionViewer): Observable<ApprovalOrder[]> {
        this.searchSavedOrders();
        return this.orders$;
    }

    disconnect(collectionViewer: CollectionViewer): void {}

    formatDateForFilter(d: string): string {
        try {
            const inputDate = moment(new Date(d));
            return inputDate.format('MM-DD-YYYY');
        } catch {
            return d;
        }
    }
}
