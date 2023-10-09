import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TemplateReference } from '../../../app/pro-plus/model/template-list';
import { ConfirmationDialogComponent } from '../../../app/global-components/dialogs/confirmation-dialog/confirmation-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class UserNotifierService {
    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly dialog: MatDialog,
        private readonly router: Router
    ) {}

    notifyWithUrl(message: string, urlParts: string[]) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 4000;
        this.snackBar
            .open(message, 'View', config)
            .onAction()
            .subscribe(async () => {
                await this.router.navigate(urlParts);
            });
    }

    alertError(errorMessage: string) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 4000;
        this.snackBar.open(errorMessage, 'close', config);
    }

    public itemsAddedToTemplate(
        lineItems: { itemNumber: string }[],
        template: TemplateReference
    ) {
        const message = `${lineItems.length} Item(s) added to Template ${template.templateName}`;
        this.notifyWithUrl(message, [
            '/proplus/accounts',
            template.accountLegacyId,
            'templates',
            template.templateId,
        ]);
    }

    public askUserToConfirm<T>(config: {
        title: string;
        yesButton?: string;
        noButton?: string;
        question: string;
        whenYes(): void;
    }) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                confimation: config.yesButton || 'Yes',
                no: config.noButton || 'No',
                question: config.question,
                title: config.title,
            },
        });
        dialogRef.afterClosed().subscribe(async (result: boolean) => {
            if (result) {
                config.whenYes();
            }
        });
    }
}
