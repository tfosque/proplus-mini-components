import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Validators, FormBuilder } from '@angular/forms';

import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';

import {
    QuoteService,
    SubmitQuoteFormRequest,
} from '../../services/quote-service';
import { UserService } from '../../services/user.service';
import { JobResponse } from '../../model/job-response';
import { SevereError } from '../../../common-components/classes/app-error';

@Component({
    selector: 'app-quote-upload',
    templateUrl: './quote-upload.component.html',
    styleUrls: ['./quote-upload.component.scss'],
})
export class QuoteUploadComponent implements OnInit {
    private isLoading = true;
    public jobs?: JobResponse;

    uploadQuoteForm: any;
    base64File!: string;
    filename!: string | null;
    filetype!: string | undefined;
    accountId: any;

    config: MatSnackBarConfig = {
        verticalPosition: 'top',
        duration: 10000,
    };

    get showProgress() {
        return this.isLoading;
    }

    constructor(
        private readonly _snackBar: MatSnackBar,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly quoteService: QuoteService,
        private readonly user: UserService,
        private formBuilder: FormBuilder
    ) {
        this.uploadQuoteForm = this.formBuilder.group({
            userName: ['', Validators.required],
            contactNumber: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[0-9-]*$/),
                    Validators.minLength(10),
                ],
            ],
            jobNumber: ['', [Validators.required, Validators.maxLength(15)]],
            workType: ['', [Validators.required]],
            quoteNote: [''],
            filename: ['', [Validators.required]],
        });
    }

    async ngOnInit() {
        try {
            this.jobs = await this.user.getUserJobs(false);
            const p: ParamMap = this.route.snapshot.paramMap;
            const account = p.get('accountId') || '0';
            this.accountId = account;

            // Access control
            if (!this.user.permissions.quote.upload) {
                throw new SevereError('forbidden');
            }
        } finally {
            this.isLoading = false;
        }
    }

    async submitQuoteForm() {
        try {
            const request: SubmitQuoteFormRequest = {
                userName: this.uploadQuoteForm.value.userName,
                contactNumber: this.uploadQuoteForm.value.contactNumber.replace(
                    /[^0-9]/g,
                    ''
                ),
                uploadDocument: {
                    blob: new Blob([this.base64File], { type: this.filetype }),
                    filename: this.uploadQuoteForm.value.filename || '',
                },
                jobNumber: this.uploadQuoteForm.value.jobNumber,
                workType: this.uploadQuoteForm.value.workType,
                quoteNotes: this.uploadQuoteForm.value.quoteNote,
            };
            const response = await this.quoteService.submitQuoteForm(request);
            if (response.success && !response.messages[0].code) {
                this._snackBar.open(
                    response.messages[0].value,
                    'Close',
                    this.config
                );
                await this.router.navigateByUrl(
                    `/proplus/accounts/${this.accountId}/quotes`
                );
            } else {
                this._snackBar.open(
                    `There was a problem with uploading the quote, please fill the required forms`,
                    'Close',
                    this.config
                );
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

    onFileSelect(e: any): void {
        try {
            const file = e.target.files[0];
            const fileSize = e.target.files[0].size / 1024 / 1024; // in MiB
            if (fileSize > 10) {
                this._snackBar.open(
                    'The file is too large and cannot be uploaded. Please reduce the size of file below 10MB and try again.',
                    'Close',
                    this.config
                );
                this.filename = null;
                this.base64File = null || '';
            } else {
                // Proceed further
                const fReader = new FileReader();
                fReader.readAsArrayBuffer(file);
                fReader.onloadend = (_event: any) => {
                    this.filename = file.name;
                    this.uploadQuoteForm.controls['filename'].setValue(
                        file.name
                    );
                    this.filetype = file.type;
                    const t = _event.target;
                    if (t) {
                        this.base64File = t.result;
                        this._snackBar.open(
                            'File uploaded successfully.',
                            'Close',
                            this.config
                        );
                    }
                };
            }
        } catch (error) {
            this.filename = null;
            this.base64File = null || '';
        }
    }

    formatPhone() {
        const phone = this.uploadQuoteForm.value.contactNumber;
        if (phone) {
            this.uploadQuoteForm.controls['contactNumber'].setValue(
                phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3')
            );
        }
        return phone;
    }

    resetForm() {
        this.uploadQuoteForm.reset();
    }
}
