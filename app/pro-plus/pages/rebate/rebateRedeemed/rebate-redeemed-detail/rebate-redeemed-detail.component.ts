import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RebateService } from '../../../../services/rebate.service';
import { RebateRedeemedDetail } from '../../../../model/rebate-redeemed-detail';
import { RebateRedeemedSummaryItem } from '../../../../model/rebate-redeemed-summary';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { tap } from 'rxjs/operators';

import { UserService } from '../../../../services/user.service';
@Component({
    selector: 'app-rebate-redeemed-detail',
    templateUrl: './rebate-redeemed-detail.component.html',
    styleUrls: ['./rebate-redeemed-detail.component.scss'],
})
export class RebateRedeemedDetailComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    public rebateId = '';
    public rebateItemDetailSummary: RebateRedeemedSummaryItem = {};
    dataSource: RebateRedeemedDetail[] = [];
    displayedColumns: string[] = [
        'invoiceDate',
        'orderNumber',
        'category',
        'itemDescription',
        'quantityShipped',
        'uom',
        'salesAmount',
        'projectedPromotion',
    ];
    selectedRowIndex = -1;
    invoiceDate = '';
    searchTypes = [
        {
            name: 'Invoice Date',
            value: 'Invoice Date',
            type: 'date',
            fieldName: 'InvoiceDate',
            apiName: 'invoiceDate',
        },
        {
            name: 'Order Number',
            value: 'Order Number',
            type: 'search',
            fieldName: 'OrderNumber',
            apiName: 'orderNumber',
        },
        {
            name: 'Category',
            value: 'Category',
            type: 'search',
            fieldName: 'Category',
            apiName: 'category',
        },
        {
            name: 'Item Description',
            value: 'Item Description',
            type: 'search',
            fieldName: 'ItemDescription',
            apiName: 'itemDesc',
        },
    ];
    selectedSearchValue = 'Invoice Date';
    isLoading = true;
    isSearching = false;
    searchValue = '';
    totalCount = 0;
    pageNo = 0;
    get searchText() {
        return this.searchText$.value;
    }
    set searchText(newText: string) {
        this.searchText$.next(newText);
    }
    searchText$ = new BehaviorSubject<string>('');
    rebatePermissions: any = {};
    view = new BehaviorSubject<boolean>(false);
    constructor(
        private readonly route: ActivatedRoute,
        private readonly rebateService: RebateService,
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    async ngOnInit() {
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
                const { redeemedDetail } = this.rebatePermissions;
                if (!redeemedDetail) {
                    this.router.navigate(['error'], {
                        queryParams: {
                            type: 'forbidden',
                        },
                    });
                    this.view.next(true);
                }
            }
        }
        await this.getResult();
    }

    ngAfterViewInit() {
        this.paginator.page
            .pipe(tap(() => this.getResult(this.isSearching)))
            .subscribe();
    }

    private async getResult(withFilter = false) {
        const p: ParamMap = this.route.snapshot.paramMap;
        this.rebateId = p.get('rebateId') || '0';

        if(this.paginator !== undefined){
            this.pageNo = this.paginator.pageIndex;
        }else{
            this.pageNo = 0;
        }
        
        // const pageSize = this.paginator.pageSize;

        if (withFilter) {
            if (this.selectedSearchType) {
                if (this.selectedSearchType.type === 'date') {
                    this.searchValue =
                        this.invoiceDate === ''
                            ? ''
                            : this.formatDateForFilter(this.invoiceDate);
                } else {
                    this.searchValue = this.searchText;
                }
            }
        }

        const request: any = {
            rebateId: this.rebateId,
            searchKey:
                withFilter && this.searchValue !== ''
                    ? this.selectedSearch.apiName
                    : null,
            searchValue:
                withFilter && this.searchValue !== '' ? this.searchValue : null,
            pageNum: (this.pageNo + 1).toString(),
        };

        const response = await this.rebateService.getRebateRedeemedItemDetail(
            request
        );
        // console.log('request, ', request);
        if (response && response.result) {
            if (response.result.body) {
                // console.log('rebate redeemed item detail response', response);
                this.dataSource = response.result.body;

                // console.log('dataSource', this.dataSource);
            } else {
                this.dataSource = [];
            }
            this.rebateItemDetailSummary = response.result.header;
            this.totalCount = response.result.pagination.totalCount;
        }
    }

    highlight(row: any) {
        this.selectedRowIndex = row.id;
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
            apiName: t.apiName,
        };
    }

    private getSearchTypeInfo() {
        const info = this.searchTypes.find(
            (i) => i.value === this.selectedSearchValue
        );
        if (!info) {
            return {
                name: 'Job Name',
                value: 'Job Name',
                type: 'search',
                fieldName: 'JobName',
                options: undefined,
                apiName: 'jobName',
            };
        }
        return info;
    }

    async doSearch() {
        // await this.loadOrderHistory(true, this.filterQuery);
        // console.logconsole.log('filter: ', this.filterQuery);
        // console.log('Doing search', this.searchText$.value);
        try {
            this.isSearching = true;
            this.isLoading = true;
            this.paginator.pageIndex = 0;
            await this.getResult(true);
        } finally {
            this.isLoading = false;
        }
    }

    formatDateForFilter(d: string): string {
        try {
            const inputDate = moment(d);
            return inputDate.format('MM-DD-YYYY');
        } catch {
            return d;
        }
    }

    async clearSearch() {
        this.searchValue = '';
        this.selectedSearchValue = 'Invoice Date';
        this.isSearching = false;
        this.searchText$ = new BehaviorSubject<string>('');
        this.invoiceDate = '';
        this.paginator.pageIndex = 0;
        await this.getResult();
    }
}
