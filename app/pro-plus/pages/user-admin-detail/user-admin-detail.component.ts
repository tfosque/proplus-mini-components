import { Message } from './../../model/quote-browse-response';
import { Component, OnInit } from '@angular/core';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';

import { OrganizationService } from '../../services/organization.service';
import {
    UserAdminDetailResponse,
    UserInfo,
} from '../../model/user-admin-response';
import { UserDetailsRequest } from '../../model/user-admin-details';
import { PermissionTemplateResponse } from '../../model/permission-template-response';
import { PermissionDialogComponent } from '../permission-template-detail/permission-dialog/permission-dialog.component';
import { UserService } from '../../services/user.service';
import {
    FormControl,
    Validators,
    FormGroupDirective,
    NgForm,
} from '@angular/forms';
import { Location } from '@angular/common';
import { GetCurrentUserInfoResponseV2 } from '../../model/get-current-user-response-v2';
import { AccountsResponse } from '../../model/accounts-response';
import { UserAdminPermNameDialogueComponent } from './user-admin-perm-name-dialogue/user-admin-perm-name-dialogue.component';
import { HttpErrorResponse } from '@angular/common/http';
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
    selector: 'app-user-admin-detail',
    templateUrl: './user-admin-detail.component.html',
    styleUrls: ['./user-admin-detail.component.scss'],
})
export class UserAdminDetailComponent implements OnInit {
    firstName = new FormControl('', [Validators.required]);
    tempName = new FormControl('', [Validators.required]);

    lastName = new FormControl('', [Validators.required]);
    title = new FormControl('', [Validators.required]);
    email = new FormControl('', [Validators.required, Validators.email]);
    phone = new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9-]*$/),
        Validators.minLength(12),
    ]);
    role = new FormControl('', [Validators.required]);
    status = new FormControl('', [Validators.required]);
    perm = new FormControl('', [Validators.required]);
    config = new MatSnackBarConfig();
    userResponse!: UserAdminDetailResponse;
    loading = true;
    edit = false;
    matcher = new MyErrorStateMatcher();
    globalAccounts!: GlobalAccount[];
    masterAdmin = '';
    adminUser: GetCurrentUserInfoResponseV2 | undefined = undefined;
    accounts: AccountsResponse | null = null;

    templateName?: string;
    userInfo: UserDetailsRequest = {
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        role: {
            id: '',
        },
        accounts: [
            {
                id: '',
                checked: true,
            },
        ],
        status: '',
        currentTemplate: '',
        permissionTemplate: {
            templateId: '',
        },
        permissionValues: {
            '700002': false,
            p10900002: false,
            '100005': false,
            '700001': false,
            '100003': false,
            '100004': false,
            '100007': false,
            '100006': false,
            p11100001: false,
            '400001': false,
        },
    };
    approveOrd!: string;
    disPerm = true;
    price!: string;
    placeOrd!: string;
    orderHist!: string;
    quotes!: string;
    rebate!: string;
    request!: any;
    permValues!: any;
    permList!: PermissionTemplateResponse;
    roles = [{ displayName: '', id: '' }];
    permListRequest = {
        sortBy: 'lastModifiedDate',
        sortType: 'desc',
        pageIndex: 1,
        pageSize: 30,
    };
    template = [
        { name: 'p10700002', value: false },
        { name: '100001', value: false },
        { name: '100005', value: false },
        { name: 'p10700003', value: false },
        { name: '100002', value: false },
        { name: '100004', value: false },
        { name: '100009', value: false },
        { name: '100006', value: false },
        { name: 'p10900001', value: false },
        { name: 'p10300001', value: false },
    ];
    userId!: string | null;
    // permissionNameRequired = true;
    constructor(
        private readonly route: ActivatedRoute,
        public saveDialog: MatDialog,
        private readonly organizationService: OrganizationService,
        private readonly _snackBar: MatSnackBar,
        private readonly router: Router,
        private readonly userService: UserService,
        private readonly location: Location,
        public dialogue: MatDialog
    ) {}

    get invalidForm() {
        if (
            !this.userInfo.firstName ||
            !this.userInfo.lastName ||
            !this.userInfo.title ||
            !this.userInfo.email ||
            !this.userInfo.phone ||
            !this.userInfo.role ||
            !this.userInfo.status ||
            // (this.isCustomized && !this.templateName) ||
            // !this.templateName || TODO: revisit template name with Hema and Marzia
            !this.userInfo.phone.match(/^[0-9-]*$/)
        ) {
            return true;
        } else {
            return false;
        }
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    async ngOnInit() {
        // get route params
        /*  const r = this.router.url;
         if (r.includes('proplus/user-admin/new')) {
             this.permissionNameRequired = false;
         } */

        try {
            const currentUser = await this.userService.ensureCurrentUserInfo();
            this.config.verticalPosition = 'top';
            this.config.duration = 10000;
            const p: ParamMap = this.route.snapshot.paramMap;
            this.userId = p.get('userId');
            let rol = await this.userService.getRoleList();
            if (rol) {
                rol.result = rol.result.filter((r) => r.id !== '200001');

                this.roles = rol.result.map((v) => {
                    const role = {
                        id: v.id,
                        displayName: v.displayName,
                    };
                    return role;
                });
            }
            if (this.userId === 'new') {
                this.edit = true;
                this.accounts = await this.userService.getAccounts();
                if (!this.accounts) {
                    throw new Error(
                        'Accounts not found, please contact your administrator'
                    );
                }
                this.adminUser = currentUser;
                const userDet = await this.organizationService.getUserDetail(
                    this.adminUser.profileId
                );
                this.masterAdmin = userDet.result.org.masterAdmin.email;
                this.edit = true;
                this.permList =
                    await this.organizationService.getPermissionList(
                        this.permListRequest
                    );
                this.setPermValues();
                this.userInfo.permissionTemplate.templateId = 'def';
                this.globalAccounts = this.accounts.accounts.map((v) => {
                    const account = {
                        displayName: v.accountName,
                        checked: v.accountEnabled,
                        id: v.accountLegacyId,
                    };
                    return account;
                });
            } else {
                if (this.userId !== 'new' && this.userId) {
                    this.userResponse =
                        await this.organizationService.getUserDetail(
                            this.userId
                        );
                    this.globalAccounts = this.userResponse.result.accounts;
                    this.masterAdmin =
                        this.userResponse.result.org.masterAdmin.email;
                    this.permList =
                        await this.organizationService.getPermissionList(
                            this.permListRequest
                        );

                    this.bindData(this.userResponse);
                    this.setPermValues();
                    this.userInfo = this.bindDataUser(this.userResponse.result);
                    if (this.userInfo.currentTemplate === 'custom') {
                        this.userInfo.permissionTemplate.templateId =
                            'customized';
                    } else if (this.userInfo.currentTemplate === 'default') {
                        this.userInfo.permissionTemplate.templateId = 'default';
                    }
                }
            }
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 403) {
                await this.router.navigate(['error'], {
                    queryParams: {
                        type: 'forbidden',
                    },
                });
            }
        } finally {
            this.loading = false;
        }
    }

    goBack() {
        this.location.back();
    }

    triggerDialogue() {
        const dialogRef = this.dialogue.open(
            UserAdminPermNameDialogueComponent
        );

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.templateName = result;
                this.saveTemplate();
            }
            // console.log(`Dialog result: ${result}`);
        });
    }

    bindData(user: UserAdminDetailResponse) {
        for (const i of user.result.permissionTemplate.permissions[0]
            .permissions) {
            if (i.isAuthorised) {
                this.approveOrd = i.id;
            } else {
                this.approveOrd = 'false';
            }
        }
        for (const i of user.result.permissionTemplate.permissions[1]
            .permissions) {
            if (i.isAuthorised) {
                this.price = i.id;
            } else {
                this.price = 'false';
            }
        }
        for (const i of user.result.permissionTemplate.permissions[2]
            .permissions) {
            if (i.isAuthorised) {
                this.placeOrd = i.id;
            }
        }
        if (!this.placeOrd) {
            this.placeOrd = 'false';
        }
        for (const i of user.result.permissionTemplate.permissions[3]
            .permissions) {
            if (i.isAuthorised) {
                this.orderHist = i.id;
            }
        }
        if (!this.orderHist) {
            this.orderHist = 'false';
        }
        for (const i of user.result.permissionTemplate.permissions[4]
            .permissions) {
            if (i.isAuthorised) {
                this.quotes = i.id;
            }
        }
        if (!this.quotes) {
            this.quotes = 'false';
        }
        for (const i of user.result.permissionTemplate.permissions[5]
            .permissions) {
            if (i.isAuthorised) {
                this.rebate = i.id;
            }
        }
        if (!this.rebate) {
            this.rebate = 'false';
        }
    }

    addDash() {
        return (this.userInfo.phone = this.userInfo.phone.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }

    addDashUserInfo(phone: string) {
        if (phone) {
            return phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3');
        } else {
            return '';
        }
    }

    setPermValues() {
        const listTemp = this.template.map((temp) => {
            if (
                temp.name === this.approveOrd ||
                temp.name === this.price ||
                temp.name === this.placeOrd ||
                temp.name === this.orderHist ||
                temp.name === this.quotes ||
                temp.name === this.rebate
            ) {
                temp.value = true;
                return temp;
            } else {
                temp.value = false;
                return temp;
            }
        });
        this.permValues = {};
        for (let i = 0; i < listTemp.length; i++) {
            this.permValues[listTemp[i].name] = listTemp[i].value;
        }
        return this.permValues;
    }

    bindDataUser(user: UserInfo) {
        if (this.userId !== 'new') {
            const userInfo: UserDetailsRequest = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                title: user.title,
                email: user.email,
                phone: this.addDashUserInfo(user.phone),
                role: user.role,
                accounts: user.accounts,
                status: user.status,
                currentTemplate: user.currentTemplate,
                permissionTemplate: {
                    templateId: user.permissionTemplate.templateId,
                },
                permissionValues: this.permValues,
            };
            return userInfo;
        } else {
            const userInfo: any = {
                firstName: user.firstName,
                lastName: user.lastName,
                title: user.title,
                email: user.email,
                phone: this.addDashUserInfo(user.phone),
                role: user.role,
                accounts: user.accounts,
                status: user.status,
                currentTemplate: user.currentTemplate,
                permissionTemplate: {
                    templateId: user.permissionTemplate.templateId,
                },
                permissionValues: this.permValues,
            };
            return userInfo;
        }
    }

    openDialog() {
        const dialogRef = this.saveDialog.open(PermissionDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.templateName = result;
                await this.saveTemplate();
            }

            // console.log(`Dialog result: ${result}`);
        });
    }

    async saveTemplate() {
        if (this.templateName) {
            const request: any = {
                name: this.templateName,
                permissionValues: this.setPermValues(),
            };
            console.log('permissions:template', { request });
            const response =
                await this.organizationService.createPermissionTemplate(
                    request
                );
            if (response.messages[0].type === 'success') {
                this._snackBar.open(
                    'New template created',
                    'Close',
                    this.config
                );
            }
            this.userInfo.permissionTemplate.templateId =
                response.result.templateId;
        }
        const request = this.userInfo;

        if (this.userInfo.permissionTemplate.templateId === 'customized') {
            request.permissionValues = this.setPermValues();
            request.permissionTemplate.templateId = null;
            request.currentTemplate = 'Customized Permission';
        }
        if (this.userInfo.permissionTemplate.templateId === 'default') {
            request.permissionValues = this.setPermValues();
            request.permissionTemplate.templateId = null;
            request.currentTemplate = 'Default Role Template';
        }

        request.accounts = this.globalAccounts.map((acc) => {
            const account = {
                id: acc.id || '',
                checked: acc.checked || false,
            };
            return account;
        });

        if (request.status === 'Enabled') {
            request.status = 'Active';
        } else {
            request.status = 'InActive';
        }

        request.phone = this.formatPhoneForApi(this.userInfo.phone);

        if (this.userId === 'new') {
            request.phone = request.phone.replace(/[^0-9]/g, '');
            try{
                const response = await this.userService.createUser(request);
                this.addDash();
                if (request.status === 'Active') {
                    request.status = 'Enabled';
                } else {
                    request.status = 'Disabled';
                }
                if (response && response.messages[0].type === 'success') {
                    this._snackBar.open(
                        `User ${this.userInfo.firstName} ${this.userInfo.lastName} has been created`,
                        'Close',
                        this.config
                    );
                    this.router.navigateByUrl('/proplus/user-admin');
                }
            } catch(error){
                if(error instanceof Error){
                    this._snackBar.open(
                        error.toString().slice(18), 'Close', this.config
                    );
                }
            }

        } else {
            const response = await this.userService.updateUserAdmin(request);
            this.addDash();
            if (request.status === 'Active') {
                request.status = 'Enabled';
            } else {
                request.status = 'Disabled';
            }
            if (response.messages[0].type === 'success') {
                this._snackBar.open(
                    `User ${this.userInfo.firstName} ${this.userInfo.lastName} has been updated`,
                    'Close',
                    this.config
                );
                this.router.navigateByUrl('/proplus/user-admin');
            }
        }
    }

    async getPermValue(tempId: string | null) {
        if (!tempId) return;

        if (tempId === 'default') {
            this.disPerm = true;
            this.userInfo.currentTemplate = 'default';
            this.bindData(this.userResponse);
        } else if (tempId === 'customized') {
            this.userInfo.currentTemplate = 'custom';
            this.disPerm = false;
            this.approveOrd = 'false';
            this.price = 'false';
            this.placeOrd = 'false';
            this.orderHist = 'false';
            this.quotes = 'false';
            this.rebate = 'false';
        } else {
            this.disPerm = true;
            const permissionDetail =
                await this.organizationService.getPermissionListDetail(tempId);
            console.log(permissionDetail);
            for (const i of permissionDetail.result.permissions[0]
                .permissions) {
                if (i.isAuthorised) {
                    this.approveOrd = i.id;
                } else {
                    this.approveOrd = 'false';
                }
            }
            for (const i of permissionDetail.result.permissions[1]
                .permissions) {
                if (i.isAuthorised) {
                    this.price = i.id;
                } else {
                    this.price = 'false';
                }
            }
            for (const i of permissionDetail.result.permissions[2]
                .permissions) {
                if (i.isAuthorised) {
                    this.placeOrd = i.id;
                }
            }
            if (!this.placeOrd) {
                this.placeOrd = 'false';
            }
            for (const i of permissionDetail.result.permissions[3]
                .permissions) {
                if (i.isAuthorised) {
                    this.orderHist = i.id;
                }
            }
            if (!this.orderHist) {
                this.orderHist = 'false';
            }
            for (const i of permissionDetail.result.permissions[4]
                .permissions) {
                if (i.isAuthorised) {
                    this.quotes = i.id;
                }
            }
            if (!this.quotes) {
                this.quotes = 'false';
            }
            for (const i of permissionDetail.result.permissions[5]
                .permissions) {
                if (i.isAuthorised) {
                    this.rebate = i.id;
                }
            }
            if (!this.rebate) {
                this.rebate = 'false';
            }
        }
    }

    setEdit() {
        this.edit = true;
        if (this.userInfo.permissionTemplate.templateId === 'customized') {
            this.disPerm = false;
        }
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
}

export interface Account {
    displayName: string;
    checked: boolean;
}

export interface GlobalAccount {
    displayName: string | undefined;
    checked: boolean | undefined;
    id: string | undefined;
}

export interface RoleResult {
    result: InterfaceRole[];
    success: boolean;
    message: Message | null;
}
export interface InterfaceRole {
    id: string;
    displayName: string;
    permissions: Permission2[];
}

interface Permission2 {
    name: string;
    type: string;
    permissions: Permission[];
    isGroup: boolean;
}

interface Permission {
    id: string;
    key: string;
    groupId: string;
    name: string;
    displayName: string;
    type: string;
    isAuthorised: boolean;
    isDisabled: boolean;
    isFixed: boolean;
}
