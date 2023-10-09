export interface UserDetailsRequest {
    id?: string;
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    role: Role;
    accounts: Account[];
    status: string;
    currentTemplate: string;
    permissionTemplate: Permission;
    permissionValues: PermissionValues;
}

interface PermissionValues {
    '700002': boolean;
    p10900002: boolean;
    '100005': boolean;
    '700001': boolean;
    '100003': boolean;
    '100004': boolean;
    '100007': boolean;
    '100006': boolean;
    p11100001: boolean;
    '400001': boolean;
}
interface Permission {
    templateId: string | null;
}

interface Account {
    id: string;
    checked: boolean;
}

interface Role {
    id: string;
}
