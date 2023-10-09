import { states, State } from './../../../../global-classes/states';
import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';
import { JobsResponse } from '../../../model/jobs-response';
import { UserService } from '../../../services/user.service';

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

@Component({
    selector: 'app-quote-dialog',
    templateUrl: './quote-dialog.component.html',
    styleUrls: ['./quote-dialog.component.scss'],
})
export class QuoteDialogComponent implements OnInit {
    states: State[] = states;
    cityFormControl = new FormControl('', [Validators.required]);
    stateFormControl = new FormControl('', [Validators.required]);
    phoneFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9-]*$/),
        Validators.min(12),
    ]);
    quoteFormControl = new FormControl('', [Validators.required]);
    workFormControl = new FormControl('', [Validators.required]);
    jobFormControl = new FormControl('', [Validators.required]);
    jobs!: JobsResponse;
    matcher = new MyErrorStateMatcher();
    constructor(private readonly user: UserService) {}
    request = {
        phone: '',
        quoteName: '',
        city: '',
        workType: '',
        jobAccount: {
            jobName: '',
            jobNumber: '',
        },
        state: '',
    };
    get canSave(): boolean {
        if (
            !this.request.quoteName ||
            !this.request.city ||
            !this.request.jobAccount ||
            !this.request.phone ||
            !this.request.state ||
            !this.request.workType
        ) {
            return true;
        } else {
            return false;
        }
    }
    addDash() {
        return (this.request.phone = this.request.phone.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }
    async ngOnInit() {
        const alertUser = true;
        this.jobs = await this.user.getUserJobs(alertUser);
    }
}
