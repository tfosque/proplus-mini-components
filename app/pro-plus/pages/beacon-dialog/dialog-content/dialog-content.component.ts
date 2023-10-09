import { Component, Inject } from '@angular/core';
import {
    MatDialogRef,
    MatDialog,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';

/* Test to accept any data */
interface DATA {
    id: string;
    [key: string]: any;
}

@Component({
    selector: 'app-dialog-content',
    templateUrl: './dialog-content.component.html',
    styleUrls: ['./dialog-content.component.scss'],
})
export class DialogContentComponent {
    constructor(
        public dialogRef: MatDialogRef<DialogContentComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: DATA
    ) {
        console.log('content:dialog', this);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
