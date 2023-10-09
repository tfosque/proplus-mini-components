import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';

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
    selector: 'app-po-dialog',
    templateUrl: './po-dialog.component.html',
    styleUrls: ['./po-dialog.component.scss'],
})
export class PoDialogComponent implements OnInit {
    constructor() {}

    templateFormControl = new FormControl('', [Validators.required]);
    templateName: string | null = null;
    get canSave(): boolean {
        if (this.templateName) {
            return false;
        } else {
            return true;
        }
    }
    ngOnInit() {}
}
