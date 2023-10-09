import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
    FormControl,
    Validators,
    FormGroupDirective,
    NgForm,
    FormGroup,
} from '@angular/forms';
// import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { UserRegisterService } from '../../pro-plus/services/user-register.service';
import {
    SignupEmailForm,
    SignupAccountForm,
    ValidateByEmailOrAccountResponse,
    UserRegInfo,
} from '../../pro-plus/model/user-register';
import { Router } from '@angular/router';
import moment from 'moment';
import { UserService } from '../../pro-plus/services/user.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        // const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched)
        );
    }
}

export class MyErrorStateMatcherRegular implements ErrorStateMatcher {
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
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
    @ViewChild('formDirective')
    private readonly formDirective!: NgForm;
    @ViewChild('branchSelection')
    branchSelection?: TemplateRef<any>;
    activeForm = '';
    successMessage = '';
    emailAddressFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);
    firstNameFormControl = new FormControl('', [Validators.required]);
    lastNameFormControl = new FormControl('', [Validators.required]);
    zipFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{5}$|^\d{5}-\d{4}$/),
    ]);
    phoneFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/),
    ]);
    companyFormControl = new FormControl('', [Validators.required]);
    accountFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{5,6}$/),
    ]);
    invoiceNumberFormControl = new FormControl('', [Validators.required]);
    invoiceDateFormControl = new FormControl('', [Validators.required]);
    matcher = new MyErrorStateMatcher();
    matcherRegular = new MyErrorStateMatcherRegular();
    signupFirstForm = {
        email: '',
        firstName: '',
        lastName: '',
        zip: '',
        phone: '',
    };
    signupSecondForm = {
        company: '',
        account: '',
        invoiceNumber: '',
        invoiceDate: '',
    };
    signupFormEmail: FormGroup = new FormGroup({});
    formBranchSelection!: FormGroup;
    displayErrorMsg = false;
    errorMsgFirstForm = '';
    displayAcctErrorMsg = false;
    errorMsgAccountForm = '';
    userRegisterToken = '';
    public readonly currentDate = new Date();
    public readonly maxDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate()
    );
    emailResponse: ValidateByEmailOrAccountResponse | null = null;
    accountResponse: ValidateByEmailOrAccountResponse | null = null;
    userRegInfo: UserRegInfo | null = null;
    emailForm: any | null = null;
    accountForm: any | null = null;
    accountId = '';
    branches: Branch[] = [];
    selectedBranch = '';
    branchFormControl = new FormControl('', [Validators.required]);

    menuItems = [
        { menuImage: '24-7.png', menuText: '24/7 Access' },
        {
            menuImage: 'order-accuracy.png',
            menuText: 'Time Savings / Efficiency',
        },
        { menuImage: 'quick-easy.png', menuText: 'Improved Order Accuracy' },
        {
            menuImage: 'time-savings.png',
            menuText: 'Greater Visibility & Access to Products in Your Market',
        },
        { menuImage: 'visibility.png', menuText: 'Quick, Easy & Paperless' },
    ];

    constructor(
        private readonly userRegisterService: UserRegisterService,
        private readonly router: Router,
        public branchDialog: MatDialog,
        private readonly userService: UserService
    ) {}

    async ngOnInit() {
        const info = await this.userService.getSessionInfo();
        if (info && this.userService.isLoggedIn) {
            await this.router.navigate(['/proplus/home']);
        }

        this.signupFormEmail = new FormGroup({
            emailAddressControl: this.emailAddressFormControl,
            firstNameControl: this.firstNameFormControl,
            lastNameControl: this.lastNameFormControl,
            zipControl: this.zipFormControl,
            phoneControl: this.phoneFormControl,
        });
        this.formBranchSelection = new FormGroup({
            branchControl: this.branchFormControl,
        });
    }

    async submitEmailForm() {
        this.displayErrorMsg = false;
        this.errorMsgFirstForm = '';
        this.displayAcctErrorMsg = false;
        this.errorMsgAccountForm = '';
        if (this.signupFormEmail.valid) {
            let isUserRegisterTokenValid = false;
            let loopCount = 0;
            while (!isUserRegisterTokenValid && loopCount < 5) {
                loopCount++;
                // Call the api to get user register token
                const response =
                    await this.userRegisterService.getUserRegisterToken();
                // console.log('get user register token response', response);
                if (response) {
                    if (response.result) {
                        this.userRegisterToken =
                            response.result.userRegInfo.userRegisterToken;
                        // console.log('user register token, ', this.userRegisterToken);

                        // Call the api to validate user by email
                        const emailForm: SignupEmailForm = {
                            emailAddress: this.signupFirstForm.email,
                            firstName: this.signupFirstForm.firstName,
                            lastName: this.signupFirstForm.lastName,
                            zipCode: this.signupFirstForm.zip,
                            phoneNumber: this.formatPhoneForApi(
                                this.signupFirstForm.phone
                            ),
                        };
                        // console.log('Email form, ', emailForm);
                        this.emailForm = emailForm;
                        this.accountForm = null;
                        const validateByEmailResponse =
                            await this.userRegisterService.validateUserByEmail(
                                emailForm,
                                this.userRegisterToken
                            );
                        // const validateByEmailResponse = this.composeEmailResponse();
                        const action = handleResponse(
                            validateByEmailResponse,
                            'email'
                        );
                        switch (action.action) {
                            case 'try-register-user':
                                this.userRegInfo = action.userRegInfo;
                                await this.register(this.userRegInfo);
                                isUserRegisterTokenValid = true;
                                break;
                            case 'tell-customer-to-login':
                            case 'need-retry':
                                this.displayErrorMsg = true;
                                this.errorMsgFirstForm = action.message;
                                isUserRegisterTokenValid = true;
                                break;
                            case 'ask-for-invoice-number':
                                this.signupFormEmail.addControl(
                                    'companyControl',
                                    this.companyFormControl
                                );
                                this.signupFormEmail.controls[
                                    'companyControl'
                                ].reset();
                                this.signupFormEmail.addControl(
                                    'accountControl',
                                    this.accountFormControl
                                );
                                this.signupFormEmail.controls[
                                    'accountControl'
                                ].reset();
                                this.signupFormEmail.addControl(
                                    'invoiceNumberControl',
                                    this.invoiceNumberFormControl
                                );
                                this.signupFormEmail.controls[
                                    'invoiceNumberControl'
                                ].reset();
                                this.signupFormEmail.addControl(
                                    'invoiceDateControl',
                                    this.invoiceDateFormControl
                                );
                                this.signupFormEmail.controls[
                                    'invoiceDateControl'
                                ].reset();
                                this.activeForm = 'secondaryForm';
                                // console.log('signupForm, ', this.signupFormEmail);
                                isUserRegisterTokenValid = true;
                                break;
                            case 'contact-support':
                                this.activeForm = 'contactSupport';
                                isUserRegisterTokenValid = true;
                                break;
                            case 'select-a-branch':
                                this.userRegInfo = action.userRegInfo;
                                if (validateByEmailResponse.result) {
                                    if (
                                        validateByEmailResponse.result
                                            .branchSelection
                                    ) {
                                        const branchSelection =
                                            validateByEmailResponse.result
                                                .branchSelection;
                                        this.accountId =
                                            branchSelection.accountId;
                                        this.branches =
                                            branchSelection.branches;
                                        if (!this.branchSelection) {
                                            return;
                                        }
                                        this.branchDialog.open(
                                            this.branchSelection,
                                            {
                                                id: 'branchSelection',
                                                width: '480px',
                                                data: {
                                                    source: 'email',
                                                },
                                            }
                                        );
                                    }
                                }
                                // console.log('select a branch after email form submit');
                                isUserRegisterTokenValid = true;
                                break;
                        }
                        // console.log('Email form response, ', validateByEmailResponse);
                        this.emailResponse = validateByEmailResponse;
                        this.accountResponse = null;
                    }
                }
            }
        } else {
            Object.keys(this.signupFormEmail.controls).forEach((key) =>
                this.signupFormEmail.controls[key].markAsTouched()
            );
            // console.log('form invalid, ', this.signupFormEmail);
        }
    }

    private async register(userRegInfo: UserRegInfo) {
        const registerResponse = await this.userRegisterService.register(
            userRegInfo,
            this.userRegisterToken
        );
        if (registerResponse.result) {
            if (registerResponse.result.registerSuccess) {
                this.activeForm = 'successMessage';
            } else {
                this.activeForm = 'contactSupport';
            }
        }
    }

    async goToNext() {
        this.displayErrorMsg = false;
        this.errorMsgFirstForm = '';
        this.displayAcctErrorMsg = false;
        this.errorMsgAccountForm = '';
        this.userRegInfo = null;
        this.selectedBranch = '';
        if (this.signupFormEmail.valid) {
            let isUserRegisterTokenValid = false;
            let loopCount = 0;
            while (!isUserRegisterTokenValid && loopCount < 5) {
                loopCount++;
                if (!this.userRegisterToken || loopCount !== 1) {
                    // call api to get user register token
                    const response =
                        await this.userRegisterService.getUserRegisterToken();
                    // console.log('get user register token response', response);
                    if (response) {
                        if (response.result) {
                            this.userRegisterToken =
                                response.result.userRegInfo.userRegisterToken;
                            // console.log('user register token, ', this.userRegisterToken);
                        }
                    }
                }
                // Call the api to validate user by account
                const accountForm: SignupAccountForm = {
                    emailAddress: this.signupFirstForm.email,
                    firstName: this.signupFirstForm.firstName,
                    lastName: this.signupFirstForm.lastName,
                    zipCode: this.signupFirstForm.zip,
                    phoneNumber: this.formatPhoneForApi(
                        this.signupFirstForm.phone
                    ),
                    companyName: this.signupSecondForm.company,
                    account: this.signupSecondForm.account,
                    invoice: this.signupSecondForm.invoiceNumber,
                    invoiceDate: this.formatDate(
                        this.signupSecondForm.invoiceDate
                    ),
                    emailFormInfo: {
                        emailAddress: this.signupFirstForm.email,
                        firstName: this.signupFirstForm.firstName,
                        lastName: this.signupFirstForm.lastName,
                        zipCode: this.signupFirstForm.zip,
                        phoneNumber: this.formatPhoneForApi(
                            this.signupFirstForm.phone
                        ),
                    },
                };
                console.log('Account form, ', accountForm);
                this.accountForm = accountForm;
                this.emailForm = null;
                const validateByAccountResponse =
                    await this.userRegisterService.validateUserByAccount(
                        accountForm,
                        this.userRegisterToken
                    );
                // const validateByAccountResponse = this.composeAccountResponse();
                // console.log('Account form response, ', validateByAccountResponse);
                this.accountResponse = validateByAccountResponse;
                this.emailResponse = null;
                const action = handleResponse(
                    validateByAccountResponse,
                    'account'
                );
                switch (action.action) {
                    case 'try-register-user':
                        this.userRegInfo = action.userRegInfo;
                        await this.register(this.userRegInfo);
                        isUserRegisterTokenValid = true;
                        break;
                    case 'tell-customer-to-login':
                    case 'need-retry':
                        this.displayAcctErrorMsg = true;
                        this.errorMsgAccountForm = action.message;
                        isUserRegisterTokenValid = true;
                        break;
                    case 'contact-support':
                        this.activeForm = 'contactSupport';
                        isUserRegisterTokenValid = true;
                        break;
                    case 'select-a-branch':
                        this.userRegInfo = action.userRegInfo;
                        if (validateByAccountResponse.result) {
                            if (
                                validateByAccountResponse.result.branchSelection
                            ) {
                                const branchSelection =
                                    validateByAccountResponse.result
                                        .branchSelection;
                                this.accountId = branchSelection.accountId;
                                this.branches = branchSelection.branches;
                                if (!this.branchSelection) {
                                    return;
                                }
                                this.branchDialog.open(this.branchSelection, {
                                    id: 'branchSelection',
                                    width: '480px',
                                    data: {
                                        source: 'account',
                                    },
                                });
                            }
                        }
                        // console.log('select a branch after account form submit');
                        isUserRegisterTokenValid = true;
                        break;
                }
            }
        } else {
            Object.keys(this.signupFormEmail.controls).forEach((key) =>
                this.signupFormEmail.controls[key].markAsTouched()
            );
            // console.log('form invalid, ', this.signupFormEmail);
        }
    }

    async homePage() {
        await this.router.navigate(['/']);
    }

    backClick() {
        this.signupFirstForm.email = '';
        this.signupFirstForm.firstName = '';
        this.signupFirstForm.lastName = '';
        this.signupFirstForm.zip = '';
        this.signupFirstForm.phone = '';
        this.signupSecondForm.company = '';
        this.signupSecondForm.account = '';
        this.signupSecondForm.invoiceNumber = '';
        this.signupSecondForm.invoiceDate = '';

        if (this.signupFormEmail.controls['companyControl']) {
            this.signupFormEmail.removeControl('companyControl');
        }
        if (this.signupFormEmail.controls['accountControl']) {
            this.signupFormEmail.removeControl('accountControl');
        }
        if (this.signupFormEmail.controls['invoiceNumberControl']) {
            this.signupFormEmail.removeControl('invoiceNumberControl');
        }
        if (this.signupFormEmail.controls['invoiceDateControl']) {
            this.signupFormEmail.removeControl('invoiceDateControl');
        }
        // console.log('signupFormEmail, ', this.signupFormEmail);

        this.activeForm = '';
        this.formDirective.resetForm();
        this.signupFormEmail.reset();

        this.emailResponse = null;
        this.accountResponse = null;
        this.emailForm = null;
        this.accountForm = null;
        this.userRegInfo = null;
        this.selectedBranch = '';
    }

    async signIn() {
        await this.router.navigate(['/proplus/login']);
    }

    async forgotPassword() {
        await this.router.navigate(['/proplus/forgot-password']);
    }

    formatPhoneForApi(phone: string) {
        if (phone && phone.length > 0) {
            phone = phone.replace(
                /^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
                '$1$2$3'
            );
        }
        return phone;
    }

    getFormClass() {
        if (this.activeForm === '') {
            return 'cell medium-6 large-6 sign-up-form';
        } else {
            return 'cell medium-12 large-12 sign-up-form';
        }
    }

    getFirstFormClass() {
        if (this.activeForm === '') {
            return 'cell medium-12 large-12 beacon-customer-form';
        } else {
            return 'cell medium-6 large-6 beacon-customer-form';
        }
    }

    isValidDate() {
        if (this.signupSecondForm.invoiceDate) {
            const invoiceDate = new Date(this.signupSecondForm.invoiceDate);
            return invoiceDate <= this.currentDate;
        } else {
            return true;
        }
    }

    formatDate(d: string): string {
        try {
            const inputDate = moment(d);
            return inputDate.format('MM-DD-YYYY');
        } catch {
            return d;
        }
    }

    composeEmailResponse(): ValidateByEmailOrAccountResponse {
        const response: ValidateByEmailOrAccountResponse = {
            messages: null,
            result: {
                accountSelection: null,
                branchSelection: {
                    accountId: '318032',
                    accountName: 'AFAB             *CASH*    508',
                    branches: [
                        {
                            branchId: '944',
                            branchName: 'JEFFERSON CITY BRANCH',
                        },
                        {
                            branchId: '508',
                            branchName: 'GOLDEN RING BRANCH',
                        },
                    ],
                },
                needContactSupport: false,
                needGetUserRegisterToken: false,
                needLogin: false,
                needRetry: false,
                registerSuccess: false,
                retryTimesLeft: 0,
                showAccountSelection: false,
                showBranchSelection: true,
                userRegInfo: {
                    account: null,
                    accountInfos: [
                        {
                            accountId: '318032',
                            accountName: 'AFAB             *CASH*    508',
                            branchId: '944',
                        },
                        {
                            accountId: '318032',
                            accountName: 'AFAB             *CASH*    508',
                            branchId: '508',
                        },
                    ],
                    companyName: null,
                    emailAddress: 'test4manybranches@ehrenman.com',
                    emailFormInfo: null,
                    firstName: 'Chen',
                    fullName: null,
                    internalUser: false,
                    invoice: null,
                    invoiceDate: null,
                    lastName: 'Gu',
                    osrAccounts: ['318032'],
                    phoneNumber: '2015072563',
                    registerDate: null,
                    registerFailReason: null,
                    registerUserEmailType: null,
                    token: 'eyJhbGciOiJIUzUxMiJ9.eyJVc2VyUmVnaXN0ZXJJbmZvIjoidGVzdDRtYW55YnJhbmNoZXNAZWhyZW5tYW4uY29tIiwiZXhwIjoxNjA4MjIxNzg0fQ.z-SJxdazUzamTM_7eflW31UEQjoBlxnRnLMa4jlPLUZxJzr9CQOaIyramqP12spEfaAUZCwXSEuPXLoFHUhg5g',
                    userRegisterToken:
                        '2yakc4s1d1ttawixz12tlqu6hakcb5x3sx34nb7sb0n9elpd60vjr2j0mbfq2kt7',
                    validationErrorTimes: null,
                    zipCode: '07073',
                },
            },
            success: true,
        };
        return response;
    }

    composeAccountResponse(): ValidateByEmailOrAccountResponse {
        const response: ValidateByEmailOrAccountResponse = {
            messages: null,
            result: {
                accountSelection: null,
                branchSelection: {
                    accountId: '318032',
                    accountName: 'AFAB             *CASH*    508',
                    branches: [
                        {
                            branchId: '944',
                            branchName: 'JEFFERSON CITY BRANCH',
                        },
                        {
                            branchId: '508',
                            branchName: 'GOLDEN RING BRANCH',
                        },
                    ],
                },
                needContactSupport: false,
                needGetUserRegisterToken: false,
                needLogin: false,
                needRetry: false,
                registerSuccess: false,
                retryTimesLeft: 0,
                showAccountSelection: false,
                showBranchSelection: true,
                userRegInfo: {
                    account: '318032',
                    accountInfos: [
                        {
                            accountId: '318032',
                            accountName: 'AFAB             *CASH*    508',
                            branchId: '944',
                        },
                        {
                            accountId: '318032',
                            accountName: 'AFAB             *CASH*    508',
                            branchId: '508',
                        },
                    ],
                    companyName: 'AFAB *CASH* 508',
                    emailAddress: 'chen.gu.shift7+62@gmail.com',
                    emailFormInfo: {
                        emailAddress: 'chen.gu.shift7+62@gmail.com',
                        firstName: 'Chen',
                        lastName: 'Gu',
                        phoneNumber: '2015072563',
                        zipCode: '07073',
                    },
                    firstName: 'Chen',
                    fullName: null,
                    internalUser: false,
                    invoice: 'FX01088',
                    invoiceDate: '08-12-2020',
                    lastName: 'Gu',
                    osrAccounts: ['318032'],
                    phoneNumber: '2015072563',
                    registerDate: null,
                    registerFailReason: null,
                    registerUserEmailType: null,
                    token: 'eyJhbGciOiJIUzUxMiJ9.eyJVc2VyUmVnaXN0ZXJJbmZvIjoiY2hlbi5ndS5zaGlmdDcrNTVAZ21haWwuY29tIiwiZXhwIjoxNjA4MjIyOTY1fQ.wk3MG_IYMUNMXaX0ESqzfDZ0O01p5KoWZsTzLZKCmCHhNMMF2qZspk6A0RyXOUaHwl9DIknBlVT4zr1hvzeafQ',
                    userRegisterToken:
                        'dtqso499u2lu7ss0g1sqoew8gc7vjm8kfsdrss1r8q63l9wizpj95u38hktrn4w2',
                    validationErrorTimes: null,
                    zipCode: '07073',
                },
            },
            success: true,
        };
        return response;
    }

    async selectBranch(source: string) {
        if (this.formBranchSelection.valid) {
            const branchSelectionDialog =
                this.branchDialog.getDialogById('branchSelection');
            if (branchSelectionDialog) {
                branchSelectionDialog.close();
            }
            if (this.selectedBranch) {
                // Branch is selected. Call the register api with the userRegInfo together with selected branch
                if (this.userRegInfo) {
                    // Choose the correct account with branch for accountInfos field
                    let userRegInfoWithBranch = this.userRegInfo;
                    let accountInfos = userRegInfoWithBranch.accountInfos;
                    if (accountInfos) {
                        accountInfos = accountInfos.filter(
                            (branch) => branch.branchId === this.selectedBranch
                        );
                        userRegInfoWithBranch.accountInfos = accountInfos;
                        // console.log('user reg info after branch selection, ', userRegInfoWithBranch);
                        await this.register(userRegInfoWithBranch);
                        return;
                    }
                }
            }
            if (source === 'email') {
                this.errorMsgFirstForm =
                    'error in accountInfos in user reg info';
                this.displayErrorMsg = true;
            } else {
                this.errorMsgAccountForm =
                    'error in accountInfos in user reg info';
                this.displayAcctErrorMsg = true;
            }
        } else {
            Object.keys(this.formBranchSelection.controls).forEach((key) =>
                this.formBranchSelection.controls[key].markAsTouched()
            );
            // console.log('branch selection form invalid, ', this.formBranchSelection);
        }
    }
}

export function handleResponse(
    validateByEmailResponse: ValidateByEmailOrAccountResponse,
    source: string
): SignupActions {
    if (!validateByEmailResponse.success) {
        // Signing up was unsuccessful - Why?
        if (validateByEmailResponse.result) {
            const result = validateByEmailResponse.result;
            if (result.needContactSupport) {
                //  Customer should contact support
                return { action: 'contact-support' };
            } else if (result.needGetUserRegisterToken) {
                return { action: 'request-register-token' };
            } else if (result.needRetry) {
                if (result.retryTimesLeft > 0) {
                    if (validateByEmailResponse.messages) {
                        let message = validateByEmailResponse.messages[0].value;
                        return { action: 'need-retry', message: message };
                    } else {
                        return {
                            action: 'need-retry',
                            message: 'You need to try again',
                        };
                    }
                } else {
                    if (source === 'email') {
                        return { action: 'ask-for-invoice-number' };
                    } else {
                        return { action: 'contact-support' };
                    }
                }
            } else if (result.needLogin) {
                //  Customer should log in
                if (validateByEmailResponse.messages) {
                    let message = validateByEmailResponse.messages[0].value;
                    message = message.replace(
                        "href='/register'",
                        "(click)='signIn()'"
                    );
                    message = message.replace(
                        "href='/myAccount/forgotPassword'",
                        "(click)='forgotPassword()'"
                    );
                    return {
                        action: 'tell-customer-to-login',
                        message: message,
                    };
                } else {
                    return {
                        action: 'tell-customer-to-login',
                        message: 'You already have an account',
                    };
                }
            }
        }
    } else {
        //  Was successful
        if (validateByEmailResponse.result) {
            if (
                !validateByEmailResponse.result.showAccountSelection &&
                !validateByEmailResponse.result.showBranchSelection
            ) {
                //  Don't show selections and submit with userRegInfo
                const userRegInfo = validateByEmailResponse.result.userRegInfo;
                return {
                    action: 'try-register-user',
                    userRegInfo: userRegInfo,
                };
            } else if (validateByEmailResponse.result.showBranchSelection) {
                // User nees to select a branch as multiple branches are associated with user's account
                const userRegInfo = validateByEmailResponse.result.userRegInfo;
                return {
                    action: 'select-a-branch',
                    userRegInfo: userRegInfo,
                };
            }
        }
    }
    return { action: 'contact-support' };
}

type SignupActions =
    | { action: 'try-register-user'; userRegInfo: UserRegInfo }
    | { action: 'tell-customer-to-login'; message: string }
    | { action: 'need-retry'; message: string }
    | { action: 'ask-for-invoice-number' }
    | { action: 'contact-support' }
    | { action: 'request-register-token' }
    | { action: 'select-a-branch'; userRegInfo: UserRegInfo };

interface Branch {
    branchId: string;
    branchName: string;
}
