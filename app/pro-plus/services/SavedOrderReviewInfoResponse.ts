export interface SavedOrderReviewInfoResponse {
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
    jobAccounts: JobAccounts | null;
    approvedBy: string;
    po: string;
    emailAddress: string[];
    deliveryOption: string;
    deliveryOptionValue: string;
    deliveryOptions: DeliveryOption[];
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
    commerceItems: CommerceItem[];
    status: string;
    statusDisplayName: string;
    mincronId: string;
    itemsTotal: number;
    taxes: number;
    otherCharges: number;
    orderRelatedDocuments?: [];
    subTotal: number;
    addressBooks: AddressBook[];
    addressBook: AddressBook;
    storeLocatorItemId: string;
    rejectReason: string;
    rejectUserDisplayText: string;
    rejectUser: AssignApproval;
    showDeliveryNotification: boolean;
    accountBranchState: string;
    requiredFields: RequiredFields;
}

interface AddressBook {
    id: string;
    displayName: string;
    shippingAddress: ShippingAddress;
    contactInfo: ContactInfo;
}

interface CommerceItem {
    id: string;
    imageUrl: string;
    imageOnErrorUrl: string;
    thumbImageUrl: string;
    thumbOnErrorImageUrl: string;
    pdpUrl: string;
    description: string;
    itemNumber: string;
    price: number;
    quantity: number;
    uom: string;
    subTotal: number;
    deleteStatus: boolean;
    vendorColorId: string;
    productId: string;
    itemGrayOutLevel: string;
}

interface BranchAddress {
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

interface ShippingAddress {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    states: DeliveryOption[];
    postalCode: string;
    country: string;
}

interface DeliveryOption {
    displayName: string;
    value: string;
    selected: boolean;
}

interface JobAccounts {
    unavailable: boolean;
    unavailableMsg: boolean;
    jobs: Job[];
}

interface Job {
    jobNumber: string;
    jobName: string;
    jobNameMandatory: boolean;
    jobNumberMandatory: boolean;
    jobNumberDisplayName: string;
    selected?: boolean;
}

interface AssignApproval {
    id: string;
    name: string;
    email: string;
}

interface ContactInfo {
    firstName: string;
    lastName: string;
    nickName: string;
    phoneNumber: string;
}

interface RequiredFields {
    address1: boolean | null;
    address2: boolean | null;
    address3: boolean | null;
    branchName: boolean | null;
    city: boolean | null;
    contactInfo: boolean | null;
    country: boolean | null;
    deliveryDate: boolean | null;
    deliveryOption: boolean | null;
    deliveryTime: boolean | null;
    firstName: boolean | null;
    instructions: boolean | null;
    jobAccounts: boolean | null;
    jobName: boolean | null;
    lastName: boolean | null;
    nickName: boolean | null;
    phoneNumber: boolean | null;
    po: boolean | null;
    postalCode: boolean | null;
    shippingAddress: boolean | null;
    shippingMethod: boolean | null;
    state: boolean | null;
}
