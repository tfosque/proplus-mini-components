import { Message } from './shopping-cart-response';
import { Pagination } from './organization-response';

export interface HoverJobListResponse {
    result: HoverJobList;
    success: boolean;
    messages?: Message[];
}

interface HoverJobList {
    pagination: Pagination;
    items?: HoverJobListItem[];
}

export interface HoverJobListItem {
    jobId: string;
    time?: string;
    title?: string;
    location?: string;
    cityAndRegion?: string;
    completedAt?: string;
}
