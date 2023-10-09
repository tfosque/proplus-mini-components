// 'strict';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from './dialog-content/dialog-content.component';

@Component({
    selector: 'app-beacon-dialog',
    templateUrl: './beacon-dialog.component.html',
    styleUrls: ['./beacon-dialog.component.scss'],
})
export class BeaconDialogComponent {
    @Input() details: any[] = [];

    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        const dialogRef = this.dialog.open(DialogContentComponent, {
            width: '640px',
            data: this.details,
        });

        /* TODO: What is result and why do we need it */
        dialogRef.afterClosed().subscribe((result) => {
            // console.log('The dialog was closed', {result});
            // this.animal = result;
        });
    }
}
