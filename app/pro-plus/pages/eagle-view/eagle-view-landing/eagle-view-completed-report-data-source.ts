import { Injectable, EventEmitter } from '@angular/core';
import {
    EagleViewService
} from '../../../services/eagle-view.service';
import {
    EagleViewAccountReport,
    EagleViewAccountReportRequest,
    EagleViewAccountReportResult
} from '../../../model/eagle-view-report';
import {
    Pagination
} from '../../../services/saved-orders.service';
import { UserService } from '../../../services/user.service';
import { map, switchMap, debounceTime, filter } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { Observable, Subject } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from '../../../../common-components/components/search-bar/search-bar.component';
import { ApiResponse } from '../../../services/pro-plus-api-base.service';
import moment from 'moment';

type EagleViewReportSearch = {
    sort: Sort;
    page: PageEvent;
    search: SearchEvent;
    reload: number;
};

@Injectable({
    providedIn: 'root',
})
export class EagleViewDataSource implements DataSource<EagleViewAccountReport> {
    public readonly defaultSort: Sort = {
        active: 'DatePlaced',
        direction: 'desc',
    };
    public readonly defaultPageEvent: PageEvent = {
        length: 100,
        pageIndex: 0,
        pageSize: 5,
    };
    public readonly defaultSearchEvent: SearchEvent = {
        fieldName: 'ID',
        option: '',
        searchValue: '',
    };
    private readonly defaultSearch = {
        sort: this.defaultSort,
        page: this.defaultPageEvent,
        search: this.defaultSearchEvent,
        reload: new Date().getTime(),
    };
    public readonly searches$ = new EventEmitter<EagleViewReportSearch>();
    public readonly results$ = new Subject<
        ApiResponse<EagleViewAccountReportResult>
    >();
    public readonly orders$: Observable<EagleViewAccountReport[]>;
    public readonly pageInfo$: Observable<Pagination>;
    public readonly errorMessage$: Observable<string | null>;
    constructor(
        private readonly eagleViewService: EagleViewService,
        private readonly userService: UserService
    ) {
        this.userService.sessionBehavior.subscribe(async (u) => {
            if (!u.hasEVAccount) {
                return;
            }
        });
        const responses = this.results$.pipe(map((r) => r.result));
        this.orders$ = responses.pipe(
            map((r) => (r && r.ReportList ? r.ReportList : []))
        );
        this.pageInfo$ = responses.pipe(
            map((r) =>
                r
                    ? { totalCount: r.TotalOfReports, currentPage: 0, pageSize: 5 }
                    : { totalCount: 0, currentPage: 0, pageSize: 5 }
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
                filter(s => this.userService.isLoggedIn),
                debounceTime(100),
                switchMap((s) => {
                    const { sort, page, search } = s;
                    let searchTerm = (search.searchValue || '').toString();
                    const req: EagleViewAccountReportRequest = {
                        productsToFiterBy: [31],
                        statusesToFilterBy: ['5'],
                        subStatusToFilterBy: '',
                        fieldsToFilterBy: search.fieldName === 'ID' || search.fieldName === 'Address' ? [search.fieldName] : [],
                        textToFilterBy: search.fieldName === 'ID' || search.fieldName === 'Address' ? searchTerm : '',
                        sortBy: translateSort(sort.active) || '',
                        sortAscending: sort.direction === 'asc' ? true : false,
                    };
                    return this.eagleViewService.getEagleViewOrderReports(page.pageIndex + 1, page.pageSize, req);
                })
            )
            .subscribe((r) => {
                this.results$.next(r);
            });
    }

    public searchEagleViewReports(s: EagleViewReportSearch = this.defaultSearch) {
        this.searches$.emit(s);
    }

    connect(collectionViewer: CollectionViewer): Observable<EagleViewAccountReport[]> {
        this.searchEagleViewReports();
        return this.orders$;
    }

    disconnect(collectionViewer: CollectionViewer): void { }

    formatDateForFilter(d: string): string {
        try {
            const inputDate = moment(new Date(d));
            return inputDate.format('MM-DD-YYYY');
        } catch {
            return d;
        }
    }
}

function translateSort(sortName: string) {
    if (sortName && sortName.length > 0) {
        if (sortName === 'reportId') {
            return 'ID';
        } else if (sortName === 'dateCreated') {
            return 'DatePlaced';
        }
    }
    return sortName;
}

