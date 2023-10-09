import { UserService } from './../../services/user.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { OrganizationService } from '../../services/organization.service';
import { OrganizationListResponse } from '../../model/organization-list';
import {
    OrganizationResponse,
    UserListOrg,
} from '../../model/organization-response';
import { OrganizationRequest } from '../../model/organization-request';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { doTask } from './../../../global-classes/doTask';
import { ConfirmationDialogComponent } from '../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-user-admin',
    templateUrl: './user-admin.component.html',
    styleUrls: ['./user-admin.component.scss'],
})
export class UserAdminComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    displayedColumns: string[] = ['user', 'last', 'status', 'empty'];
    isLoading = true;
    orgId!: string;
    dataSource = new MatTableDataSource<UserListOrg>();
    templateCount!: number;

    createUser: boolean = false;

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly organizationService: OrganizationService,
        public readonly dialog: MatDialog,
        public readonly userService: UserService,
        private readonly router: Router
    ) {}
    //TODO: Come back because loading is weird and we can improve create button validation.
    //sometimes loading causes double screen flicker
    async ngOnInit() {
        try {
            // this.isLoading = true;
            return doTask('Retrieve list of users', async () => {
                const response: OrganizationListResponse = await this.organizationService.getOrganizations();
                this.orgId = response.result.id;
                const orgRequest: OrganizationRequest = {
                    orgId: this.orgId,
                    query: {
                        sortBy: 'lastModifiedDate',
                        sortType: 'desc',
                        pageIndex: 1,
                        pageSize: this.paginator ? this.paginator.pageSize : 10,
                    },
                };
                await this.loadUsersInfo(orgRequest);
                const currentUser = await this.userService.getCurrentUserInfo();
                this.userService.sessionBehavior.subscribe((v) => {
                    if (currentUser) {
                        if (v.isAdminOrMaster && !currentUser.internalUser) {
                            this.createUser = true;
                        }
                    }
                });
            });
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 403) {
                await this.router.navigate(['error'], {
                    queryParams: {
                        type: 'forbidden',
                    },
                });
            }
        } finally {
            this.isLoading = false;
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
    private async loadUsersInfo(request: OrganizationRequest) {
        try {
            if (!this.dataSource) {
                return;
            }
            this.isLoading = true;
            const response: OrganizationResponse = await this.organizationService.getUserInfo(
                request
            );
            if (response) {
                if (response.result) {
                    if (response.result.pagination) {
                        this.templateCount =
                            response.result.pagination.totalCount;
                    }
                    this.dataSource.data = response.result.users;
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
                    this.loadUsersInfo({
                        orgId: this.orgId,
                        query: {
                            sortBy: 'lastModifiedDate',
                            sortType: 'desc',
                            pageIndex: this.paginator.pageIndex + 1,
                            pageSize: this.paginator.pageSize,
                        },
                    })
                )
            )
            .subscribe();
    }
}
