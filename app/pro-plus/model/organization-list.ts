import { Message } from '../services/order-history.service';

export interface OrganizationListResponse {
    callBackParam: string;
    code: number;
    messageCode: number;
    messages: Message[];
    result: OrganizationList;
    success: boolean;
}

interface OrganizationList {
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
    permissionTemplate: PermissionTemplate;
    active: boolean;
    currentTemplate: string;
    lastModifiedUserId: string;
    userIsSelf: boolean;
    internalUser: string;
    userType: string;
}

interface PermissionTemplate {
    name: string;
    templateId: string;
    permissions: Permission2[];
    lastModifyDate: string;
    userEmail: string;
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
