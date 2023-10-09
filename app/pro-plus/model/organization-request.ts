export interface OrganizationRequest {
    orgId?: string;
    query: Query;
}

interface Query {
    sortBy?: string;
    sortType?: string;
    pageIndex?: number;
    pageSize?: number;
}
