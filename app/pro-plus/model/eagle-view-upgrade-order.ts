export interface EagleViewUpgradeOrderRequest {
    ReportId: number;
    MeasurementRequestTypeId: number;
    ProductId: number;
    ProductDeliveryId: number;
    AddOnProductIds?: number[];
    AdditionalEmails?: string;
    ClaimNumber?: string;
    ClaimInfo?: string;
    PONumber?: string;
    DateOfLoss?: string;
    CatId?: string;
    UUID: string;
}

export interface EagleViewUpgradeOrderResponse {
    result?: Result;
    success: boolean;
    messages?: Message[];
}

interface Result {
    mincronOrderId?: string;
    reportIds?: number;
    modelState?: ModelState;
}

interface ModelState {
    modelKey: string;
    modelValue: string[];
}

interface Message {
    type: string;
    value: string;
    code: string;
}

export interface EagleViewOrderUpgradeProductsReponse {
    result: EagleViewOrderUpgradeProducts;
    success: boolean;
    messages?: Message[];
    code?: number; 
}

export interface EagleViewOrderUpgradeProducts {
    AvailableProducts: AvailableProduct[];
    CurrentOrder: CurrentOrder;
}

export interface AvailableProduct {
    productID: number;
    name: string;
    description: string;
    productGroup?: string | null;
    isTemporarilyUnavailable: boolean;
    priceMin?: number;
    priceMax?: number;
    deliveryProducts: Product[];
    addOnProducts: Product[];
    measurementInstructionTypes: number[];
    TypeOfStructure: number;
    IsRoofProduct: boolean;
    SortOrder: number;
    AllowsUserSubmittedPhotos: boolean;
    DetailedDescription: string;
}

export interface CurrentOrder {
    ReportId: number;
    MeasurementRequestTypeId: number;
    ProductId: number;
    ProductDeliveryId: number;
    AddOnProductIds?: number[];
    AdditionalEmails?: string;
    ClaimNumber?: string;
    ClaimInfo?: string;
    PONumber?: string;
    DateOfLoss?: string | null;
    CatId?: string;
    JobName?: string | null
}

export interface Product {
    productID: number;
    name: string;
    description: string;
    isTemporarilyUnavailable: boolean;
    priceMin: number;
    priceMax: number;
    deliveryProductIds?: number[] | null;
    DetailedDescription?: string; 
}