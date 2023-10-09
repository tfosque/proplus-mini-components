import { Component, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { PermissionTemplateDetailResponse } from '../../model/permission-template-detail-response';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';
import { PermissionDialogComponent } from './permission-dialog/permission-dialog.component';
import { Location } from '@angular/common';
import { ConfirmationDialogComponent } from '../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { UserService } from '../../services/user.service';
import { SevereError } from '../../../common-components/classes/app-error';

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
    selector: 'app-permission-template-detail',
    templateUrl: './permission-template-detail.component.html',
    styleUrls: ['./permission-template-detail.component.scss'],
})
export class PermissionTemplateDetailComponent implements OnInit {
    isLoading = true;
    templateId = '';
    templateName!: string;
    approveOrd!: string;
    price!: string;
    placeOrd!: string;
    orderHist!: string;
    quotes!: string;
    rebate!: string;
    response!: PermissionTemplateDetailResponse;
    request!: any;
    nameControl = new FormControl('', [Validators.required]);

    matcher = new MyErrorStateMatcher();
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
    config = new MatSnackBarConfig();

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }
    get sessionInfo() {
        return this.userService.sessionInfo;
    }

    constructor(
        private readonly _snackBar: MatSnackBar,
        private readonly route: ActivatedRoute,
        private readonly organizationService: OrganizationService,
        private readonly userService: UserService,
        public saveDialog: MatDialog,
        public readonly dialog: MatDialog,
        private readonly router: Router,
        private readonly location: Location
    ) {}

    async ngOnInit() {
        try {
            //Verify that you have permissions
            if (this.sessionInfo && this.sessionInfo.roleType === 'Site User') {
                throw new SevereError('forbidden');
            }
            this.config.verticalPosition = 'top';
            this.config.duration = 10000;
            const p: ParamMap = this.route.snapshot.paramMap;
            const templateId = p.get('permissionId');
            if (templateId) {
                this.templateId = templateId;
                if (this.templateId === 'new') {
                    this.approveOrd = 'false';
                    this.price = 'false';
                    this.placeOrd = 'false';
                    this.orderHist = 'false';
                    this.quotes = 'false';
                    this.rebate = 'false';
                } else {
                    this.response =
                        await this.organizationService.getPermissionListDetail(
                            templateId
                        );
                    this.fillData(this.response);
                }
            }
        } finally {
            this.isLoading = false;
        }
    }

    get templateNameValid() {
        if (this.templateName) {
            return false;
        } else {
            return true;
        }
    }

    openDialog() {
        const dialogRef = this.saveDialog.open(PermissionDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await this.saveTemplate(result);
            }

            // console.log(`Dialog result: ${result}`);
        });
    }
    goBack() {
        this.location.back();
    }
    buildRequest() {
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
        this.request = {};
        for (let i = 0; i < listTemp.length; i++) {
            this.request[listTemp[i].name] = listTemp[i].value;
        }
        return this.request;
    }

    fillData(data: PermissionTemplateDetailResponse) {
        for (const i of data.result.permissions[0].permissions) {
            if (i.isAuthorised) {
                this.approveOrd = i.id;
            } else {
                this.approveOrd = 'false';
            }
        }
        for (const i of data.result.permissions[1].permissions) {
            if (i.isAuthorised) {
                this.price = i.id;
            } else {
                this.price = 'false';
            }
        }
        for (const i of data.result.permissions[2].permissions) {
            if (i.isAuthorised) {
                this.placeOrd = i.id;
            }
        }
        if (!this.placeOrd) {
            this.placeOrd = 'false';
        }
        for (const i of data.result.permissions[3].permissions) {
            if (i.isAuthorised) {
                this.orderHist = i.id;
            }
        }
        if (!this.orderHist) {
            this.orderHist = 'false';
        }
        for (const i of data.result.permissions[4].permissions) {
            if (i.isAuthorised) {
                this.quotes = i.id;
            }
        }
        if (!this.quotes) {
            this.quotes = 'false';
        }
        for (const i of data.result.permissions[5].permissions) {
            if (i.isAuthorised) {
                this.rebate = i.id;
            }
        }
        if (!this.rebate) {
            this.rebate = 'false';
        }
        this.templateName = data.result.name;
    }

    async saveTemplate(tempName?: string) {
        this.request = {
            name: '',
            permissionValues: this.buildRequest(),
        };
        if (tempName) {
            this.request.name = tempName;
        } else {
            this.request.name = this.templateName;
        }
        const response =
            await this.organizationService.createPermissionTemplate(
                this.request
            );
        if (response.messages[0].type === 'success') {
            this._snackBar.open(
                'Permission Template Created',
                'Close',
                this.config
            );
            await this.router.navigateByUrl('/proplus/permission-template');
        }
    }
    askUserToConfirm<T>(config: {
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

    async updateTemp() {
        this.request = {
            id: this.templateId,
            name: this.templateName,
            permissionValues: this.buildRequest(),
        };
        const response =
            await this.organizationService.updatePermissionTemplate(
                this.request
            );
        if (response.messages[0].type === 'success') {
            this._snackBar.open(
                'Permission Template Updated',
                'Close',
                this.config
            );
        } else {
            this._snackBar.open(
                `${response.messages[0].value}`,
                'Close',
                this.config
            );
        }
    }
}
