export interface PermissionTemplateDetailResponse {
    result: PermissionTemplateDetail;
    message?: Messages[];
    success: boolean;
}

interface Messages {
    code?: number;
    type: string;
    value: string;
}

interface PermissionTemplateDetail {
    name: string;
    templateId: string;
    permissions: Permissions[];
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
    email: string;
}

interface Permissions {
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
