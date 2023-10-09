import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService, BasicResponse } from '../../services/user.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
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
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
    matcher = new MyErrorStateMatcher();
    oldPasswordControl = new FormControl('', [Validators.required]);
    newPassControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/),
        Validators.minLength(7),
        Validators.maxLength(25),
    ]);
    confirmPassControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/),
        Validators.minLength(7),
        Validators.maxLength(25),
    ]);
    isLoading = false;
    oldPassword = '';
    newPassword = '';
    confirmPassword = '';
    resetToken?: string;
    atgMultiSiteRemap: string | undefined = undefined;
    re = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])');
    currentPassMatch = true;
    response: BasicResponse = {
        messages: [],
        messageCode: 0,
        success: false,
    };
    success = false;
    config = new MatSnackBarConfig();

    get passwordValidationError() {
        if (
            this.newPassword.length === 0 ||
            this.oldPassword.length === 0 ||
            this.confirmPassword.length === 0
        ) {
            return true;
        } else if (
            this.newPassword.length < 7 ||
            this.confirmPassword.length < 7
        ) {
            return true;
        } else if (
            this.newPassword.length > 25 ||
            this.confirmPassword.length > 25
        ) {
            return true;
        } else if (
            this.re.exec(this.newPassword) === null ||
            this.re.exec(this.confirmPassword) === null
        ) {
            return true;
        } else {
            return false;
        }
    }

    get resetPasswordValidationError() {
        if (
            this.newPassword.length === 0 ||
            this.confirmPassword.length === 0
        ) {
            return true;
        } else if (
            this.newPassword.length < 7 ||
            this.confirmPassword.length < 7
        ) {
            return true;
        } else if (
            this.newPassword.length > 25 ||
            this.confirmPassword.length > 25
        ) {
            return true;
        } else if (
            this.re.exec(this.newPassword) === null ||
            this.re.exec(this.confirmPassword) === null
        ) {
            return true;
        } else {
            return false;
        }
    }

    get submisionSuccess() {
        if (this.response.messageCode === null) {
            return true;
        } else {
            return false;
        }
    }

    constructor(
        private readonly _snackBar: MatSnackBar,
        private userService: UserService,
        private router: ActivatedRoute,
        private route: Router
    ) {}

    ngOnInit() {
        this.config.verticalPosition = 'top';
        this.config.duration = 4000;

        this.router.queryParams.subscribe((params) => {
            this.resetToken = params.RESETPW;
            this.atgMultiSiteRemap = params['atg.multisite.remap'];
        });
    }

    async savePasswordInfo() {
        this.currentPassMatch = true;
        const newPass = {
            oldPassword: this.oldPassword,
            password: this.newPassword,
            confirmpassword: this.confirmPassword,
        };
        console.log('Save newInfo', newPass);
        this.response = await this.userService.changePassword(newPass);
        console.log(this.response);
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        if (this.response.success === true) {
            this._snackBar.open(
                `Password Updated Succesfully`,
                'Close',
                this.config
            );
            this.success = true;
        } else {
            if (this.response.messages && this.response.messages[0]) {
                const errorMessage = this.response.messages[0];
                if (errorMessage.value) {
                    let message = errorMessage.value;
                    if (message.indexOf('match') > -1) {
                        message = 'The password you entered does not match. Please re-enter your password';
                    }
                    this._snackBar.open(
                        message,
                        'Close',
                        this.config
                    );
                }
            }
            this.success = false;
        }
    }

    async resetPassword() {
        const reset = this.resetToken;
        if (!reset) {
            return;
        }
        this.currentPassMatch = true;
        const newPass = {
            password: this.newPassword,
            confirmpassword: this.confirmPassword,
            passwordtoken: reset,
        };
        this.response = await this.userService.resetPasswordService(newPass);
        this.newPassword = '';
        this.confirmPassword = '';
        if (this.response.success === true) {
            this._snackBar.open(
                `Your password has been updated successfully`,
                'Close',
                this.config
            );
            this.success = true;
            this.route.navigateByUrl('proplus/home');
        } else {
            if (this.response.messages && this.response.messages[0]) {
                const errorMessage = this.response.messages[0];
                if (errorMessage.value) {
                    let message = errorMessage.value;
                    if (message.indexOf('match') > -1) {
                        message = 'The password you entered does not match. Please re-enter your password';
                    }
                    this._snackBar.open(
                        message,
                        'Close',
                        this.config
                    );
                }
            }
            this.success = false;
        }
    }
}
