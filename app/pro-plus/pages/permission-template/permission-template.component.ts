import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { OrganizationService } from '../../services/organization.service';
import {
    PermissionTemplateResponse,
    PermssionTemplate,
} from '../../model/permission-template-response';
import { ConfirmationDialogComponent } from '../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { UserService } from '../../services/user.service';
import { SevereError } from '../../../common-components/classes/app-error';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-permission-template',
    templateUrl: './permission-template.component.html',
    styleUrls: ['./permission-template.component.scss'],
})
export class PermissionTemplateComponent implements OnInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    isLoading = true;
    displayedColumns: string[] = ['name', 'last', 'empty'];
    orgId!: string;
    dataSource = new MatTableDataSource<PermssionTemplate>();
    config = new MatSnackBarConfig();
    templateCount: number = 0;

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }
    get sessionInfo() {
        return this.userService.sessionInfo;
    }

    constructor(
        private readonly organizationService: OrganizationService,
        public readonly dialog: MatDialog,
        private readonly userService: UserService,
        private readonly _snackBar: MatSnackBar
    ) {}

    async ngOnInit() {
        try {
            //Verify that you have permissions
            if (this.sessionInfo && this.sessionInfo.roleType === 'Site User') {
                throw new SevereError('forbidden');
            }
            this.isLoading = true;
            this.config.verticalPosition = 'top';
            this.config.duration = 10000;
            const request = {
                sortBy: 'lastModifiedDate',
                sortType: 'desc',
                pageIndex: 1,
                pageSize: 30,
            };
            const response: PermissionTemplateResponse = await this.organizationService.getPermissionList(
                request
            );
            this.dataSource.data = response.result.permssionTemplate;
            if (response && response.result && response.result.pagination) {
                this.templateCount = response.result.pagination.totalCount;
            }
        } finally {
            this.isLoading = false;
        }
    }

    deleteTemplate(templateId: string) {
        this.askUserToConfirm({
            title: 'Delete Template',
            question: 'Are you sure you want to delete this template?',
            yesButton: 'Confirm',
            noButton: 'No',
            whenYes: async () => {
                await this.organizationService
                    .deletePermissionTemplate(templateId)
                    .then((res) => {
                        if (res.success) {
                            this._snackBar.open(
                                'Template deleted successfully',
                                'Close',
                                this.config
                            );
                            this.ngOnInit();
                        }
                    });
            },
        });
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
    async loadPermissionList(request: any) {
        try {
            if (!this.dataSource) {
                return;
            }
            this.isLoading = true;
            const response = await this.organizationService.getPermissionList(
                request
            );
            if (response) {
                if (response.result) {
                    if (response.result.pagination) {
                        this.templateCount =
                            response.result.pagination.totalCount;
                    }
                    this.dataSource.data = response.result.permssionTemplate;
                }
            }
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
    ngAfterViewInit() {
        this.paginator.page
            .pipe(
                tap(() =>
                    this.loadPermissionList({
                        sortBy: 'lastModifiedDate',
                        sortType: 'desc',
                        pageIndex: this.paginator.pageIndex + 1,
                        pageSize: this.paginator.pageSize,
                    })
                )
            )
            .subscribe();
    }
}
