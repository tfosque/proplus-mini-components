export interface GetCurrentUserInfoResponseV2 {
    message: string | undefined;
    accountBranch: AccountBranch;
    lastName: string;
    cartLineItems: number;
    profileId: string;
    roleType: string;
    firstName: string;
    lastSelectedAccount: LastSelectedAccount;
    deliveryTrackingSettings: DeliveryTrackingSettings;
    title: string | null;
    contactPhoneNumber: string | null;
    officePhoneNumber: string | null;
    mobilePhoneNumber: string | null;
    subscribeEmailType: SubscribEmailType;
    contactAddress: ContactAddress | null;
    declineNotificationEmail: boolean;
    userAccounts: string[];
    code: unknown | null;
    messages: unknown | null;
    messageCode: unknown | null;
    result: unknown | null;
    internalUser: boolean;
    userType: string;
    email: string;
    firstLoggedInDate?: string; // TODO
    login: string;
    hasPrivateEVAccount: boolean;
    lastActivity?: string;
    profileEagleViewPurchaseStatus: boolean
}

export interface AccountBranch {
    address: Address;
    branchNumber: string;
    branchName: string;
    branchPhone: string;
    branchRegionId: string;
    market: string;
    companyName?: string;
    divisionName?: string;
}

export interface Address {
    postalCode: string;
    state: string;
    address1: string;
    address2: string;
    address3: string;
    country: string;
    city: string;
}

export interface ContactAddress {
    email: string;
    lastName?: string;
    firstName: string;
    phoneNumber: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface DeliveryTrackingSettings {
    email: string;
    phone: string;
    myOrders: Orders;
    allOrders: Orders;
}

export interface Orders {
    requested: string;
    scheduled: string;
    delivered: string;
}

export interface LastSelectedAccount {
    accountName: string;
    accountEnabled: boolean;
    accountLegacyId: string;
    accountViewPrices: boolean;
    addCustomSteel: boolean;
    cashAccount: boolean;
    isAccountClosed: boolean;
}

export interface SubscribEmailType {
    subscribeOrder?: boolean;
    subscribeAccount?: boolean;
    subscribeQuote?: boolean;
}
