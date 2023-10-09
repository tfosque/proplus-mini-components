export interface EagleViewAccountReportRequest {
    productsToFiterBy: number[];
    statusesToFilterBy: string[];
    subStatusToFilterBy: string;
    fieldsToFilterBy: string[];
    textToFilterBy: string;
    sortBy: string;
    sortAscending: boolean;
}

export interface EagleViewAccountReportResponse {
    result: EagleViewAccountReportResult;
    success: boolean;
    messages?: Message[];
    code?: number;
}

export interface EagleViewAccountReportResult {
    ReportList: EagleViewAccountReport[];
    TotalOfReports: number;
}

export interface EagleViewAccountReport {
    Id: number;
    Street1: string;
    Street2?: string | null,
    City: string;
    State: string;
    Zip: string;
    Country?: string;
    Latitude: number;
    Longitude: number;
    ClaimNumber?: string | null;
    ClaimInfo?: string | null;
    BatchId?: string | null;
    CatId?: string | null;
    DatePlaced: string;
    DateCompleted: string;
    ReportProducts: ReportProduct;
    ReportStatus: ReportStatus;
    ReportDownloadLink: string;
    EligibleForUpgrade: boolean;
    numberOfImages: number;
    addOns: AddOn[];
    AllowsUserSubmittedPhotos: boolean;
    CanCancelReport: boolean;
    DateOfLoss: string;
    DeliveryFilesAvailable: DeliveryFile[];
    TopDownIsAvailable: boolean;
    BuildingId?: string | null;
    PrimaryProductDisplayName: string;
    AddOnProducts: AddOnProduct[];
    TypeOfStructure: number;
    JobName?: string | null;
}

interface ReportProduct {
    ProductPrimaryId: number;
    ProductPrimary: string;
    ProductDeliveryId: number;
    ProductDelivery: string;
}

interface ReportStatus {
    StatusId: number;
    Status: string;
    SubStatusId: number;
    SubStatus: string;
    DisplayStatus: string;
}

interface Message {
    type: string;
    value: string;
    code: string;
}

interface AddOn {
    ProductID: number;
    Name: string;
    Description: string;
}

interface DeliveryFile {
    DeliveryFileTypeId: number;
    EffectiveDate: string;
}

interface AddOnProduct {
    ProductId: number;
    DisplayName: string;
}

