import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public config: Config) {}

    configuration: Config = {
        confimation: '',
        no: '',
        question: '',
        title: '',
    };
    ngOnInit() {
        this.configuration = this.config;
    }
}

interface Config {
    title: string;
    question: string;
    no: string;
    confimation: string;
}
