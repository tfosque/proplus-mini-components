export interface SavedOrderConfirmationResponse {
    id: string;
    mincronId: null | string;
    displayName: string;
    accountNumber: string;
    accountName: null | string;
    accountNameOriginal: string;
    creationDate: string;
    createdUser: string;
    firstName: null | string;
    lastName: null | string;
    createdUserEmail: null | string;
    submittedDate: string;
    status: string;
    statusDisplayName: null | string;
    readOnly: boolean | null;
    siteId: string;
    organizationId: string;
    contactInfo: ContactInfo;
    lastModifiedDate: string;
    lastModifiedUser: string;
    deleteStatus: boolean | null;
    job: Job;
    jobAccounts: JobAccounts;
    shippingMethod: string;
    shippingMethodValue: string;
    shippingMethods: DeliveryOption[];
    shippingAddress: ShippingAddress;
    shippingAddressTitle: string;
    branchName: string;
    branchAddress: BranchAddress;
    instructions: string;
    commerceItems: CommerceItem[];
    requiredFields: { [key: string]: boolean | null };
    approvedBy: null | string;
    po: string;
    emailAddress: string[];
    deliveryOption: string;
    deliveryOptionValue: string;
    deliveryOptions: DeliveryOption[];
    deliveryDate: string;
    deliveryTime: string;
    deliveryTimes: DeliveryOption[] | null;
    itemsTotal: number;
    taxes: number;
    otherCharges: number;
    subTotal: number;
    addressBooks: AddressBook[] | null;
    addressBook: AddressBook | null;
    storeLocatorItemId: string;
    rejectReason: null | string;
    assignApprovalDisplayText: null | string;
    assignApproval: AssignApproval;
    rejectUserDisplayText: null | string;
    rejectUser: AssignApproval;
    showDeliveryNotification: boolean;
    accountBranchState: null | string;
    displaySubTotalMsg: boolean;
    subTotalMsg: null | string;
    thankYouMsg: string;
    expressDeliveryTimes?: null;
    displayOtherChargeTBD?: boolean;
    serverTime?: null;
    postponeDeliveryHour?: null;
    submittedUser?: null;
    displayTaxTBD?: boolean;
    submittedUserEmail?: null;
    timeZoneOffset?: null;
    branchAddressTimeZoneId?: null;
    timeZoneId?: null;
    lastModifiedUserEmail?: null;
    lastModifiedUserName?: null;
    messageMap?: null;
    messageCode?: null;
    submittedUserName?: null;
}

export interface AddressBook {
    id: string;
    displayName: string;
    shippingAddress: ShippingAddress;
    contactInfo: ContactInfo;
}

export interface ContactInfo {
    firstName: null | string;
    lastName: null | string;
    nickName: null | string;
    phoneNumber: string;
}

export interface ShippingAddress {
    address1: string;
    address2: string;
    address3: null | string;
    country: string;
    city: string;
    state: string;
    states: DeliveryOption[] | null;
    postalCode: string;
}

export interface DeliveryOption {
    displayName: string;
    value: string;
    selected: boolean;
    disabled?: null;
}

export interface AssignApproval {
    id: null | string;
    name: null | string;
    email: null | string;
    messageCode?: null;
    messageMap?: null;
}

export interface BranchAddress {
    displayName: string;
    address1: string;
    address2: string;
    address3: null | string;
    country: string;
    city: string;
    state: string;
    stateValue: string;
    postalCode: string;
    phoneNumber: string;
    branchNumber: null | string;
}

export interface CommerceItem {
    id: string;
    imageUrl: string;
    imageOnErrorUrl: string;
    thumbImageUrl: string;
    pdpUrl: string;
    description: string;
    itemNumber: string;
    price: number;
    quantity: number;
    uom: string;
    subTotal: number;
    deleteStatus: boolean | null;
    vendorColorId: null | string;
    productId: string;
    itemGrayOutLevel: string;
    color?: null;
    mincronDescription?: string;
    messageMap?: null;
    MFG?: null;
    messageCode?: null;
    siteId?: null;
    hasBranchAvailability?: boolean;
}

export interface Job {
    jobNumber: string;
    jobName: string;
    jobNameMandatory: boolean | null;
    jobNumberMandatory: boolean | null;
    jobNumberDisplayName: null | string;
    selected?: boolean;
}

export interface JobAccounts {
    unavailable: boolean | null;
    unavailableMsg: boolean | null;
    jobs: Job[];
}
