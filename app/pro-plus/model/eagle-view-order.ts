export interface EagleViewOrderRequest {
    OrderReports: OrderReport[];
    PromoCode?: string;
    placeOrderUser?: string;
    accountId?: string;
    email?: string;
    projectName?: string;
    beaconPrice?: number;
    UUID: string;
}

interface OrderReport {
    ReportAddresses: ReportAddress[];
    BuildingId?: string;
    PrimaryProductId: number;
    DeliveryProductId: number;
    AddOnProductIds?: number[];
    MeasurementInstructionType: number;
    ReportAttibutes?: ReportAttribute[];
    ClaimNumber?: string;
    ClaimInfo?: string;
    BatchId?: string;
    CatId?: string;
    ChangesInLast4Years: boolean;
    PONumber?: string;
    Comments?: string;
    ReferenceId?: string;
    InsuredName?: string;
    UpgradeFromReportId?: number;
    PolicyNumber?: string;
    DateOfLoss?: string;
    propertyType?: string;
    reportType?: string;
    deliveryType?: string;
    addOns?: string;
    structures?: string;
}

interface ReportAddress {
    Address: string;
    City: string;
    State: string;
    Zip: string;
    AddressType: number;
}

interface ReportAttribute {
    Attribute: number;
    Value?: string;
}

export interface EagleViewOrderResponse {
    result?: Result;
    success: boolean;
    messages?: Message[];
}

interface Result {
    mincronOrderId?: string;
    orderId?: number;
    reportIds?: number[];
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

export interface EagleViewOrderReportReponse {
    result: EagleViewOrderReport;
    success: boolean;
    messages?: Message[];
    code?: number; 
}

export interface EagleViewOrderReport {
    ReportId: number;
    Street: string;
    BuildingId: string;
    City: string;
    State: string;
    Zip: string;
    Latitude: number;
    Longitude: number
    ClaimNumber: string;
    ClaimInfo: string;
    BatchId: string;
    CatId: string;
    DatePlaced: string;
    DateCompleted: string;
    PONumber: string;
    Comments: string;
    ReportImage: EVReportImage[];
    ReferenceId: string;
    InsuredName: string;
    MeasurementRequestTypeId: number;
    ReportDownloadLink: string;
    EligibleForUpgrade: boolean;
    Status: string;
    Area: string;
    Pitch: string;
    LengthRidge: string;
    LengthValley: string;
    LengthEave: string;
    LengthRake: string;
    ProductPrimaryId: number;
    ProductPrimary: string;
    ProductDeliveryId: number;
    ProductDelivery: string;
    AddOnProductIds: string;
    AllowsUserSubmittedPhotos: boolean;
    LengthHip: string;
    SubstituteFromProduct?: number;
    SubstituteToProduct?: string;
    CanCancelReport: string;
}

interface EVReportImage {
    sequenceNumber: number;
    imageId: number;
    ProductId: number;
    ProductDeliveryId: number;
    AddOnProductIds?: number[];
    AdditionalEmails: string;
    ClaimNumber: string;
    ClaimInfo: string;
    PONumber: string;
    DateOfLoss?: string;
    CatId: string;
}

export interface EagleViewOrderReportReponseV3 {
    result: EagleViewOrderReportV3;
    success: boolean;
    messages?: Message[];
    code?: number; 
}

export interface EagleViewOrderReportV3 {
    ReportId: number;
    Street: string;
    BuildingId: string;
    City: string;
    State: string;
    Zip: string;
    Latitude: number;
    Longitude: number
    ClaimNumber: string;
    ClaimInfo: string;
    BatchId: string;
    CatId: string;
    DatePlaced: string;
    DateCompleted: string;
    PONumber: string;
    Comments: string;
    ReportImage: EVReportImage[];
    ReferenceId: string;
    InsuredName: string;
    MeasurementRequestTypeId: number;
    ReportDownloadLink: string;
    EligibleForUpgrade: boolean;
    Status: string;
    Area: string;
    Pitch: string;
    LengthRidge: string;
    LengthValley: string;
    LengthEave: string;
    LengthRake: string;
    ProductPrimaryId: number;
    ProductPrimary: string;
    ProductDeliveryId: number;
    ProductDelivery: string;
    AddOnProductIds: string;
    AllowsUserSubmittedPhotos: boolean;
    LengthHip: string;
    SubstituteFromProduct?: number;
    SubstituteToProduct?: string;
    CanCancelReport: string;
    StatusId: number;
    SubStatusId: number;
    DisplayStatus: string;
    DateOfLoss: string;
    DeliveryFilesAvailable: DeliveryFile[];
    AdditionalRecipients: string;
    TotalCost: number;
    PaymentType: string;
    MeasurementByStructure: EVMeasurementByStructure[];
    PrimaryProductDisplayName: string;
    AddOnProducts: AddOnProduct[];
    TypeOfStructure: number;
    ProductSubstitution: EVProductSubstitution;
    TotalMeasurements: EVTotalMeasurements;
    JobName: string;
    CanEditReportInformation: boolean;
    SuggestedWasteFactorAvailable: boolean;
}

interface DeliveryFile {
    DeliveryFileTypeId: number;
    EffectiveDate: string;
}

interface EVMeasurementByStructure {
    BuildingName: string;
    Area: string;
    PrimaryPitch: string;
    LengthRidge: string;
    LengthValley: string;
    LengthEave: string;
    LengthRake: string;
    LengthHip: string;
}

interface AddOnProduct {
    DisplayName: string;
    ProductId: number;
}

interface EVProductSubstitution {
    From: Substitution;
    To: Substitution;
}

interface Substitution {
    PrimaryProductId: number;
    PrimaryProductDisplayName: string;
    TypeOfStructure: number;
}

interface EVTotalMeasurements {
    BuildingName: string;
    Area: string;
    PrimaryPitch: string;
    LengthRidge: string;
    LengthValley: string;
    LengthEave: string;
    LengthRake: string;
    LengthHip: string;
}
