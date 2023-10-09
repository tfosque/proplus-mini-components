export interface InstantAddressWildSearchRequest {
    Street1: string;
    City?: string;
    State?: string;
    ZipCode?: string;
    Country: string;
    ResponseType: string;
}

export interface InstantAddressWildSearchResponse {
    RequestId: string | null;
    InstantAddressResult: InstantAddress[];
    TotalRecords: number;
    MoreResultsAvailable: boolean;
    ProcessedOn: Date;
}

export interface InstantAddress {
    InputAddress: InputAddress;
    StandardizedAddress: StandardizedAddress;
    Flags: Flag;
    ResponseType: string;
}

interface InputAddress {
    ValidationType: string;
    ResponseType: string;
    Filters: any | null;
    FormatOverride: any | null;
    Urbanization: any | null;
    FirmOrRecipient: any | null;
    SkipParsing: boolean;
    IntegratorNotes: boolean;
    Street1: string;
    City: string;
    Street2: string;
    Street3: string;
    Street4: string;
    Street5: string;
    State: string;
    ZipCode: string;
    Zip4: string;
    Country: string;
}

export interface StandardizedAddress {
    Street1: string;
    Street2: string;
    Street3: string;
    Street4: string;
    Street5: string;
    City: string;
    State: string;
    ZipCode: string;
    UrbanizationName: string;
    CityStateZip: string;
    Country: string;
}

interface Flag {
    IsFuzzyRequest: boolean;
    VerificationFlag: string;
    ResponseFlag: string,
    AddressChangeFlags: string;
    ProcessedOn: string;
    SummaryFlags: string;
    JsProcessedOn: string;
    DeveloperCode: string;
    UITooltip: string;
    UISummaryMessage: string;
    UIMessage: string;
    FormatApplied: string;
    RecommendedAction: string;
}

export interface InstantAddressGetAddressRequest {
    Street1: string;
    Street2?: string;
    Street3?: string;
    Street4?: string;
    Street5?: string;
    City?: string;
    State?: string;
    ZipCode?: string;
    Country: string;
    ResponseType: string;
    IntegratorNotes?: boolean;
}
