import { PendingOrdersService } from './../../services/pending-orders.service';
import { ChatService } from './../../services/chat.service';
import { AnalyticsService } from './../../../common-components/services/analytics.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService, LoginDeclaration } from '../../services/user.service';
import { CurrentUser } from '../../model/get-current-user-response';
import { Router } from '@angular/router';
import { AppError } from '../../../common-components/classes/app-error';
import { MatDialog } from '@angular/material/dialog';
import { PersistentLoginComponent } from './persistent-login/persistent-login.component';
import { safeParseUrl } from '../../../common-components/classes/safeParseUrl';
import { ConfirmationDialogComponent } from '../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    public email = '';
    public password = '';
    public userInfo: CurrentUser | null = null;
    public error: any = null;
    public rememberMe = true;
    public isLoading = true;
    invalidLoginError: string | null = null;
    public loginDeclaration: LoginDeclaration | null = null;
    public pastUrl: string | null = null;
    public attempt = 3;
    public disabledLogin: boolean = false;
    public get hasError() {
        return this.error != null;
    }

    constructor(
        public dialog: MatDialog,
        private readonly router: Router,
        public readonly user: UserService,
        public readonly analytics: AnalyticsService,
        private readonly chatService: ChatService,
        private readonly pendingOrdersService: PendingOrdersService
    ) {}

    async ngOnInit() {
        try {
            this.userInfo = await this.user.getSessionInfo();
            this.loginDeclaration = await this.user.getLoginDeclaration();
            if (this.user.isLoggedIn) {
                await this.router.navigate(['/proplus', 'home']);
                return;
            }
        } finally {
            this.isLoading = false;
        }
    }

    async onSubmit(f: NgForm, event: Event) {
        try {
            this.isLoading = true;
            event.preventDefault();
            const formValues = f.value;
            const email = formValues.email;
            const password = formValues.password;
            const rememberPassword = this.rememberMe
                ? 'RememberPassword'
                : undefined;
            const loginResponse = await this.user.doLogin(
                email,
                password,
                rememberPassword
            );
            this.invalidLoginError =
                typeof loginResponse === 'string' ? loginResponse : null;
            if (typeof loginResponse === 'string') {
                this.attempt--;
                if (this.attempt == 0) {
                    this.disabledLogin = true;
                }
                // throw new AppError(loginResponse);
                return false;
            }
            if (Boolean(loginResponse) === false) {
                throw new AppError('doLogin returned false');
            }

            const pastUrl = await this.user.$loginWithProduct;

            this.chatService.displayChat(true);

            if (pastUrl) {
                // tslint:disable-next-line: no-floating-promises
                // await this.router.navigate(accessResult.path, {
                //     queryParams: accessResult.queryParams
                // });
                const parsedUrl = safeParseUrl(pastUrl);
                this.router.navigate([parsedUrl.path], {
                    queryParams: parsedUrl.parameters,
                });

            } else {
                await this.router.navigate(['/proplus/home']);
                location.reload();
                this.analytics.logUser();
            }

            this.error = null;

            return false;
        } finally {
            /* Check Approver Status */
            await this.pendingOrdersService.checkApproverStatus();
            // this.pendingOrdersService.user$.subscribe((pendingUser) => {});
            this.isLoading = false;
        }
    }

    askUserToChangeAccount<T>(config: {
        title: string;
        yesButton?: string;
        noButton?: string;
        question: string;
        whenYes: () => void;
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

    async logout() {
        this.chatService.displayChat(false);
        this.pendingOrdersService.resetOrdersApproverInfo();
        try {
            this.isLoading = true;
            return await this.user.logout();
        } finally {
            this.isLoading = false;
        }
    }

    persistenceChange() {
        if (this.rememberMe) {
            const dialogRef = this.dialog.open(PersistentLoginComponent, {
                data: this.loginDeclaration,
            });
            dialogRef.afterClosed().subscribe(async (result) => {
                this.rememberMe = !!result;
            });
        }
    }
}
