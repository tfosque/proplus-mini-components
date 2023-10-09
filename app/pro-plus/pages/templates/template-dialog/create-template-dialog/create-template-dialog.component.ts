import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-create-template-dialog',
    templateUrl: './create-template-dialog.component.html',
    styleUrls: ['./create-template-dialog.component.scss'],
})
export class CreateTemplateDialogComponent implements OnInit {
    templateName = '';
    templateNameControl = new FormControl('', [Validators.required]);
    constructor() {}

    ngOnInit() {}
}
