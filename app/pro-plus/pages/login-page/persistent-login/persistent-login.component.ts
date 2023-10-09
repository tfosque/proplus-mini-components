import { Component, OnInit, Inject } from '@angular/core';
import { LoginDeclaration } from '../../../services/user.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-persistent-login',
    templateUrl: './persistent-login.component.html',
    styleUrls: ['./persistent-login.component.scss'],
})
export class PersistentLoginComponent implements OnInit {
    public loginDeclaration: LoginDeclaration | null = null;

    constructor(@Inject(MAT_DIALOG_DATA) public data: LoginDeclaration) {}

    async ngOnInit() {}

    findCancel(): string {
        if (this.data.CTA.indexOf('Cancel') > -1) {
            const index = this.data.CTA.indexOf('Cancel');
            return this.data.CTA[index];
        }
        return 'Cancel';
    }

    findConfirm(): string {
        if (this.data.CTA.indexOf('Confirm') > -1) {
            const index = this.data.CTA.indexOf('Confirm');
            return this.data.CTA[index];
        }
        return 'Confirm';
    }
}
