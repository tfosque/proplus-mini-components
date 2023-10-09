import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
    CurrentUser,
    GetCurrentUserInfoResponse,
} from '../model/get-current-user-response';
import { LoginResponse } from '../model/login-response';
import { LoginRequest } from '../model/login-request';
import { AccountsResponse } from '../model/accounts-response';
import { ProPlusApiBase, ApiResponse } from './pro-plus-api-base.service';
import { GetCurrentUserInfoResponseV2 } from '../model/get-current-user-response-v2';
import { LoggerService } from '../../common-components/services/logger.service';
import { LoginError } from './login-error';
import { isPlatformBrowser } from '@angular/common';
import { UserInfoRequest } from '../model/user-info-request';
import {
    AddressBookResponse,
    AddressBook,
} from '../model/address-book-response';
import { JobResponse } from '../model/job-response';
import { DeliveryStatusResponse } from '../model/delivery-tracking-status-response';
import {
    AddressBookInfo,
    AddressBookRequest,
} from '../model/address-book-request';
import { AccountSummary } from '../model/account';
import { AccountDetails } from '../model/account-with-branch';
import { Observable, BehaviorSubject } from 'rxjs';
import { SessionInfo } from './SessionInfo';
import { RoleResult } from '../pages/user-admin-detail/user-admin-detail.component';
import { AppError } from '../../../app/common-components/classes/app-error';
import {
    UserPermissions,
    AllPermissions,
    ComputedPermissions,
} from './UserPermissions';
import { Branch } from '../model/branch';
import moment from 'moment';
import { map } from 'rxjs/operators';

let userServiceCount = 0;

@Injectable({
    providedIn: 'root',
})
export class UserService {
    public isBrowser: boolean;
    public Id = 0;
    public sessionBehavior: Observable<SessionInfo>;
    private permissionsObs = new BehaviorSubject<ComputedPermissions>(
        this.defaultComputedPermissions()
    );
    public permissionsObs$ = this.permissionsObs.asObservable();
    public addressBooks$ = new BehaviorSubject<AddressBook[]>([]);
    public $loginWithProduct: string | null = null;
    /*   private firstLoggedInLess48Hours = new BehaviorSubject<boolean>(false);
      public firstLoggedInLess48Hours$ = this.firstLoggedInLess48Hours.asObservable(); */
    public firstLoggedInLess48Hours$: Observable<boolean>;
    public lastActivityIsMoreThan30Days$ = new BehaviorSubject<boolean>(false);

    static test(): Promise<void> {
        return new Promise<void>((res) => res());
    }

    public get session() {
        return this.api.userSession.value;
    }

    public get permissions() {
        return this.api.permissions;
    }

    defaultComputedPermissions(): ComputedPermissions {
        return {
            order: {
                submit: false,
                approve: false,
                submitForApproval: false,
                checkoutShippingAddress: false,
                checkoutOrderReview: false,
                checkoutOrderConfirmation: false,
            },
            orderhistory: {
                queryList: false,
                queryDetail: false,
                withPrice: false,
                withoutPrice: false,
            },
            price: false,
            quote: {
                edit: false,
                upload: false,
                submit: false,
                update: false,
                submitForm: false,
                queryList: false,
                queryListOpen: false,
                queryListInProgress: false,
                queryListProcessed: false,
                queryDetailOpen: false,
                queryDetailInProgress: false,
                queryDetailProcessed: false,
            },
            rebate: {
                submit: false,
                landing: false,
                form: false,
                thankyou: false,
                denied: false,
                redeemedSummary: false,
                redeemedDetail: false,
            },
        };
    }

    private setSession(newSession: SessionInfo) {
        // Early return if new session is the same as current session
        if (
            JSON.stringify(this.api.userSession.value) ===
            JSON.stringify(newSession)
        )
            return;

        this.api.userSession.next(newSession);
        //  If the session is being set to a new logged-in state
        if (newSession.isLoggedIn) {
            //  Try to update the session's permissions
            // tslint:disable-next-line: no-floating-promises
            this.setSessionPermissions(newSession);
            /* PEMISSIONS set observable */
            const usrPermisions: any = newSession.permissions;
            this.permissionsObs.next(usrPermisions);
            // console.log({ usrPermisions });
            // console.log('this.permissionsObs:', this.permissionsObs.value);
        }
    }

    constructor(
        private readonly api: ProPlusApiBase,
        private readonly log: LoggerService,
        @Inject(PLATFORM_ID) platformId: string
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.Id = userServiceCount++;
        // this.sessionBehavior = api.userSession.asObservable();
        this.sessionBehavior = api.userSession
            .asObservable()
            .pipe
            /* tap(res => console.log('session', { res })) */
            ();
        this.firstLoggedInLess48Hours$ = this.sessionBehavior.pipe(
            map((session) => this.getFirstLoggedIn(session))
        );
    }
    public getFirstLoggedIn(session: SessionInfo | null): boolean {
        // TODO Tim
        if (!session || !session.isLoggedIn) {
            return false;
        }
        try {
            const usr = session && session.sessionInfo;
            const firstLoggedIn = usr && usr.firstLoggedInDate;
            // console.log({ firstLoggedIn }, firstLoggedIn && moment(firstLoggedIn));

            this.calculateMoreThan30Days(usr && usr.lastActivity);
            const end = firstLoggedIn; // firstLoggedIn date
            if (!end) {
                return false;
            }

            const moreThan36Hours = moreThanTimePeriodFromToday(
                end,
                36,
                'hour'
            );
            if (moreThan36Hours) {
                return false;
            }

            // console.log({ now }, { end }, { duration }, 'firstLoggedIn:', this.firstLoggedInLess48Hours.value);
            return true;
        } catch (err) {
            console.error('getFirst', err);
            return false;
        }
    }

    private calculateMoreThan30Days(
        lastActivityDate: string | null | undefined
    ) {
        try {
            if (lastActivityDate) {
                const moreThan30Days = moreThanTimePeriodFromToday(
                    lastActivityDate,
                    30,
                    'day'
                );
                if (moreThan30Days) {
                    this.lastActivityIsMoreThan30Days$.next(true);
                } else {
                    this.lastActivityIsMoreThan30Days$.next(false);
                }
            }
        } catch (err) {
            console.error('calculate More Than 30 Days error', err);
        }
    }

    public get sessionInfo() {
        return this.session.sessionInfo;
    }

    public get lastSelectedAccount(): AccountSummary | null {
        if (!this.isBrowser) {
            return null;
        }
        return this.session.lastSelectedAccount;
    }

    public get accountId(): number | null {
        return this.session.accountId;
    }

    public get accountIdInString(): string | null {
        return this.session.accountIdInString;
    }

    public get isLastSelectedAccountClosed(): boolean {
        return this.session.isLastSelectedAccountClosed;
    }

    public get hasEVAccount(): boolean {
        return this.session.hasEVAccount;
    }

    public get firstName(): string {
        return this.session.firstName;
    }

    public async getSessionInfo() {
        if (!this.isBrowser) {
            return Promise.resolve(null);
        }

        // if (this.session.tag === 'notLoggedIn') { return null; }
        if (this.session.tag === 'loggedIn') {
            return Promise.resolve(this.session.sessionInfo);
        }

        const user = await this.getUserInfo();

        if (!user) {
            this.setSession(new SessionInfo({ tag: 'notLoggedIn' }));
            return null;
        }

        // this.setSession(new SessionInfo({ tag: 'loggedIn', user: user }));
        return this.session.sessionInfo;
    }

    public async ensureSessionInfo() {
        const info = await this.getSessionInfo();
        if (!info) {
            throw new Error('Failed to get session info');
        }
        return info;
    }

    /// Used for testing to set the active session
    // public setSessionInfo(newInfo: GetCurrentUserInfoResponse) {
    //   this.session = new SessionInfo({ tag: 'loggedIn', user: newInfo });
    // }

    public get isLoggedIn(): boolean {
        if (!this.isBrowser) {
            return false;
        }
        return this.session.isLoggedIn;
    }

    public async doLogin(
        username: string,
        password: string,
        persistentLoginType?: string
    ): Promise<
        LoginResponse.MessageInfo | GetCurrentUserInfoResponse | string | null
    > {
        if (!this.isBrowser) {
            return null;
        }
        const userInfo = this.session;
        if (userInfo.isLoggedIn) {
            return userInfo.sessionInfo;
        }

        const siteId = 'homeSite';
        const userAgent = 'desktop';
        const loginForm: LoginRequest = {
            username,
            password,
            siteId,
            persistentLoginType,
            userAgent,
        };
        const response = await this.api.postV1<LoginResponse | string>(
            'login',
            loginForm
        );
        const { ok, body } = response;

        if (!ok) {
            throw new LoginError('There was a problem with your login attempt');
        }
        if (typeof body === 'string') {
            throw new LoginError(body);
        }
        if (!body || !body.messageInfo) {
            return null;
        }
        return body.messageInfo;
    }

    public async getAccounts(): Promise<AccountsResponse | null> {
        if (!this.isBrowser) {
            return null;
        }
        return await this.ensureGetAccounts();
    }

    public async ensureGetAccounts(): Promise<AccountsResponse> {
        const profileId = this.session.profileId;
        if (this.session.tag !== 'loggedIn') {
            throw new Error('You must be logged in to fetch accounts');
        }
        if (!profileId) {
            throw new Error('Cannot fetch accounts');
        }
        const { ok, body } = await this.api.getV1<AccountsResponse>(
            'accounts',
            {
                profileId: profileId,
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to get accounts');
        }
        body.accounts.sort((a, b) => {
            const aName = (a.accountName || '').replace(/^\d+\s+/, '');
            const bName = (b.accountName || '').replace(/^\d+\s+/, '');
            if (aName === bName) {
                return 0;
            } else if (aName > bName) {
                return 1;
            } else {
                return -1;
            }
        });
        return body;
    }

    public async getAddressBooks(): Promise<AddressBookResponse | null> {
        try {
            const { body } = await this.api.getV2WithTimeout<AddressBookResponse>(
                'getAddressBook',
                {}
            );
            if (body && body.success && body.addressBooks) {
                const accountId = this.accountId;
                this.addressBooks$.next(
                    body.addressBooks.filter(
                        (a) => a.accountLegacyId === (accountId || 0).toString()
                    )
                );
            }
            return body;
        } catch (error) {
            if (
                error instanceof AppError &&
                error.message === 'There is no address in your account.'
            ) {
                this.addressBooks$.next([]);
                return {
                    messages: [],
                    messageCode: 200,
                    success: true,
                    addressBooks: [],
                };
            }
            throw error;
        }
    }
    loginWithProduct(url: string) {
        this.$loginWithProduct = url;
    }
    public async logout() {
        if (!this.isBrowser) {
            return null;
        }
        const { ok, body } = await this.api.postV1('logout', {});
        if (!ok || !body) {
            throw new Error('Failed to logout');
        }
        this.setSession(
            new SessionInfo({ tag: 'notLoggedIn', loggedOut: true })
        );
        // handle pending orders TODO can implement from here creates a curcular reference
        // this.pendingOrdersService.hidebar();
        return body;
    }

    private async getUserInfo(): Promise<CurrentUser | null> {
        if (!this.isBrowser) {
            return null;
        }

        try {
            const { ok, status, body } = await this.api.getV1<CurrentUser>(
                'getCurrentUserInfo',
                {}
            );

            if (!ok || !body) {
                return null;
            }

            if (status === 200) {
                this.setSession(
                    new SessionInfo({ tag: 'loggedIn', user: body })
                );
                return body;
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    public async getUserDetail(
        id: string
    ): Promise<ApiResponse<UserDetailInfo> | null> {
        try {
            const { ok, body } = await this.api.getV2<
                ApiResponse<UserDetailInfo>
            >('getUserDetail', { id });
            if (!ok || !body) {
                return null;
            }
            return body;
        } catch (error) {
            return null;
        }
    }
    public async getRoleList(): Promise<RoleResult | null> {
        try {
            const { ok, body } = await this.api.getV2<RoleResult>('role', {});
            if (!ok || !body) {
                return null;
            }
            return body;
        } catch (error) {
            return null;
        }
    }
    public async ensureUserInfo(): Promise<GetCurrentUserInfoResponseV2 | null> {
        try {
            const userInfo = await this.getCurrentUserInfo();
            if (!userInfo) {
                return null;
            }
            return userInfo;
        } catch (error) {
            return null;
        }
    }

    public async getCurrentUserInfo(): Promise<GetCurrentUserInfoResponseV2 | null> {
        if (!this.isBrowser) {
            return null;
        }

        if (this.session.tag === 'notLoggedIn') {
            return null;
        }

        try {
            const { ok, status, body } =
                await this.api.getV2<GetCurrentUserInfoResponseV2>(
                    'getCurrentUserInfo',
                    {}
                );

            if (!ok || !body) {
                return null;
            }

            if (status === 200) {
                this.setSession(
                    new SessionInfo({ tag: 'loggedIn', user: body })
                );
                this.log.log('getUserInfo', 'Already logged in');
                return body;
            } else {
                this.setSession(new SessionInfo({ tag: 'notLoggedIn' }));
            }
        } catch (error) {
            this.setSession(new SessionInfo({ tag: 'notLoggedIn' }));
            return null;
        }

        return null;
    }

    public async ensureCurrentUserInfo(): Promise<GetCurrentUserInfoResponseV2> {
        const userInfo = await this.getCurrentUserInfo();

        if (!userInfo) {
            throw new Error('Failed to fetch user info');
        }

        return userInfo;
    }

    public async getCurrentUserPermission(): Promise<
        AllPermissions | undefined
    > {
        const session = this.api.userSession.value;
        return await this.setSessionPermissions(session);
    }

    private async getAdminOrMaster() {
        let isAdminOrMaster = false;
        const se = await this.getSessionInfo();
        if (se && se.roleType) {
            if (se.roleType === 'Admin' || se.roleType === 'Master Admin') {
                isAdminOrMaster = true;
            } else if (se.roleType === 'Site User') {
                isAdminOrMaster = false;
            }
        }
        return isAdminOrMaster;
    }

    private async setSessionPermissions(
        session: SessionInfo
    ): Promise<AllPermissions | undefined> {
        if (!session.isLoggedIn) {
            return undefined;
        }

        //  If we have the permissions in our session, no need to fetch them again
        if (session.userPermissions) {
            return session.permissions;
        }

        const { ok, body } = await this.api.getV2<ApiResponse<UserPermissions>>(
            'getCurrentUserPermission',
            {}
        );

        if (!ok || !body) {
            throw new Error('Failed to get user permissions');
        }

        session.setPermissions(body.result);
        this.api.userSession.next(session);

        this.getAdminOrMaster().then((adminOrMaster) => {
            session.setIsAdminOrMaster(adminOrMaster);
            this.api.userSession.next(session);
        });

        this.getAccountList().then((accounts) => {
            session.setAccountList(accounts);
            this.api.userSession.next(session);
        });

        return session.permissions;
    }

    private async getAccountList(): Promise<AccountView[]> {
        const accountResponse = await this.getAccounts();
        const accountList = (
            accountResponse ? accountResponse.accounts : []
        ).map((a) => {
            const newName = a.accountName
                ? a.accountName.replace(/\d+\s+\((.+)\)/, '$1')
                : '';
            const temp: AccountView = { ...a, accountName: newName };
            return temp;
        });
        return accountList;
    }

    public async changePassword(
        request: ChangePasswordRequest
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2WithError<BasicResponse>(
            'changePassword',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to change password');
        }
        return body;
    }

    public async resetPasswordService(
        request: ResetPasswordRequest
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2WithError<BasicResponse>(
            'resetPassword',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to change password');
        }
        return body;
    }
    public async forgotPassword(
        request: ForgotPasswordRequest
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2WithError<BasicResponse>(
            'forgotPassword',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to request password reset email');
        }
        return body;
    }

    public async updateUserInfo(
        request: UserInfoRequest
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'saveCurrentUserInfo',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to update user info');
        }
        return body;
    }

    public async updateUserAdmin(request: unknown): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'updateUser',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to update user info');
        }
        return body;
    }

    public async createUser(request: unknown): Promise<BasicResponse | null | any > {
        try {
            const { body } = await this.api.postV2<BasicResponse>(
                'createUser',
                request
            );
            if (body) {
                //throw new Error('Failed to update user info');
                return body;
            }
        } catch(error){
            throw error;
        }
    }

    public async deleteAddressBook(
        addressBookId: string
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'deleteAddressBook',
            { addressBookId }
        );
        if (!ok || !body) {
            throw new Error('Failed to delete address Book');
        }
        return body;
    }

    public async saveOrder(savedOrderName: string): Promise<SaveOrderResponse> {
        const { ok, body } = await this.api.postV2<SaveOrderResponse>(
            'saveOrder',
            {
                savedOrderName,
            }
        );
        if (!ok || !body) {
            throw new Error('Failed to save order');
        }
        return body;
    }

    public async updateAddressBook(
        addressBook: AddressBookRequest
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'updateAddressBook',
            addressBook
        );
        if (!ok || !body) {
            throw new Error(
                `Failed to update address book entry: ${addressBook.addressBookId}`
            );
        }
        return body;
    }

    public async createAddressBook(
        addressBook: AddressBookInfo
    ): Promise<BasicResponse> {
        const { ok, body } = await this.api.postV2<BasicResponse>(
            'createAddressBook',
            addressBook
        );
        if (!ok || !body) {
            throw new Error('Failed to create address book entry');
        }
        return body;
    }

    public async switchAccount(
        accountId: string
    ): Promise<GetCurrentUserInfoResponse | null> {
        const { ok, body } = await this.api.postV1<BasicResponse>(
            'switchAccount',
            {
                accountId,
            }
        );

        if (!ok || !body) {
            throw new Error('Failed to switch accounts');
        }

        return await this.getUserInfo();
    }

    public async getStatusChange(
        orderNumber?: string
    ): Promise<DeliveryStatusResponse> {
        const { ok, body } = await this.api.getV2<DeliveryStatusResponse>(
            'getStatusChange',
            orderNumber ? { orderNumber: orderNumber } : {}
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch');
        }
        return body;
    }

    public async getUserJobs(
        alertUser: boolean,
        accountId?: string,
        throwError = true
    ): Promise<JobResponse> {
        const currentId = this.api.userSession.value.accountId;
        accountId = accountId || (currentId ? currentId.toString() : undefined);
        if (!accountId) {
            throw new Error('Failed to fetch user jobs');
        }
        const { ok, body } = await this.api.getV1<JobResponse>('jobs', {
            accountId,
        });
        if (!ok || !body) {
            throw new Error('Failed to fetch user jobs');
        }
        //TODO: find a better solution, hemas input needed, temp solution.
        if (body.isJobAccountRequired && (!body.jobs || !body.jobs.length)) {
            // if (alertUser && throwError) {
            //     throw new SevereError('job-missing');
            // }
            const res: JobResponse = {
                hasJobAccount: false,
                hasJobNumber: false,
                isJobAccountRequired: true,
                jobs: [],
                message: '',
            };
            return res;
        }
        return body;
    }
    public async getAddressBook(isFilteredByAccount = false): Promise<AddressBookResponse> {
        try {
            const { ok, body } = await this.api.getV2<AddressBookResponse>(
                'getAddressBook',
                isFilteredByAccount && this.accountIdInString ? {
                    addressBookIds: '',
                    pageSize: 5000,
                    pageNo: 1,
                    searchBy: 'accountNumber',
                    searchTerm: this.accountIdInString
                } : {}
            );
            if (!ok || !body) {
                throw new Error('Failed to fetch user address book');
            }
            return body;
        } catch (error) {
            if (
                error instanceof AppError &&
                error.message === 'There is no address in your account.'
            ) {
                return {
                    messages: [],
                    messageCode: 200,
                    success: true,
                    addressBooks: [],
                };
            }
            throw error;
        }
    }

    public async ensureAllUserInfo(): Promise<AllUserInfo> {
        const currentUser = await this.getCurrentUserInfo();
        if (!currentUser) {
            throw new Error('Failed to get user info');
        }
        const accounts = await this.getAccounts();
        if (!accounts) {
            throw new Error('Failed to get user accounts');
        }
        const activeAccount = this.getCurrentAccount(currentUser, accounts);
        if (!activeAccount) {
            throw new Error('Failed to get current account');
        }
        const addressBooks = await this.getAddressBooks();
        if (!addressBooks) {
            throw new Error('Failed to get address book');
        }
        return { currentUser, accounts, activeAccount, addressBooks };
    }

    getCurrentAccount(currentUser: CurrentUser, accounts: AccountsResponse) {
        // let activeAccount: AccountDetails;

        for (const account of accounts.accounts) {
            if (
                account.accountLegacyId ===
                currentUser.lastSelectedAccount.accountLegacyId
            ) {
                // return this.formatInfo(account);
                return account;
            }
        }
        // activeAccount = this.formatInfo(activeAccount);
        return null;
    }

    public async getLoginDeclaration() {
        try {
            const siteId = 'homeSite';
            const persistentLoginType = 'RememberPassword';
            const userAgent = 'desktop';
            const queryParameters = { siteId, persistentLoginType, userAgent };
            const { ok, body } = await this.api.getV1<LoginDeclaration>(
                'getLoginDeclaration',
                queryParameters
            );
            if (!ok) {
                return null;
            }
            return body;
        } catch (err) {
            console.error('getLoginDeclaration', err);
            return null;
        }
    }

    public async isExternalUser() {
        const currentUser = await this.getCurrentUserInfo();
        if (
            currentUser &&
            currentUser.userType &&
            currentUser.userType.toLowerCase() === 'customer'
        ) {
            return true;
        } else {
            return false;
        }
    }
}

export interface LoginDeclaration {
    CTA: string[];
    declarationContent: string;
    titles: string[];
    message: string | null;
    result: unknown;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    password: string;
    confirmpassword: string;
}

export interface ResetPasswordRequest {
    passwordtoken: string;
    password: string;
    confirmpassword: string;
}

export interface ForgotPasswordRequest {
    login: string;
}
export interface DeleteItemCartRequest {
    commerceItemId: string;
}
export interface UpdateCartRequest {
    commerceItemId: string;
    quantity: number;
}
// export interface Item {

// }
export interface BasicResponse {
    messages: Message[];
    messageCode?: number;
    result?: any;
    success: boolean;
}
export interface Message {
    type: string;
    value: string;
    code: string;
}

export interface AllUserInfo {
    currentUser: GetCurrentUserInfoResponseV2;
    accounts: AccountsResponse;
    activeAccount: AccountDetails;
    addressBooks: AddressBookResponse;
}

export interface UserDetailInfo {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    phone: string;
    email: string;
    role: Role;
    accounts: Account[];
    assignedAccounts: Account[];
    lastActivity: string;
    lastModifiedDate: string;
    status: string;
    permissionTemplate: PermissionTemplate;
    active: boolean;
    currentTemplate: string;
    org: Org;
    lastModifiedUserId: string;
    userIsSelf: boolean;
    internalUser: string;
    userType: string;
}

export interface SaveOrderResponse {
    messages: Message[];
    messageCode?: number;
    result?: SaveOrderResult;
    success: boolean;
}

interface SaveOrderResult {
    savedOrderId: string;
    successUrl: string;
}

interface PermissionTemplate {
    name: string;
    templateId: string;
    permissions: Permission2[];
    lastModifyDate: string;
    userEmail: string;
    org: Org;
}

interface Org {
    id: string;
    name: string;
    masterAdmin: MasterAdmin;
}

interface MasterAdmin {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    phone: string;
    email: string;
    role: Role;
    accounts: Account[];
    assignedAccounts: Account[];
    lastActivity: string;
    lastModifiedDate: string;
    status: string;
    permissionValues: PermissionValues;
    active: boolean;
    currentTemplate: string;
    lastModifiedUserId: string;
    userIsSelf: boolean;
    internalUser: string;
    userType: string;
}

interface PermissionValues {
    aa: boolean;
    bb: boolean;
    cc: boolean;
}

interface Account {
    id: string;
    displayName: string;
    checked: boolean;
    isAccountClosed: boolean;
}

interface Role {
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

export interface AccountView {
    accountName: string;
    accountEnabled?: boolean | undefined;
    accountLegacyId: string;
    accountViewPrices?: boolean | undefined;
    branch?: Branch | undefined;
    isAccountClosed?: boolean;
}

export function moreThanTimePeriodFromToday(
    startDate: string,
    numDiff: number,
    unit: 'hour' | 'day' | 'month'
) {
    const now = moment(new Date());
    const duration = moment.duration(now.diff(startDate));
    let diff;
    if (unit === 'hour') {
        diff = Math.round(duration.asHours());
    } else if (unit === 'day') {
        diff = Math.round(duration.asDays());
    } else {
        diff = Math.round(duration.asMonths());
    }
    return diff >= numDiff;
}
