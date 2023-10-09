import { ConfirmationDialogComponent } from './../../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { SelectionModel } from '@angular/cdk/collections';
import { TemplateReference } from '../../../model/template-list';
import { TemplatesService } from '../../../services/templates.service';
import { TemplateDataSource } from './template-data-source.service';
import { BehaviorSubject, combineLatest, merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { AccountsResponse } from '../../../model/accounts-response';
import { AccountDetails } from '../../../model/account-with-branch';
import { CreateTemplateRequest } from '../../../model/template-creation';
import { CreateTemplateDialogComponent } from '../template-dialog/create-template-dialog/create-template-dialog.component';
import { Router } from '@angular/router';
import moment from 'moment';
import { AccountSummary } from '../../../model/account';
import { TemplateTourService } from '../../../services/template-tour.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '../../../../enums/breakpoints.enum';

type SortFieldName =
    | 'templateName'
    | 'lastModifiedDate'
    | 'accountName'
    | 'createdByUser.lastName';

const sortFields = {
    templateName: 'templateName',
    lastModifiedDate: 'dataLastModified',
    accountName: 'account',
    'createdByUser.lastName': 'createdBy',
};

@Component( {
    selector: 'app-template-browse-page',
    templateUrl: './template-browse-page.component.html',
    styleUrls: ['./template-browse-page.component.scss'],
} )
export class TemplateBrowsePageComponent implements OnInit, AfterViewInit {
    @ViewChild( MatSort ) sort!: MatSort;
    @ViewChild( MatPaginator ) paginator!: MatPaginator;

    isLoading = true;
    searchText = '';
    searchDate!: any;
    selectedSearchValue = 'templateName';
    private readonly defaultSearchOption = {
        name: 'Template Name',
        value: 'templateName',
        type: 'search',
    };
    accounts: AccountsResponse = {
        message: '',
        messageCode: 0,
        result: '',
        totalNumRecs: 0,
        pageNumRecs: 0,
        accounts: [
            {
                accountName: '',
                accountEnabled: false,
                accountLegacyId: '',
                accountViewPrices: false,
                isAccountClosed: false,
                branch: {
                    address: {
                        postalCode: '',
                        state: '',
                        address1: '',
                        address2: '',
                        address3: '',
                        country: '',
                        city: '',
                    },
                    branchNumber: '',
                    branchName: '',
                    branchPhone: '',
                    branchRegionId: '',
                },
            },
        ],
    };
    searchTypes = [
        this.defaultSearchOption,
        //  TODO:  This needs to be an account lookup
        { name: 'Account', value: 'account', type: 'search' },
        { name: 'Last Modified', value: 'dataLastModified', type: 'date' },
        { name: 'Created By', value: 'createdBy', type: 'search' },
    ];
    dataSource?: TemplateDataSource | null = null;
    displayedColumns: string[] = [
        'select',
        'templateName',
        'lastModifiedDate',
        'accountName',
        'createdByUser.lastName',
        'actions',
    ];
    displayedColumnsMobile: string[] = [
        'select',
        'templateName',
        'lastModifiedDate',
        'actions',
    ];
    selection = new SelectionModel<TemplateReference>( true, [] );
    public filterChanging = false;
    public showOnboarding = new BehaviorSubject<boolean>( false );
    public playMode = new BehaviorSubject<boolean>( true );
    public autoTriggerOnboard = new BehaviorSubject<boolean>( false );

    public screenSize: any;
    isMediumScreen = false;
    isLargeScreen = false;
    layoutChangesMediumSub!: Subscription;
    layoutChangesLargeSub!: Subscription;
    get selectedSearch() {
        return (
            this.searchTypes.find(
                ( i ) => i.value === this.selectedSearchValue
            ) || this.defaultSearchOption
        );
    }

    get orderByField() {
        const active = this.sort.active as SortFieldName;
        return sortFields[active] || '';
    }

    get filterBy() {
        return this.selectedSearchValue;
    }

    get filter() {
        if ( this.selectedSearchValue === 'dataLastModified' ) {
            return this.formatDateForFilter( this.searchDate );
        } else {
            return this.searchText;
        }
    }

    get orderByDirection() {
        const { direction } = this.sort;
        return direction;
    }

    get getSmallScreen() {
        this.screenSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        if ( this.screenSize.width < 600 ) {
            return true;
        } else {
            return false;
        }
    }

    public get userAccount(): AccountSummary | null {
        return this.userService.lastSelectedAccount;
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly templateService: TemplatesService,
        private readonly userService: UserService,
        private readonly _snackBar: MatSnackBar,
        public dialog: MatDialog,
        private readonly router: Router,
        private templateTourService: TemplateTourService,
        private readonly breakpointObserver: BreakpointObserver
    ) { }

    async ngOnInit() {
        // this.templateTourService.autoTriggerOnboard$.subscribe(trigger => {
        //     // control show/ hide from ui
        //     this.autoTriggerOnboard.next(trigger);
        // });
        const layoutChangesLarge$ = this.breakpointObserver.observe( [
            Breakpoints.large,
        ] );

        this.layoutChangesLargeSub = layoutChangesLarge$.subscribe( ( result ) => {
            this.isLargeScreen = result.matches ? true : false;
        } );

        const layoutChangesMedium$ = this.breakpointObserver.observe( [
            Breakpoints.medium,
        ] );

        this.layoutChangesMediumSub = layoutChangesMedium$.subscribe(
            ( result ) => {
                this.isMediumScreen = result.matches ? true : false;
            }
        );
        try {
            this.screenSize = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
            this.accounts = await this.userService.ensureGetAccounts();
            this.dataSource = new TemplateDataSource( this.templateService );
            await this.loadTemplates();
        } finally {
            this.isLoading = false;
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): boolean {
        if ( !this.dataSource ) {
            return false;
        }
        if (
            this.dataSource.templateResponses.value === null ||
            !this.dataSource.templateResponses.value
        ) {
            return false;
        }
        if (
            this.dataSource.templateResponses.value.result.templates === null ||
            !this.dataSource.templateResponses.value.result.templates
        ) {
            return false;
        }
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.templateResponses.value.result.templates
            .length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        if ( !this.dataSource ) {
            return;
        }
        if ( this.dataSource.templateResponses.value === null ) {
            return;
        }
        if ( !this.dataSource.templateResponses.value.result.templates ) {
            return;
        }
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.templateResponses.value.result.templates.forEach(
                ( row ) => this.selection.select( row )
            );
    }

    async createTemplate( templateName: string ) {
        const accountId = this.userService.accountIdInString;
        if ( accountId === null ) {
            throw new Error( 'This should never happen' );
        }
        const request: CreateTemplateRequest = {
            templateName: templateName,
            account: accountId,
        };
        const templateResponse = await this.templateService.createTemplate(
            request
        );
        if ( templateResponse.success ) {
            const templateId = templateResponse.result.templateId;
            const accountLegacyId = templateResponse.result.accountLegacyId;
            this.showSnack( `Created your template: ${templateName}` );
            await this.router.navigateByUrl(
                `/proplus/accounts/${accountLegacyId}/templates/${templateId}`
            );
        } else {
            if (templateResponse.messages && templateResponse.messages[0]) {
                const errorMessage = templateResponse.messages[0];
                if (errorMessage.value && errorMessage.value.indexOf('duplicate') > -1) {
                    this.showSnack(`Template ${templateName} already exists, please enter a different name.`
                    , 'close', 5000);
                } else {
                    this.showSnack( `Failed to create - ${templateName}. ${errorMessage.value}` );
                }
            } else {
                this.showSnack( `Failed to create - ${templateName}` );
            }
            console.error( templateResponse );
        }
    }

    openDialog() {
        const dialogRef = this.dialog.open( CreateTemplateDialogComponent, {} );

        dialogRef.afterClosed().subscribe( async ( templateName: string ) => {
            if ( templateName ) {
                await this.createTemplate( templateName );
            }
        } );
    }

    showSnack(
        message: string,
        title: string = 'Close',
        duration: number = 3000
    ) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = duration;
        // if (this.selection.selected.length === 0) {
        //   this._snackBar.open(`Select at least one template.`, 'Close', config);
        // }
        this._snackBar.open( message, title, config );
    }

    async copyTemplatesToAccount( account: AccountDetails ) {
        if ( account.isAccountClosed ) {
            this.showSnack(
                `account ${account.accountName} is closed. You cannot copy to this account.`,
                'Close'
            );
            return;
        }
        this.askUserToConfirm( {
            title: 'Copy to Account',
            question: 'Are you sure you want to copy this template?',
            whenYes: async () => {
                //  Get the slected template
                const templates = this.selection.selected;
                const templateList = templates.map( ( v ) => {
                    return v.templateId;
                } );
                //  This actually does nothing
                templateList.join( ',' );
                //  Was it supposed to turn the list into a string list?   I believe .toString does it automatically
                const list = templateList.toString();

                //  Actually copy the template
                const request: CopyRequest = {
                    account: account.accountLegacyId,
                    templateId: list,
                };
                const response = await this.templateService.copyTemplate(
                    request
                );

                //  Let the user know
                if ( response.success ) {
                    this.showSnack(
                        `Template has been copied to account ${account.accountName}`,
                        'Close'
                    );
                }
                this.selection.clear();
            },
        } );
    }

    async duplicateTemplate() {
        this.askUserToConfirm( {
            title: 'Duplicate Template(s)',
            question: 'Are you sure you want to copy this template(s)?',
            whenYes: async () => {
                //  Configure the snack bar
                const account = await this.userService.ensureSessionInfo();
                if ( this.selection.selected.length === 0 ) {
                    this.showSnack( `Select at least one template.`, 'Close' );
                }
                //  Get the templates
                const templates = this.selection.selected;
                const templateList = templates.map( ( v ) => {
                    return v.templateId;
                } );
                templateList.join( ',' );
                const list = templateList.toString();

                //  Actually copy the template
                const request: CopyRequest = {
                    account: account.lastSelectedAccount.accountLegacyId,
                    templateId: list,
                };
                const response = await this.templateService.copyTemplate(
                    request
                );
                if ( response.success ) {
                    this.showSnack(
                        ` Template(s) has been duplicated successfully.`,
                        'Close'
                    );
                    await this.ngOnInit();
                }
                this.selection.clear();
            },
        } );
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel( row?: any ): string {
        if ( !row ) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected( row ) ? 'deselect' : 'select'} row ${row.position + 1
            }`;
    }

    askUserToConfirm<T>( config: {
        title: string;
        yesButton?: string;
        noButton?: string;
        question: string;
        whenYes: () => void;
    } ) {
        const dialogRef = this.dialog.open( ConfirmationDialogComponent, {
            data: {
                confimation: config.yesButton || 'Yes',
                no: config.noButton || 'No',
                question: config.question,
                title: config.title,
            },
        } );
        dialogRef.afterClosed().subscribe( async ( result: boolean ) => {
            if ( result ) {
                config.whenYes();
            }
        } );
    }

    async deleteSingleTemplate( template: TemplateReference ) {
        this.askUserToConfirm( {
            title: 'Delete Template',
            question: 'Are you sure you want to delete this template?',
            yesButton: 'Delete',
            noButton: 'No',
            whenYes: async () => {
                try {
                    this.isLoading = true;
                    if ( !template.templateId || !template.accountLegacyId ) {
                        throw new Error( 'Error deleting the template' );
                    }
                    const response = await this.templateService.deleteTemplate(
                        template.templateId,
                        template.accountLegacyId
                    );
                    if ( response.success ) {
                        this.showSnack(
                            `Template ${template.templateName} deleted`,
                            'Close'
                        );
                        await this.ngOnInit();
                    } else {
                        this.isLoading = false;
                    }
                    this.selection.clear();
                } finally {
                    this.isLoading = false;
                }
            },
        } );
    }

    async deleteMultipleTemplates() {
        this.askUserToConfirm( {
            title: 'Delete Templates',
            question: 'Are you sure you want to delete this template(s)?',
            whenYes: async () => {
                const account = await this.userService.ensureSessionInfo();
                if ( this.selection.selected.length === 0 ) {
                    this.showSnack(
                        `Please select template(s) to delete`,
                        'Close'
                    );
                }

                const templates = this.selection.selected;
                const templateList = templates.map( ( v ) => {
                    return v.templateId;
                } );
                const templateNames = templates.map( ( v ) => {
                    return v.templateName;
                } );
                // templateList.join(',');
                const list = templateList.toString();
                const names = templateNames.toString();
                const request: CopyRequest = {
                    account: account.lastSelectedAccount.accountLegacyId,
                    templateId: list,
                    templateName: names,
                };
                const response = await this.templateService.deleteTemplate(
                    request.templateId,
                    request.account
                );
                if ( response.success ) {
                    this.showSnack(
                        `Template(s) ${request.templateName} deleted`,
                        'Close'
                    );
                    await this.ngOnInit();
                }
                this.selection.clear();
            },
        } );
    }

    ngAfterViewInit() {
        /* ONBOARDING Show/ Hide */
        // this.userSvc.getFirstLoggedIn();
        /* Check for platform here */
        // setTimeOut function is needed here to avoid the ExpressionChangedAfterItHasBeenCheckedError error
        setTimeout( () => {
            combineLatest(
                this.userService.firstLoggedInLess48Hours$,
                this.userService.lastActivityIsMoreThan30Days$,
                this.templateTourService.playMode$
            ).subscribe( ( [isNewUser, isMoreThan30Days, mode] ) => {
                // console.log({isNewUser}, {isMoreThan30Days}, {mode});
                this.playMode.next( mode );
                if (
                    ( isNewUser || isMoreThan30Days ) &&
                    this.playMode.value &&
                    window.innerWidth > 1250
                ) {
                    this.router.navigate( ['/proplus/template-tour'] );
                }
            } );
        } );

        // this.toursService.usersNextScheduledTours$.subscribe(nextTour => {
        //     console.log({nextTour});
        //     console.log('template landing tour opt out: ', nextTour.templatesLandingTour.optOut);
        //     if (nextTour.templatesLandingTour.optOut) return;
        //     // Otherwise show the tour to the customer
        // })

        // this.templateTourService.playMode$.subscribe(mode => {
        //     this.playMode.next(mode);
        // })

        // this.userService.firstLoggedInLess48Hours$
        //     // control show/ hide from user session data
        //     .subscribe(isNew => {
        //         this.showOnboarding.next(isNew);
        //         if (isNew && this.playMode.value && window.innerWidth > 1250) {
        //             this.router.navigate(['/proplus/template-tour']);
        //         }
        //     })

        this.sort.sortChange.subscribe( () => ( this.paginator.pageIndex = 0 ) );

        merge( this.sort.sortChange, this.paginator.page )
            .pipe( tap( () => this.loadTemplates() ) )
            .subscribe();
    }

    async loadTemplates() {
        try {
            const account = '';
            if ( !this.dataSource ) {
                return;
            }
            this.isLoading = true;
            const pageNo = this.paginator.pageIndex;
            const pageSize = this.paginator.pageSize;
            const filterBy = this.filterBy;
            const filter = this.filter;
            await this.dataSource.loadTemplates(
                account,
                pageNo,
                pageSize,
                filterBy,
                filter,
                this.orderByField,
                this.orderByDirection
            );
        } finally {
            this.isLoading = false;
        }
    }

    get templateCount() {
        if ( !this.dataSource ) {
            return 0;
        }
        const responses = this.dataSource.templateResponses;
        if ( !responses ) {
            return 0;
        }
        if ( !responses.value ) {
            return 0;
        }
        if ( !responses.value.result.totalNumRecs ) {
            return 0;
        }
        return responses.value.result.totalNumRecs;
    }

    async doSearch() {
        this.paginator.pageIndex = 0;
        this.filterChanging = false;
        await this.loadTemplates();
    }

    formatDateForFilter( d: string ): string {
        try {
            const inputDate = moment( d );
            return inputDate.format( 'YYYY-MM-DD' );
        } catch {
            return d;
        }
    }

    async clearFilter() {
        this.selectedSearchValue = 'templateName';
        this.searchDate = '';
        this.searchText = '';
        this.filterChanging = false;
        this.paginator.pageIndex = 0;
        await this.loadTemplates();
    }

    filterChange() {
        this.filterChanging = true;
    }

    searchTypeChange() {
        this.filterChanging = true;
        this.searchText = '';
        this.searchDate = '';
    }

    getFilterValue() {
        const t = this.selectedSearch;
        if ( t.type === 'search' && this.searchText ) {
            return this.searchText;
        } else if ( t.type === 'date' && this.searchDate ) {
            const formattedSearchDate = this.formatDateForFilter(
                this.searchDate
            );
            return formattedSearchDate;
        }
        return '';
    }
}
export interface CopyRequest {
    templateId: string;
    account: string;
    templateName?: string;
}
