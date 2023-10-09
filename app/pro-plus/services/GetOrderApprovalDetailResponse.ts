export interface GetOrderApprovalDetailResponse {
    id: string;
    displayName: string;
    siteId: string;
    organizationId: string;
    accountNumber: string;
    contactInfo: ContactInfo;
    creationDate: string;
    createdUser: string;
    submittedDate: string;
    lastModifiedDate: string;
    lastModifiedUser: string;
    assignApproval: AssignApproval;
    assignApprovalDisplayText: string;
    submitApproval: string;
    deleteStatus: boolean;
    job: Job;
    jobAccounts: JobAccounts;
    approvedBy: string;
    po: string;
    additionalEmailRecipient: string[];
    deliveryOption: string;
    deliveryOptions: DeliveryOption[];
    deliveryOptionValue: string;
    deliveryDate: string;
    deliveryTime: string;
    deliveryTimes: DeliveryOption[];
    shippingMethod: string;
    shippingMethodValue: string;
    shippingMethods: DeliveryOption[];
    shippingAddressTitle: string;
    shippingAddress: ShippingAddress;
    branchName: string;
    branchAddress: BranchAddress;
    instructions: string;
    commerceItems: CommerceItem[] | null;
    status: string;
    statusDisplayName: string;
    mincronId: string;
    itemsTotal: number;
    taxes: number;
    otherCharges: number;
    subTotal: number;
    addressBooks: AddressBook[];
    addressBook: AddressBook;
    storeLocatorItemId: string;
    rejectReason: string;
    rejectUserDisplayText: string;
    rejectUser: AssignApproval;
    showDeliveryNotification: boolean;
    MFG: string;
    color: string;
}

export interface AddressBook {
    id: string;
    displayName: string;
    shippingAddress: ShippingAddress;
    contactInfo: ContactInfo;
}

export interface ContactInfo {
    firstName: string;
    lastName: string;
    nickName: string;
    phoneNumber: string;
}

export interface ShippingAddress {
    address1: string;
    address2: string;
    address3: string;
    country: string;
    city: string;
    state: string;
    states: DeliveryOption[];
    postalCode: string;
}

export interface DeliveryOption {
    displayName: string;
    value: string;
    selected: boolean;
}

export interface AssignApproval {
    id: string;
    name: string;
    email: string;
}

export interface BranchAddress {
    displayName: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    stateValue: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
}

export interface CommerceItem {
    atgItemDescription?: string;
    id: string;
    imageUrl: string;
    imageOnErrorUrl: string;
    thumbImageUrl: string;
    pdpUrl: string;
    description: string;
    itemNumber: string;
    itemFromQuote: boolean;
    price: number;
    quantity: number;
    uom: string;
    subTotal: number;
    deleteStatus: boolean;
    vendorColorId: string;
    productId: string;
    itemGrayOutLevel: string;
    nickName?: string | null;
}

export interface Job {
    jobNumber: string;
    jobName: string;
    jobNameMandatory: boolean;
    jobNumberMandatory: boolean;
    jobNumberDisplayName: string;
}

export interface JobAccounts {
    unavailable: boolean;
    unavailableMsg: boolean;
    jobs: Job[];
}
