import { Message } from './shopping-cart-response';

export interface HoverJobDetailResponse {
    result: HoverJobDetail;
    success: boolean;
    messages?: Message;
}

export interface HoverJobDetail {
    approved?: boolean;
    id: string;
    state?: string;
    orderMaterials?: string;
    images?: JobImage[];
    location_region?: string;
    customer_phone?: string;
    name?: string;
    threeDimensions?: string;
    created_at?: string;
    location_city?: string;
    creator?: string;
    location_line_1?: string;
    location_line_2?: string;
    pdf?: string;
}

export interface JobImage {
    id: string;
}
