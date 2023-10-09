import { Message } from './shopping-cart-response';

export interface OrganizationResponse {
    messages: Message;
    result: Organization;
    success: Boolean;
}

interface Organization {
    pagination: Pagination;
    users: UserListOrg[];
}

export interface UserListOrg {
    id: string;
    email: string;
    lastActivity: string;
    lastModifiedDate: string;
    status: string;
}

export interface Pagination {
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
