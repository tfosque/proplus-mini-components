export interface CreateEVOrderRequest {
    reportId: string;
}

interface Message {
    type: string;
    value: string;
    code: string | null;
    key?: any | null;
}

export interface CreateEVOrderResponse {
    success: boolean;
    messages?: Message[] | null;
    result: {
        evOrderId: string
    } | null;
}

export interface EditEVOrderRequest {
    evOrderId: string;
    templateId: string | null;
    baseWasteFactor: number;
    selectedJobNumber?: string
}

export interface EditEVOrderResponse {
    success: boolean;
    messages?: Message[] | null;
    result: any | null;
}

export interface DeleteEVOrderRequest {
    evOrderId: string;
}

export interface GetEVOrderResponse {
    result: EVOrderResult;
    success: boolean;
    messages: Message[] | null;
}

export interface EVOrderResult {
    evOrderId: string;
    userId: string;
    template: EVTemplateDetail;
    report: EVReport;
    baseWasteFactor: string;
    selectedJobNumber: string;
    summary: EVOrderSummary;
    evItems: EVItem[] | null;
}

export interface EVTemplateDetail {
    templateId: string;
    templateName: string;
}

interface EVReport {
    reportId: string;
    location: ReportLocation;
    rootArea: string;
    lengthEave: string;
    lengthRake: string;
    lengthRidge: string;
    lengthHip: string;
    reportDownloadLink: string;
}

interface ReportLocation {
    address: string;
    city: string;
    postcode: string;
    state: string;
}

export interface EVItem {
    id: string;
    itemNumber: string;
    productId: string;
    itemName: string;
    itemImage: string;
    category: ItemCategory;
    wasteFactor: string | null;
    manualQuantity: boolean | null;
    quantity: number | null;
    uom: string;
    price: number;
    variationOptions: VariationOption[] | null;
    support3DMeasurement: boolean;
    mainCategory: string;
}

export interface ItemCategory {
    categoryName: string;
    categoryId: string;
}

interface EVOrderSummary {
    subTotal: string;
    total: string;
}

export interface VariationOption {
    type: string;
    value: string;
}

export interface AddEVOrderItemRequest {
    evOrderId: string;
    itemNumber: string;
}

export interface AddEVOrderItemResponse {
    result: EVItem;
    success: boolean;
    messages: Message[] | null;
}

export interface DeleteEVOrderItemRequest {
    evOrderId: string;
    itemId: string;
}

export interface DeleteEVOrderItemResponse {
    result: any | null;
    success: boolean;
    messages: Message[] | null;
}

export interface EditEVOrderItemRequest {
    evOrderId: string;
    id: string;
    itemNumber: string;
    wasteFactor: number | null;
    quantity: number | null,
    manualQuantity: boolean | null
}

export interface EditEVOrderItemResponse {
    result: EVItem;
    success: boolean;
    messages: Message[] | null;
}

export interface GetEVOrderCategoriesResponse {
    result: ProductCategory[];
    success: boolean;
    messages: Message[] | null;
}

export interface ProductCategory {
    category: string;
    subCategories: SubCategory[];
}

export interface SubCategory {
    categoryId: string;
}

export interface ConvertEVOrderResponse {
    result: {
        atgOrderId: string;
    };
    success: boolean;
    messages: Message[] | null;
}

export interface SaveAllToEVOrderRequest {
    evOrderId: string,
    baseWasteFactor: number | null;
    selectedJobNumber?: string | null,
    items: SaveAllRequestEVItem[];
}

export interface SaveAllRequestEVItem{
    productId: string;
    itemNumber: string;
    wasteFactor: number | null;
    quantity: number | null;
}

export interface EVOrderListResponse {
    result: EVOrderListResult;
    success: boolean;
    messages: Message[] | null;
}

interface EVOrderListResult {
    pagination: Pagination;
    evOrders: EVOrder[] | [];
}

interface Pagination {
    next: PreviousOrNextPage;
    previous: PreviousOrNextPage;
    pageSize: number;
    currentPage: number;
    totalCount: number;
    results: PaginationResult[] | [];
}

interface PreviousOrNextPage {
    available: boolean;
    label: string;
    page: number;
}

interface PaginationResult {
    enable: boolean;
    page: number;
    currentPage: boolean,
    type: string;
}

export interface EVOrder {
    evOrderId: string;
    userId: string;
    template: EVTemplateDetail | null;
    report: EVReport;
    baseWasteFactor: string;
    selectedJobNumber: string | null;
    summary: EVOrderSummary | null;
    evItems: EVItem[] | null;
    completed: boolean;
}