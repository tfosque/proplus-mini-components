import { CustomItemDialogComponent } from './custom-item-dialog/custom-item-dialog.component';
import { states, State } from './../../../global-classes/states';
import {
    Component,
    OnInit,
    ViewChild,
    TemplateRef,
    OnDestroy,
} from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import {
    QuoteService,
    CreateItemsRequest,
    DeleteItemsRequest,
    UpdateQuoteRequest,
    CreateQuoteRequest,
    UpdateItemsRequest,
    QuoteItemRequest,
    NewItemCreateQuoteItemRequest,
    DeleteQuoteRequest,
    RejectQuoteRequest,
    ReviseQuoteRequest,
} from '../../services/quote-service';
import { UserNotifierService } from '../../../../app/common-components/services/user-notifier.service';
import { UserService } from '../../services/user.service';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import {
    QuoteResponse,
    QuoteItem,
    NewQuoteItem,
} from '../../model/quote-response';
import {
    FormControl,
    Validators,
    FormGroupDirective,
    NgForm,
} from '@angular/forms';
import {
    ProductsService,
    ProductDetailsResponse,
} from '../../services/products.service';
import { Location } from '@angular/common';
import { JobResponse } from '../../model/job-response';
import { Quote } from '../../model/QuoteModel';
import { DeleteDraftQuoteComponent } from '../quote-summary/quote-table/delete-draft-quote/delete-draft-quote.component';
import { DialogContentComponent } from '../beacon-dialog/dialog-content/dialog-content.component';
import { AppError, ApiError } from '../../../common-components/classes/app-error';
import * as xlsx from 'xlsx';
import he from 'he';
import moment from 'moment';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched || isSubmitted)
        );
    }
}

/* interface DialogQuote {
  id: string;
  [key: string]: any;
} */

@Component({
    selector: 'app-quote-detail',
    templateUrl: './quote-detail.component.html',
    styleUrls: ['./quote-detail.component.scss'],
})
export class QuoteDetailComponent implements OnInit, OnDestroy {
    @ViewChild('viewSubmitReq')
    viewSubmitReq?: TemplateRef<DialogContentComponent>;
    @ViewChild('copyQuoteModal')
    copyQuoteModal?: TemplateRef<DialogContentComponent>;
    @ViewChild('RejectQuote')
    RejectQuote?: TemplateRef<DialogContentComponent>;
    @ViewChild('reviseQuoteModal')
    reviseQuoteModal?: TemplateRef<DialogContentComponent>;

    /* dropdown */
    public selected = 'downloadAs';
    public downloadTypes = ['pdf', 'doc', 'txt', 'Download As'];

    public quote: Quote = {
        quoteId: 'new',
        quoteItems: [],
        status: '',
        quoteName: '',
        city: '',
        jobAccount: {
            jobName: '',
            jobNumber: '',
        },
        phone: '',
        address1: '',
        address2: '',
        state: '',
        workType: '',
        quoteNote: '',
        created: '',
        createdBy: '',
        lastModified: '',
        addtionalQuoteItems: [],
        gst: 0,
        otherCharges: 0,
        subTotal: 0,
        tax: 0,
        total: 0,
        standardQuoteItems: [],
    };

    copyQuoteName = '';
    dataSource = new MatTableDataSource<QuoteItem>();
    private isLoading = true;
    public quoteExpires = '';

    /* Dialog Props */
    public displayColumns: string[] = ['product', 'detail', 'unit', 'qty'];
    public dataSourceDialog?: QuoteItem[] = [];
    public dataSourceAddItmes?: QuoteItem[] = [];

    public quoteDetail?: QuoteResponse;
    public quoteDetailAtg?: QuoteResponse;

    public isEditing = false;

    stateFormControl = new FormControl('', [Validators.required]);
    cityFormControl = new FormControl('', [Validators.required]);
    zipFormControl = new FormControl('', [Validators.required]);
    phoneFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9-]*$/),
        Validators.minLength(10),
    ]);
    quoteFormControl = new FormControl('', [Validators.required]);
    workFormControl = new FormControl('', [Validators.required]);
    jobFormControl = new FormControl('', [Validators.required]);

    matcher = new MyErrorStateMatcher();
    submittingQuote = false;

    displayedColumns2: string[] = ['orderSummary', 'empty'];
    displayedColumnsRequest: string[] = ['product', 'detail', 'unit', 'qty'];
    displayedColumnsAdditionalItemsDialog: string[] = ['detail', 'qty'];
    states: State[] = states;
    config: MatSnackBarConfig = {
        verticalPosition: 'top',
        duration: 4000,
    };
    newQuote!: boolean;
    quoteId!: string | null;

    rejectionValue = '';
    rejectionReasons = [
        { value: 'Pricing is too high', key: 'Pricing is too high' },
        { value: 'Lost Bid', key: 'Lost Bid' },
        { value: 'Other', key: 'Other' },
    ];

    reviseNote = '';
    public jobs?: JobResponse;
    quoteItemsBegin: QuoteItem[] = [];
    get orderTotalDataSource() {
        const quoteDetail = this.quoteDetail;
        return quoteDetail ? [quoteDetail.quote] : [];
    }

    get displayedColumns() {
        if (this.quote.status === 'INPROGRESS') {
            return ['product', 'detail', 'unit', 'qty'];
        } else {
            return ['product', 'detail', 'unit', 'qty', 'action'];
        }
    }
    get jobAccountReq() {
        if (this.jobs) {
            return this.jobs.isJobAccountRequired;
        } else {
            return false;
        }
    }
    get displayedColumnsAdditionalItems() {
        if (this.quote.status === 'OPEN' || this.quote.status === '') {
            return ['detail', 'qty', 'unit'];
        } else {
            return ['detail', 'qty'];
        }
    }
    get accountId() {
        return this.user.accountIdInString || '';
    }

    get validSummary() {
        return this.quote.total !== null;
    }

    get finalStatesQuote() {
        return (
            this.quote.status === 'ACCEPTED' ||
            this.quote.status === 'REJECT' ||
            this.quote.status === 'SUBMITTED' ||
            this.quote.status === 'CUSTOMER_REVIEW' ||
            this.quote.status === 'ORDERED'
        );
    }

    get formNotFull(): boolean {
        return (
            !this.quote.quoteName ||
            !this.quote.workType ||
            (!this.quote.jobAccount.jobNumber &&
                !this.quote.jobAccount.jobName &&
                this.jobAccountReq) ||
            !this.quote.phone ||
            !this.quote.city ||
            !this.isPhoneValid ||
            !this.quote.state
        );
    }

    get formNotFullRequest(): boolean {
        return (
            !this.quote.quoteName ||
            !this.quote.workType ||
            !this.quote.jobAccount.jobNumber ||
            !this.quote.phone ||
            !this.quote.city ||
            !this.isPhoneValid ||
            !this.quote.state ||
            !this.dataSource.data
        );
    }

    get getQuoteName() {
        if (!this.copyQuoteName) {
            return true;
        } else {
            return false;
        }
    }

    get getAccountNumber() {
        if (!this.quoteDetail) {
            return null;
        }
        for (const account of this.user.session.accountList) {
            if (
                account.accountLegacyId === this.quoteDetail.quote.accountNumber
            ) {
                if (account.branch && account.branch.branchPhone) {
                    let accountPhone = account.branch.branchPhone;
                    accountPhone = accountPhone.replace(
                        /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                        '$1-$2-$3'
                    );
                    return accountPhone;
                }
            }
        }
        return null;
    }

    get showProgress() {
        return this.isLoading || !this.hasQuote;
    }

    get hasQuote() {
        return !(this.quote instanceof Error);
    }

    get isOpen() {
        // (!this.quoteDetail.quote.status){return false};
        // console.log((this.quote.status === 'OPEN' || this.quote.status === ''))
        return (
            this.quote.status === 'OPEN' ||
            this.quote.status === '' ||
            this.quoteId === 'new'
        );
    }

    get isInProgress() {
        return this.quote.status === 'INPROGRESS';
    }

    get isPhoneValid() {
        if (
            this.quote.phone.length === 12 &&
            this.quote.phone.match(/^[0-9-]*$/)
        ) {
            return true;
        } else {
            return false;
        }
    }

    get title() {
        return this.quote.status === ''
            ? 'Quote Detail'
            : `Quote ${this.quote.quoteName}`;
    }

    constructor(
        private readonly _snackBar: MatSnackBar,
        public saveDialog: MatDialog,
        private readonly route: ActivatedRoute,
        private readonly quoteService: QuoteService,
        private readonly user: UserService,
        private readonly productService: ProductsService,
        private readonly router: Router,
        private readonly location: Location,
        public deleteItemDialog: MatDialog,
        public dialog: MatDialog,
        private readonly userNotifier: UserNotifierService
    ) {}

    goBack() {
        this.location.back();
    }

    get permissionToUpload() {
        return this.user.permissions.quote.upload;
    }

    get permissionToSubmit() {
        return this.user.permissions.quote.submit;
    }

    get isAccountClosed() {
        return this.user.isLastSelectedAccountClosed;
    }

    get isQtyZero() {
        if (this.dataSource.data.filter((q) => q.quantity === 0).length > 0) {
            console.log('true');

            return true;
        } else {
            console.log('false');

            return false;
        }
    }

    async ngOnInit() {
        try {
            this.isLoading = true;
            this.newQuote = false;
            const alertUser = false;
            this.jobs = await this.user.getUserJobs(alertUser);
            const p: ParamMap = this.route.snapshot.paramMap;
            this.quote.quoteName = window.history.state.quoteName;
            this.quoteId = p.get('quoteId');
            const perm = this.user.permissions.quote;

            if (!perm.queryList) {
                await this.router.navigate(['error'], {
                    queryParams: {
                        type: 'forbidden',
                    },
                });
            } else {
                if (this.quoteId === 'create-quote') {
                    this.quoteId = 'new'; // how important is quoteId = 'new
                    this.newQuote = true;
                    return;
                }
                if (!this.quoteId) {
                    throw new Error('Failed to load quote');
                }
                await this.loadQuote(this.quoteId);
                if (this.quoteDetail) {
                    this.quoteItemsBegin = this.quoteDetail.quote.quoteItems;
                }
            }
        } finally {
            this.isLoading = false;
        }
    }

    async ngOnDestroy() {
        let saveItems = false;
        if (
            this.quoteItemsBegin &&
            this.quoteItemsBegin.length &&
            this.quoteDetail &&
            (this.quote.status === 'OPEN' || this.quote.status === '') &&
            !this.isQtyZero &&
            this.submittingQuote === false
        ) {
            // compare two arrays if they are different save the changes
            for (let i = 0; i < this.quoteItemsBegin.length; i++) {
                if (
                    this.quoteItemsBegin[i] &&
                    this.quoteDetail.quote.standardQuoteItems[i] &&
                    this.quoteItemsBegin[i].quantity !==
                        this.quoteDetail.quote.standardQuoteItems[i].quantity
                ) {
                    saveItems = true;
                }
            }
        }
        if (saveItems) {
            await this.updateQuote();
        }
    }

    viewSubmittedReq(): void {
        // Dynamically use a function to return template ref
        if (!this.viewSubmitReq) {
            return;
        }
        const dialogRef = this.dialog.open(this.viewSubmitReq, {
            width: '800px',
            height: '90vh',
            data: this.quote,
        });

        /* TODO: What is result and why do we need it */
        dialogRef.afterClosed().subscribe((result) => {});
    }

    get getRejection() {
        if (!this.rejectionValue) {
            return true;
        } else {
            return false;
        }
    }

    get getRevise() {
        if (!this.reviseNote) {
            return true;
        } else {
            return false;
        }
    }

    async rejectQuote() {
        if (!this.RejectQuote) {
            return;
        }
        const dialogRef = this.dialog.open(this.RejectQuote, {
            width: '800px',
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                if (!this.quoteId) {
                    throw new Error(`Can't fetch quote information`);
                }
                const request: RejectQuoteRequest = {
                    quoteId: this.quoteId,
                    reason: this.rejectionValue,
                };

                const response = await this.quoteService.rejectQuote(request);
                if (response.success) {
                    this._snackBar.open(`Quote Rejected`, 'Close', this.config);
                    await this.router.navigate([
                        `/proplus/accounts`,
                        this.user.accountIdInString,
                        `quotes`,
                    ]);
                }
                // console.log(response);
            }
        });
    }

    async reviseQuote() {
        if (!this.reviseQuoteModal) {
            return;
        }
        const dialogRef = this.dialog.open(this.reviseQuoteModal, {});

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                if (!this.quoteId) {
                    throw new Error(`Can't fetch quote information`);
                }
                const request: ReviseQuoteRequest = {
                    quoteId: this.quoteId,
                    quoteNotes: this.reviseNote,
                };

                const response = await this.quoteService.reviseQuote(request);
                if (response.success) {
                    this._snackBar.open(`Quote Revised`, 'Close', this.config);
                    await this.router.navigate([
                        `/proplus/accounts`,
                        this.user.accountIdInString,
                        `quotes`,
                    ]);
                }
            }
        });
    }

    private async loadQuote(quoteId: string) {
        try {
            this.isLoading = true;
            if (!quoteId) {
                return;
            }

            let quoteDetailTemp = await this.quoteService.getQuoteDetailAtg(
                this.user.accountIdInString || '',
                quoteId
            );
            if (quoteDetailTemp) {
                this.quoteDetailAtg = quoteDetailTemp;
                this.dataSourceDialog =
                    quoteDetailTemp.quote.standardQuoteItems;
                this.dataSourceAddItmes =
                    quoteDetailTemp.quote.addtionalQuoteItems;
            }
            if (quoteDetailTemp && quoteDetailTemp.quote.status !== 'OPEN') {
                quoteDetailTemp = await this.quoteService.getQuoteDetailMincron(
                    this.user.accountIdInString || '',
                    quoteId
                );
                this.quoteDetail = quoteDetailTemp;
            } else {
                this.quoteDetail = quoteDetailTemp;
            }

            // tslint:disable-next-line: no-console
            this.quote = this.fillFormData(this.quoteDetail);
            this.quoteExpires = this.quoteDetail.quote.expires;

            if (!this.quoteDetail.quote.quoteItems) {
                throw new Error('Failed to load quote');
            }
            this.dataSource.data = this.quoteDetail.quote.standardQuoteItems;
        } finally {
            this.isLoading = false;
        }
    }
    get validateExpirationDate() {
        if (this.quoteExpires) {
            const today = moment();

            const expirationDate = moment(this.quoteExpires, 'MM-DD-YYYY');

            if (expirationDate < today) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    formatPhone(phone: string) {
        if (phone) {
            phone = phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3');
        }
        return phone;
    }

    fillFormData(quoteDetail: QuoteResponse): Quote {
        // tslint:disable-next-line: no-console

        const quote = quoteDetail.quote;
        if (!quote) {
            throw new Error('failed to load quote');
        }

        const status = quote.status;
        if (status === 'CUSTOMER_REVIEW') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                gst: 0,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        if (status === 'REVISED') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                gst: 0,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        if (status === 'INPROGRESS') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                gst: 0,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        if (status === 'OPEN') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                gst: 0,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        if (status === 'ACCEPTED') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                gst: quote.gst,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        if (status === 'ORDERED') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                gst: quote.gst,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        if (status === 'REJECT') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                gst: quote.gst,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        if (status === 'SUBMITTED') {
            return {
                quoteName: quote.displayName,
                created: quote.creationDate,
                createdBy: quote.createdUserName,
                address1: quote.address1,
                city: quote.city,
                jobAccount: {
                    jobName: quote.jobName,
                    jobNumber: quote.jobNumber,
                },
                phone: this.formatPhone(quote.phoneNumber),
                lastModified: quote.lastModifiedDate,
                address2: quote.address2,
                state: quote.state,
                workType: quote.workType,
                accountId: this.user.accountIdInString || '',
                quoteDetail: quoteDetail,
                quoteId: quote.id,
                quoteItems: quote.quoteItems,
                quoteNote: quote.quoteNotes,
                status: status,
                gst: quote.gst,
                otherCharges: quote.otherCharges,
                subTotal: quote.subTotal,
                tax: quote.tax,
                total: quote.total,
                addtionalQuoteItems: quote.addtionalQuoteItems,
                standardQuoteItems: quote.standardQuoteItems,
            };
        }
        throw new Error(`Invalid Quote Type ${status}`);
    }

    async deleteQuote() {
        const dialogRef = this.deleteItemDialog.open(DeleteDraftQuoteComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                if (this.quoteId) {
                    const request: DeleteQuoteRequest = {
                        quoteId: this.quoteId,
                    };
                    const response = await this.quoteService.deleteQuote(
                        request
                    );
                    if (response.success) {
                        this._snackBar.open(
                            `Quote ${this.quote.quoteName} deleted`,
                            'Close',
                            this.config
                        );
                        await this.redirectList();
                    } else {
                        this._snackBar.open(
                            `${response.messages[0].value}`,
                            'Close',
                            this.config
                        );
                    }
                }
            }
        });
    }

    async redirectList() {
        await this.router.navigate([
            '/proplus',
            'accounts',
            this.accountId,
            'quotes',
        ]);
    }

    async requestQuote() {
        try {
            const quote = this.quote;
            this.isLoading = true;
            if (this.jobs) {
                for (const j of this.jobs.jobs) {
                    if (this.quote.jobAccount.jobNumber === j.jobNumber) {
                        this.quote.jobAccount.jobName = j.jobName;
                    }
                }
            }
            if (quote.status === '') {
                const quoteItems = (this.dataSource.data as NewQuoteItem[]).map(
                    (v) => {
                        const item = {
                            itemId: v.id,
                            itemType: v.itemType,
                            quantity: v.quantity,
                            uom: v.unitOfMeasure,
                            displayName: v.displayName,
                        };
                        return item;
                    }
                );
                const request = {
                    id: null,
                    quoteName: quote.quoteName,
                    phoneNumber: quote.phone.replace(/[^0-9]/g, ''),
                    address1: quote.address1,
                    address2: quote.address2,
                    city: quote.city,
                    state: quote.state,
                    jobNumber: quote.jobAccount.jobNumber,
                    jobName: quote.jobAccount.jobName,
                    workType: quote.workType,
                    quoteNotes: quote.quoteNote,
                    quoteItems: quoteItems,
                };
                const response = await this.quoteService.submitQuote(request);
                if (response.success && !response.messages[0].code) {
                    this._snackBar.open(
                        `Quote Submitted`,
                        'Close',
                        this.config
                    );
                    await this.router.navigate(
                        [
                            `/proplus/accounts/${this.user.accountIdInString}/quotes`,
                        ],
                        {
                            queryParams: {
                                active: 'inProcess',
                            },
                        }
                    );
                } else {
                    this._snackBar.open(
                        `There was a problem with requesting the quote, please fill the required forms and items`,
                        'Close',
                        this.config
                    );
                }
            }
            if (quote.status !== '' && quote.quoteItems) {
                await this.updateQuote();
                this.submittingQuote = true;
                const request = {
                    id: quote.quoteId,
                    quoteName: quote.quoteName,
                    phoneNumber: quote.phone.replace(/[^0-9]/g, ''),
                    address1: quote.address1,
                    address2: quote.address2,
                    city: quote.city,
                    state: quote.state,
                    jobNumber: quote.jobAccount.jobNumber,
                    jobName: quote.jobAccount.jobName,
                    workType: quote.workType,
                    quoteNotes: quote.quoteNote,
                    quoteItems: quote.quoteItems.map((v) => {
                        const item: QuoteItemRequest = {
                            itemId: v.id,
                            itemType: v.itemType,
                            quantity: v.quantity,
                            uom: v.unitOfMeasure,
                            displayName: v.displayName,
                        };
                        return item;
                    }),
                };

                const response = await this.quoteService.submitQuote(request);
                if (response.success && !response.messages[0].code) {
                    this._snackBar.open(
                        `Quote Submitted`,
                        'Close',
                        this.config
                    );
                    await this.router.navigate(
                        [
                            `/proplus/accounts/${this.user.accountIdInString}/quotes`,
                        ],
                        {
                            queryParams: {
                                active: 'inProcess',
                            },
                        }
                    );
                } else {
                    this._snackBar.open(
                        `There was a problem with requesting the quote, please fill the required forms and items`,
                        'Close',
                        this.config
                    );
                }
            }
        } catch (err) {
            if (err instanceof AppError || err instanceof ApiError) {
                if (err.message === 'Job Name is invalid.') {
                    this._snackBar.open(
                        `Job Name must not exceed 15 characters`,
                        'Close',
                        this.config
                    );
                } else {
                    this.userNotifier.alertError(err.message);
                    console.log({ err });
                }
            }
        } finally {
            this.isLoading = false;
        }
    }
    copyQuote() {
        if (!this.copyQuoteModal) {
            return;
        }
        const dialogRef = this.dialog.open(this.copyQuoteModal, {
            width: '800px',
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await this.setQuoteValues();
            }
        });
    }
    async setQuoteValues() {
        const request: CreateQuoteRequest = {
            quoteName: this.copyQuoteName,
            address1: this.quote.address1,
            address2: this.quote.address1,
            city: this.quote.city,
            jobName: this.quote.jobAccount.jobName,
            jobNumber: this.quote.jobAccount.jobNumber,
            phoneNumber: this.quote.phone.replace(/[^0-9]/g, ''),
            quoteNotes: this.quote.quoteNote,
            state: this.quote.state,
            workType: this.quote.workType,
            quoteItems: this.dataSource.data.map((v) => {
                const items: NewItemCreateQuoteItemRequest = {
                    itemId: v.itemNumber,
                    displayName: v.displayName,
                    itemType: v.itemType,
                    quantity: v.quantity,
                    uom: v.unitOfMeasure,
                };
                return items;
            }),
        };

        const response = await this.quoteService.createQuote(request);
        if (response) {
            this._snackBar.open(`Quote Saved`, 'Close', this.config);
            await this.router.navigate([
                `/proplus/accounts`,
                this.user.accountIdInString,
                `quotes`,
                response.quoteId,
            ]);
            await this.ngOnInit();
        }
    }
    async updateQuote() {
        if (!this.jobs) {
            throw new AppError('No job information available');
        }
        const jobs = this.jobs.jobs;
        for (const j of jobs) {
            if (this.quote.jobAccount.jobNumber === j.jobNumber) {
                this.quote.jobAccount.jobName = j.jobName;
            }
        }
        try {
            this.isLoading = true;
            const quote = this.quote;
            if (quote.status === '') {
                const request: CreateQuoteRequest = {
                    address1: quote.address1,
                    address2: quote.address1,
                    city: quote.city,
                    jobName: quote.jobAccount.jobName,
                    jobNumber: quote.jobAccount.jobNumber,
                    phoneNumber: quote.phone.replace(/[^0-9]/g, ''),
                    quoteName: quote.quoteName,
                    quoteNotes: quote.quoteNote,
                    state: quote.state,
                    workType: quote.workType,
                    quoteItems: this.dataSource.data.map((v) => {
                        if (v.quantity === 0) {
                            v.quantity = 1;
                        }
                        const items: NewItemCreateQuoteItemRequest = {
                            itemId: v.id,
                            displayName: v.displayName,
                            itemType: v.itemType,
                            quantity: v.quantity,
                            uom: v.unitOfMeasure,
                        };
                        return items;
                    }),
                };
                const response = await this.quoteService.createQuote(request);
                if (response.success && !response.messages[0].code) {
                    this._snackBar.open(`Quote Saved`, 'Close', this.config);
                    await this.router.navigate([
                        `/proplus/accounts`,
                        this.user.accountIdInString,
                        `quotes`,
                        response.quoteId,
                    ]);
                    await this.ngOnInit();
                }
            } else {
                if (quote.quoteItems.length !== 0) {
                    this.dataSource.data.forEach((item) => {
                        let selectedItem = quote.quoteItems.find(
                            (i) => i.id === item.id
                        );
                        if (selectedItem) {
                            selectedItem.quantity = item.quantity;
                        }
                    });
                    if (
                        this.dataSourceAddItmes &&
                        this.dataSourceAddItmes.length > 0
                    ) {
                        this.dataSourceAddItmes.forEach((item) => {
                            let selectedItem = quote.quoteItems.find(
                                (i) => i.id === item.id
                            );
                            if (selectedItem) {
                                selectedItem.quantity = item.quantity;
                            }
                        });
                    }
                    const request: UpdateItemsRequest = {
                        id: quote.quoteId,
                        action: 'UPDATE_ITEM',
                        quoteName: quote.quoteName,
                        quoteItems: (quote.quoteItems as QuoteItem[]).map(
                            (v) => {
                                if (v.quantity === 0) {
                                    v.quantity = 1;
                                }
                                const item = {
                                    id: v.id,
                                    quantity: v.quantity,
                                };
                                return item;
                            }
                        ),
                    };
                    await this.quoteService.updateItems(request);
                }
                const updateRequest: UpdateQuoteRequest = {
                    id: quote.quoteId,
                    quoteName: quote.quoteName,
                    phoneNumber: quote.phone.replace(/[^0-9]/g, ''),
                    address1: quote.address1,
                    address2: quote.address2,
                    city: quote.city,
                    state: quote.state,
                    jobNumber: quote.jobAccount.jobNumber,
                    jobName: quote.jobAccount.jobName,
                    workType: quote.workType,
                    quoteNotes: quote.quoteNote,
                    action: 'UPDATE_QUOTE',
                };

                const response = await this.quoteService.updateQuote(
                    updateRequest
                );
                if (response) {
                    this._snackBar.open(`Quote Updated`, 'Close', this.config);
                } else {
                }
            }
        } catch (err) {
            if (err instanceof AppError || err instanceof ApiError) {
                console.log({ err });
                if (err.message === "The quote name already exists, please enter a different name.") {
                    this._snackBar.open(
                        `The quote name already exists, please enter a different name.`,
                        'Close',
                        this.config
                    );
                } else {
                    this.userNotifier.alertError(err.message);
                    console.log({ err });
                }
            }
        }
         finally {
            this.isLoading = false;
        }
    }
    // tslint:disable-next-line: no-any
    async addProduct(result: any) {
        this.isLoading = true;
        // tslint:disable-next-line: no-console
        await this.addItem(result);
        if (!this.newQuote) {
            await this.updateQuote();
            if (this.quoteDetail) {
                this.quoteItemsBegin =
                    this.quoteDetail.quote.standardQuoteItems;
                console.log(this.quoteItemsBegin);
            }
        }
    }

    // tslint:disable-next-line: no-any
    async addItem(result: any) {
        try {
            const quote = this.quote;
            const currentSku = result.sku;
            if (!currentSku) {
                throw new Error('Cannot add an item without a SKU');
            }
            const selectedSku = currentSku.itemNumber;
            if (!selectedSku) {
                throw new Error('Cannot add an item without a SKU');
            }
            const request = {
                productId: result.productId,
                accountId: this.user.accountIdInString || '',
                itemNumber: selectedSku,
            };
            const item: ProductDetailsResponse | null =
                await this.productService.getItemDetails(request);
            if (!item) {
                throw new Error('Couldnt fetch items');
            }
            // Step 1: validate that we are in a new quote
            if (this.newQuote) {
                // Step 2: setting the item to the data source for the table
                this.dataSource.data.push({
                    id: item.product.itemNumber,
                    displayName: item.product.productName,
                    itemType: 'I',
                    quantity: 1,
                    unitOfMeasure: item.currentSKU.currentUOM,
                    itemNumber: item.product.itemNumber,
                    productId: item.product.productId,
                    deleteStatus: false,
                    imageURL: item.currentSKU.thumbImage,
                    imageOnErrorUrl: item.product.productOnErrorImage,
                    PDPUrl: item.product.url,
                    productNumber: item.product.productId || '',
                    unitPrice: item.currentSKU.unitPrice,
                    itemDescription: item.product.internalProductName,
                    itemTotalPrice: item.currentSKU.unitPrice,
                    currencySymbol: item.currentSKU.currentUOM,
                    stickerImageURL: item.currentSKU.swatchImage || '',
                    formatUnitPrice: item.currentSKU.unitPrice.toString(),
                    formatItemTotalPrice: item.currentSKU.unitPrice.toString(),
                });

                this.dataSource.connect();
                this.dataSource._updateChangeSubscription();
                this.dataSource.disconnect();

                // Step 3: Mapping the data source to the quote detail for saving
                // do it once when saving

                // this.quote.quoteItems = quoteItems;
            } else {
                const newItem: CreateItemsRequest = {
                    id: quote.quoteId,
                    quoteItems: [
                        {
                            displayName: item.product.productName,
                            itemType: 'I' || null,
                            itemNumber: item.product.itemNumber || null,
                            // quantity: result.quantity,
                            quantity: 1,
                            // uom: result.uom
                            uom: item.currentSKU.currentUOM || result.uom || '',
                        },
                    ],
                    action: 'CREATE_ITEM',
                };
                await this.quoteService.manageItemsForQuote(newItem);
                await this.loadQuote(quote.quoteId);
            }
        } finally {
            this.isLoading = false;
        }
    }

    // tslint:disable-next-line: no-any
    async deleteProduct(item: any) {
        try {
            await this.updateQuote();
            if (this.newQuote) {
                for (let i = 0; i < this.dataSource.data.length; i++) {
                    if (
                        this.dataSource.data[i].displayName === item.displayName
                    ) {
                        this.dataSource.data.splice(i, 1);
                    }
                }
                this.dataSource.connect();
                this.dataSource._updateChangeSubscription();
                this.dataSource.disconnect();
                this._snackBar.open(
                    `Item ${item.displayName} Deleted`,
                    'Close',
                    this.config
                );
                return;
            }
            const quote = this.quote;

            this.isLoading = true;
            const deleteItem: DeleteItemsRequest = {
                id: quote.quoteId,
                deleteItems: [item.id],
                action: 'DELETE_ITEM',
            };

            // const response = await this.quoteService.deleteItems(deleteItem);
            const response = await this.quoteService.deleteItems(deleteItem);
            // tslint:disable-next-line: no-console
            console.log(response, item);
            if (response && response.success) {
                this._snackBar.open(
                    `Item ${item.displayName} Deleted`,
                    'Close',
                    this.config
                );
            }
            await this.loadQuote(quote.quoteId);
        } finally {
            if (!this.newQuote) {
                if (this.quoteDetail) {
                    this.quoteItemsBegin =
                        this.quoteDetail.quote.standardQuoteItems;
                    console.log(this.quoteItemsBegin);
                }
            }
            this.isLoading = false;
        }
    }

    async editElement() {
        this.isEditing = !this.isEditing;
        if (!this.newQuote) {
            await this.loadQuote(this.quote.quoteId);
        }
    }

    public getProdUrl(lineItem: QuoteItem) {
        if (lineItem && lineItem.productId && lineItem.itemNumber) {
            return ['/productDetail', lineItem.productId, lineItem.itemNumber];
        }
        if (lineItem && lineItem.productId) {
            return ['/productDetail', lineItem.productId];
        }
        return [];
    }
    getName(lineItem: QuoteItem) {
        return lineItem.displayName;
    }

    openDialog() {
        const dialogRef = this.saveDialog.open(CustomItemDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                if (this.newQuote) {
                    this.dataSource.data.push(result);
                    this.dataSource.connect();
                    this.dataSource._updateChangeSubscription();
                    this.dataSource.disconnect();
                } else {
                    const newItem: CreateItemsRequest = {
                        id: this.quote.quoteId,
                        quoteItems: [
                            {
                                displayName: result.displayName,
                                itemType: 'E',
                                itemNumber: '',
                                quantity: result.quantity,
                                uom: result.unitOfMeasure,
                            },
                        ],
                        action: 'CREATE_ITEM',
                    };
                    await this.quoteService.manageItemsForQuote(newItem);
                    if (!this.newQuote) {
                        await this.updateQuote();
                    }
                    await this.loadQuote(this.quote.quoteId);
                }
            }
        });
    }

    async proceedToCheckout() {
        const quoteId = this.quoteId;
        if (!quoteId) {
            return;
        }
        const result = await this.quoteService.convertQuoteToOrder(quoteId);
        if (!result.success && result.messages) {
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            this._snackBar.open(result.messages[0].value, 'Close', this.config);
        }
        const orderId = result.result;
        await this.router.navigate([
            '/proplus',
            'accounts',
            this.accountId,
            'quote-order',
            orderId,
        ]);
    }

    async openQuoteId(showPrice: boolean, type: string) {
        if (type === 'pdf') {
            // PDF download
            const quoteId = this.quoteId;
            if (!quoteId) {
                throw new AppError(`QuoteId '${quoteId}' is invalid`);
            }

            const url = await this.quoteService.downloadQuoteAsPDFBlob(
                this.accountId,
                quoteId,
                showPrice ? 'true' : 'false'
            );
            this.openDataUrl(url);
        } else if (type === 'excel') {
            const quote = this.quote;
            const quoteItems = this.quoteDetail
                ? this.quoteDetail.quote.standardQuoteItems
                : [];
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            const excelObj: ExcelObject[] = [];
            if (
                (quoteItems && quoteItems.length > 0) ||
                (this.dataSourceAddItmes && this.dataSourceAddItmes.length > 0)
            ) {
                const quoteAddress = this.formatAddress(
                    quote.address1,
                    quote.address2,
                    quote.city,
                    quote.state
                );
                if (showPrice) {
                    for (const element of quoteItems) {
                        excelObj.push({
                            QuoteName: quote.quoteName,
                            QuoteExpires: this.quoteExpires,
                            QuoteStatus: quote.status,
                            PhoneNumber: quote.phone,
                            CreatedDate: quote.created,
                            CreatedBy: quote.createdBy,
                            LastModifiedDate: quote.lastModified,
                            JobName: quote.jobAccount.jobName,
                            Address: quoteAddress,
                            QuoteNote: quote.quoteNote,
                            ItemDescription: he.decode(element.displayName),
                            ItemNumber: element.itemNumber,
                            ProductNumber: element.productNumber,
                            UnitPrice:
                                element.unitPrice === 0
                                    ? undefined
                                    : element.unitPrice,
                            UoM: element.unitOfMeasure,
                            Quantity: element.quantity,
                            ItemTotal:
                                element.itemTotalPrice === 0
                                    ? undefined
                                    : element.itemTotalPrice,
                        });
                    }
                    if (
                        this.dataSourceAddItmes &&
                        this.dataSourceAddItmes.length > 0
                    ) {
                        // additional items
                        for (const element of this.dataSourceAddItmes) {
                            excelObj.push({
                                QuoteName: quote.quoteName,
                                QuoteExpires: this.quoteExpires,
                                QuoteStatus: quote.status,
                                PhoneNumber: quote.phone,
                                CreatedDate: quote.created,
                                CreatedBy: quote.createdBy,
                                LastModifiedDate: quote.lastModified,
                                JobName: quote.jobAccount.jobName,
                                Address: quoteAddress,
                                QuoteNote: quote.quoteNote,
                                ItemDescription: he.decode(element.displayName),
                                ItemNumber: element.itemNumber,
                                ProductNumber: element.productNumber,
                                UnitPrice:
                                    element.unitPrice === 0
                                        ? undefined
                                        : element.unitPrice,
                                UoM: element.unitOfMeasure,
                                Quantity: element.quantity,
                                ItemTotal:
                                    element.itemTotalPrice === 0
                                        ? undefined
                                        : element.itemTotalPrice,
                            });
                        }
                    }
                    excelObj.push({
                        QuoteName: quote.quoteName,
                        QuoteExpires: this.quoteExpires,
                        QuoteStatus: quote.status,
                        PhoneNumber: quote.phone,
                        CreatedDate: quote.created,
                        CreatedBy: quote.createdBy,
                        LastModifiedDate: quote.lastModified,
                        JobName: quote.jobAccount.jobName,
                        Address: quoteAddress,
                        QuoteNote: quote.quoteNote,
                        ItemDescription: 'Other charges',
                        ItemNumber: '',
                        ProductNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        Quantity: '',
                        ItemTotal: quote.otherCharges || 0,
                    });
                    excelObj.push({
                        QuoteName: quote.quoteName,
                        QuoteExpires: this.quoteExpires,
                        QuoteStatus: quote.status,
                        PhoneNumber: quote.phone,
                        CreatedDate: quote.created,
                        CreatedBy: quote.createdBy,
                        LastModifiedDate: quote.lastModified,
                        JobName: quote.jobAccount.jobName,
                        Address: quoteAddress,
                        QuoteNote: quote.quoteNote,
                        ItemDescription: 'Tax',
                        ItemNumber: '',
                        ProductNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        Quantity: '',
                        ItemTotal: quote.tax,
                    });
                    excelObj.push({
                        QuoteName: quote.quoteName,
                        QuoteExpires: this.quoteExpires,
                        QuoteStatus: quote.status,
                        PhoneNumber: quote.phone,
                        CreatedDate: quote.created,
                        CreatedBy: quote.createdBy,
                        LastModifiedDate: quote.lastModified,
                        JobName: quote.jobAccount.jobName,
                        Address: quoteAddress,
                        QuoteNote: quote.quoteNote,
                        ItemDescription: 'Sub Total',
                        ItemNumber: '',
                        ProductNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        Quantity: '',
                        ItemTotal: quote.subTotal,
                    });
                    excelObj.push({
                        QuoteName: quote.quoteName,
                        QuoteExpires: this.quoteExpires,
                        QuoteStatus: quote.status,
                        PhoneNumber: quote.phone,
                        CreatedDate: quote.created,
                        CreatedBy: quote.createdBy,
                        LastModifiedDate: quote.lastModified,
                        JobName: quote.jobAccount.jobName,
                        Address: quoteAddress,
                        QuoteNote: quote.quoteNote,
                        ItemDescription: 'Total',
                        ItemNumber: '',
                        ProductNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        Quantity: '',
                        ItemTotal: quote.total,
                    });
                } else {
                    for (const element of quoteItems) {
                        excelObj.push({
                            QuoteName: quote.quoteName,
                            QuoteExpires: this.quoteExpires,
                            QuoteStatus: quote.status,
                            PhoneNumber: quote.phone,
                            CreatedDate: quote.created,
                            CreatedBy: quote.createdBy,
                            LastModifiedDate: quote.lastModified,
                            JobName: quote.jobAccount.jobName,
                            Address: quoteAddress,
                            QuoteNote: quote.quoteNote,
                            ItemDescription: he.decode(element.displayName),
                            ItemNumber: element.itemNumber,
                            ProductNumber: element.productNumber,
                            UoM: element.unitOfMeasure,
                            Quantity: element.quantity,
                        });
                    }
                    if (
                        this.dataSourceAddItmes &&
                        this.dataSourceAddItmes.length > 0
                    ) {
                        // additional items
                        for (const element of this.dataSourceAddItmes) {
                            excelObj.push({
                                QuoteName: quote.quoteName,
                                QuoteExpires: this.quoteExpires,
                                QuoteStatus: quote.status,
                                PhoneNumber: quote.phone,
                                CreatedDate: quote.created,
                                CreatedBy: quote.createdBy,
                                LastModifiedDate: quote.lastModified,
                                JobName: quote.jobAccount.jobName,
                                Address: quoteAddress,
                                QuoteNote: quote.quoteNote,
                                ItemDescription: he.decode(element.displayName),
                                ItemNumber: element.itemNumber,
                                ProductNumber: element.productNumber,
                                UoM: element.unitOfMeasure,
                                Quantity: element.quantity,
                            });
                        }
                    }
                }
            }
            if (excelObj && type === 'excel') {
                const sheet = xlsx.utils.json_to_sheet(excelObj);
                const book = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(book, sheet, 'QuoteDetail');
                const option: xlsx.WritingOptions = {
                    type: 'array',
                    cellDates: false,
                    bookSST: false,
                    bookType: 'xlsx',
                    sheet: '',
                    compression: false,
                    ignoreEC: true,
                };
                xlsx.writeFile(book, `${this.quoteId}.xlsx`, option);
            }
        }
    }

    formatAddress(
        address1: string,
        address2: string,
        city: string,
        state: string
    ) {
        return [address1, address2, [city, state].filter((i) => i).join(', ')]
            .filter((i) => i)
            .join(' ');
    }

    translateWorkType(workType: string) {
        if (workType) {
            if (workType.toUpperCase() === 'N') {
                return 'New Construction';
            } else if (workType.toUpperCase() === 'R') {
                return 'Remodel';
            }
        }
        return '';
    }

    openDataUrl(dataUrl: Blob) {
        if (!dataUrl) {
            return;
        }
        const downloadURL = URL.createObjectURL(dataUrl);
        let link: HTMLAnchorElement | null = document.createElement('a');
        link.href = downloadURL;
        link.download = this.quoteId + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.remove();
        URL.revokeObjectURL(downloadURL);
    }
}

export interface ExcelObject {
    QuoteName?: string;
    QuoteExpires?: string;
    QuoteStatus?: string;
    PhoneNumber?: string;
    CreatedDate?: string;
    CreatedBy?: string;
    LastModifiedDate?: string;
    JobName?: string;
    Address?: string;
    QuoteNote?: string;
    ItemDescription?: string;
    ItemNumber?: string;
    ProductNumber?: string;
    UnitPrice?: number | string;
    UoM?: string;
    Quantity?: number | string;
    ItemTotal?: number;
}

// function openDataUrl(dataUrl: string | ArrayBuffer | null) {
//   if (!dataUrl) {
//     return;
//   }
//   const pdfWindow = window.open("");
//   if (!pdfWindow) {
//     return;
//   }
//   pdfWindow.document.write(
//     `<embed width='100%' height='100%' src='${dataUrl}'></embed>)`
//   );
// }
