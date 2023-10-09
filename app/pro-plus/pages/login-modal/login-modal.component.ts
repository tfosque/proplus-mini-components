import { PendingOrdersService } from './../../services/pending-orders.service';
import { ChatService } from './../../services/chat.service';
import { Component, OnInit } from '@angular/core';
import { CurrentUser } from '../../model/get-current-user-response';
import { LoginDeclaration, UserService } from '../../services/user.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AppError } from '../../../common-components/classes/app-error';
import { PersistentLoginComponent } from '../login-page/persistent-login/persistent-login.component';
import { AnalyticsService } from '../../../common-components/services/analytics.service';
interface Login {
    email: string;
    password: string;
}
@Component({
    selector: 'app-login-modal',
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {
    form: Login = { email: '', password: '' };
    public userInfo: CurrentUser | null = null;
    public error: any = null;
    public rememberMe = true;
    public isLoading = true;
    public loginDeclaration: LoginDeclaration | null = null;
    invalidLoginError: string | null = null;
    public attempt = 3;
    public disabledLogin: boolean = false;
    public get hasError() {
        return this.error != null;
    }
    constructor(
        public dialogRef: MatDialogRef<LoginModalComponent>,
        public dialog: MatDialog,
        private readonly router: Router,
        public readonly user: UserService,
        public readonly analytics: AnalyticsService,
        private readonly chatService: ChatService,
        private readonly pendingOrdersService: PendingOrdersService
    ) {}

    async ngOnInit() {
        try {
            this.loginDeclaration = await this.user.getLoginDeclaration();

            if (this.user.isLoggedIn) {
                // TESTING:
                this.userInfo = await this.user.getSessionInfo();
                await this.router.navigate(['/proplus', 'home']);
                return;
            }
        } finally {
            this.isLoading = false;
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
    async checkUserApproverStatus() {
        /* Check Approver Status */
        await this.pendingOrdersService.checkApproverStatus();
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
            if (loginResponse === false) {
                throw new AppError('doLogin returned false');
            }
            this.dialogRef.close();
            const session = await this.user.getSessionInfo();

            // CHAT and ANALYTICS if user session has started with user logged in UserService show chat and log analytics
            if (session) {
                this.chatService.displayChat(true);
                this.analytics.logUser();
            }
            await this.checkUserApproverStatus();
            await this.router.navigate(['/proplus/home']);
            location.reload();
            this.error = null;
            return false;
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
                this.chatService.displayChat(false);
                this.rememberMe = !!result;
            });
        }
    }
}
