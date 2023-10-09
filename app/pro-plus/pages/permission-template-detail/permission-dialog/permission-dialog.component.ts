import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-permission-dialog',
    templateUrl: './permission-dialog.component.html',
    styleUrls: ['./permission-dialog.component.scss'],
})
export class PermissionDialogComponent implements OnInit {
    tempName = '';
    constructor() {}

    get tempEmpty() {
        if (this.tempName.length === 0) {
            return true;
        }
        return false;
    }
    ngOnInit() {}
}
