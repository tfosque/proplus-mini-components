import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

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
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
    username = '';
    re = /^[\w\d.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    success = false;

    get validUserEmail() {
        if (this.re.exec(this.username) === null) {
            return false;
        } else {
            return true;
        }
    }
    get passwordLengthIsZero() {
        if (this.username.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    emailControl = new FormControl('', [Validators.email, Validators.required]);
    matcher = new MyErrorStateMatcher();

    constructor(
        private userService: UserService, 
        private router: Router,
        private readonly _snackBar: MatSnackBar,
    ) {}

    ngOnInit() {}

    async submitRequest() {
        const forgotPass = {
            login: this.username,
        };
        const response = await this.userService.forgotPassword(forgotPass);
        if (response.success === true) {
            this.success = true;
        } else {
            this.success = false;
            if (response.messages && response.messages[0]) {
                const errorMessage = response.messages[0];
                if (errorMessage.type === 'error' && errorMessage.value) {
                    this.showSnack(errorMessage.value
                    , 'close', 5000);
                }
            }
        }
    }

    windowBack() {
        this.router.navigateByUrl('proplus/login');
    }

    showSnack(
        message: string,
        title: string = 'Close',
        duration: number = 3000
    ) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = duration;
        this._snackBar.open(message, title, config);
    }
}
