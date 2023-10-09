import { isLoggedIn, CurrentUser } from '../model/get-current-user-response';
import { AccountSummary } from '../model/account';
import { SessionState } from './SessionState';
import {
    UserPermissions,
    defaultComputedPermissions,
    defaultOriginalPermissions,
    AllPermissions,
} from './UserPermissions';
import { AccountView } from './user.service';
export class SessionInfo {
    constructor(
        public readonly session: SessionState,
        public userPermissions?: UserPermissions,
        public isAdminOrMaster = false,
        public accountList: AccountView[] = []
    ) {}
    setPermissions(permissions: UserPermissions) {
        this.userPermissions = permissions;
        return this;
    }
    setIsAdminOrMaster(isAdminOrMaster: boolean) {
        this.isAdminOrMaster = isAdminOrMaster;
        return this;
    }
    setAccountList(accounts: AccountView[]) {
        this.accountList = accounts;
        return this;
    }
    get permissions(): AllPermissions {
        const p = this.userPermissions;
        const computedPermissions =
            (p && p.computed) || defaultComputedPermissions;
        const originalPermissions =
            (p && p.original) || defaultOriginalPermissions;
        return { ...computedPermissions, original: originalPermissions };
    }

    get tag() {
        return this.session.tag;
    }

    get loggedOut() {
        return this.session.loggedOut;
    }
    public get sessionInfo(): CurrentUser | null {
        if (this.session.tag === 'loggedIn' && this.session.user) {
            return this.session.user;
        }
        return null;
    }
    public get lastSelectedAccount(): AccountSummary | null {
        if (this.session.tag !== 'loggedIn') {
            return null;
        }
        return this.session.user?.lastSelectedAccount || null;
    }
    public get accountId(): number | null {
        const lastSelectedAccount = this.lastSelectedAccount;
        if (!lastSelectedAccount || !lastSelectedAccount.accountLegacyId) {
            return null;
        }
        const accountId = parseInt(lastSelectedAccount.accountLegacyId, 10);
        return accountId;
    }
    public get accountIdInString(): string | null {
        const lastSelectedAccount = this.lastSelectedAccount;
        if (!lastSelectedAccount || !lastSelectedAccount.accountLegacyId) {
            return null;
        }
        const accountId = lastSelectedAccount.accountLegacyId;
        return accountId;
    }
    public get isLoggedIn(): boolean {
        if (this.session.tag !== 'loggedIn') {
            return false;
        }
        if (!this.session.user?.profileId) {
            return false;
        }
        return isLoggedIn(this.session.user);
    }
    public get profileId() {
        const user = this.sessionInfo;
        if (!user) {
            return null;
        }
        return user.profileId || null;
    }
    public get isLastSelectedAccountClosed(): boolean {
        const lastSelectedAccount = this.lastSelectedAccount;
        if (!lastSelectedAccount) {
            return false;
        }
        return lastSelectedAccount.isAccountClosed;
    }

    public get hasEVAccount(): boolean {
        const user = this.sessionInfo;
        if (!user) {
            return false;
        }
        return user.hasPrivateEVAccount || false;
    }

    public get firstName(): string {
        const user = this.sessionInfo;
        if (!user) {
            return '';
        }
        return user.firstName || '';
    }
}
