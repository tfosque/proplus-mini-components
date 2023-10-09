import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FilterBy } from '../../model/quote-request';
import { QuoteService } from '../../services/quote-service';
import { QuoteBrowseResponse } from '../../model/quote-browse-response';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UserService } from '../../services/user.service';
import { SevereError } from '../../../common-components/classes/app-error';

@Component({
    selector: 'app-quote-summary',
    templateUrl: './quote-summary.component.html',
    styleUrls: ['./quote-summary.component.scss'],
})
export class QuoteSummaryComponent implements OnInit {
    accountId: any;
    response: QuoteBrowseResponse | null = null;
    isLoading = true;
    private _filterBy: FilterBy = 'quoteId';
    public get filterBy(): FilterBy {
        return this._filterBy;
    }
    public set filterBy(value: FilterBy) {
        this._filterBy = value;
        this.filter = '';
    }
    get isAccountClosed() {
        return this.user.isLastSelectedAccountClosed;
    }
    types = [
        { value: 'quoteId', text: 'Quote Id' },
        { value: 'quoteName', text: 'Quote Name' },
        { value: 'creationDate', text: 'Created Date' },
        { value: 'status', text: 'Status' },
    ];
    statusSelect = [
        { value: 'Open', text: 'Open' },
        { value: 'InProgress', text: 'In Progress' },
        { value: 'Revised', text: 'Revised' },
        { value: 'Ready for Review', text: 'Ready for Review' },
        { value: 'Approved', text: 'Approved' },
        { value: 'Closed', text: 'Closed' },
    ];
    filter = '';
    quoteStatus = '';

    constructor(
        private readonly quoteService: QuoteService,
        private readonly router: Router,
        public dialog: MatDialog,
        private readonly route: ActivatedRoute,
        private readonly user: UserService
    ) {}
    async ngOnInit() {
        try {
            const perm = await this.user.getCurrentUserPermission();
            if (!perm || !perm.quote.queryList) {
                throw new SevereError('forbidden');
            }
            const p: ParamMap = this.route.snapshot.paramMap;
            const account = p.get('accountId') || '0';
            this.accountId = account;
            const pageSize = 5;
            const pageNo = 0;
            const orderBy = 'creationDate desc';
            this.response = await this.quoteService.getQuotes({
                account,
                pageNo,
                pageSize,
                orderBy,
            });

            const queryParams = this.route.snapshot.queryParams;
            if (queryParams && queryParams['active']) {
                this.quoteStatus = queryParams['active'];
            }
        } finally {
            this.isLoading = false;
        }
    }
    async redirectNew() {
        await this.router.navigateByUrl(
            `/proplus/accounts/${this.accountId}/quotes/new-quote`
        );
    }

    async searchQuotes() {
        try {
            this.isLoading = true;
            const filterBy = this.filterBy;
            const filter = this.filter;
            const pageSize = 5;
            const pageNo = 0;
            const account = this.accountId;
            this.response = await this.quoteService.getQuotes({
                account,
                pageNo,
                pageSize,
                filterBy,
                filter,
            });
        } finally {
            this.isLoading = false;
        }
    }

    getActiveTab() {
        if (this.quoteStatus) {
            if (this.quoteStatus === 'draft') {
                return 0;
            } else if (this.quoteStatus === 'inProcess') {
                return 1;
            } else {
                return 2;
            }
        } else {
            return 2;
        }
    }

    translateTab(index: number) {
        if (index === 0) {
            return 'draft';
        } else if (index === 1) {
            return 'inProcess';
        } else {
            return 'received';
        }
    }

    async tabChanged(evt: MatTabChangeEvent) {
        await this.router.navigate(
            [`/proplus/accounts`, this.accountId, `quotes`],
            {
                queryParams: {
                    active: this.translateTab(evt.index),
                },
            }
        );
    }
}
