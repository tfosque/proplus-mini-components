export interface PermissionTemplateResponse {
    result: PermissionTemplate;
    message?: Messages[];
    success: boolean;
}
interface PermissionTemplate {
    pagination: Pagination;
    permssionTemplate: PermssionTemplate[];
}
interface Messages {
    code?: number;
    type: string;
    value: string;
}
export interface PermssionTemplate {
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

interface Pagination {
    next: Next;
    previous: Next;
    pageSize: number;
    currentPage: number;
    totalCount: number;
    results: Result[];
}

interface Result {
    enable: boolean;
    page: number;
    currentPage: boolean;
    type: string;
}

interface Next {
    available: boolean;
    label: string;
    page: number;
}
