export interface GetOrderShippingInfoResponse {
    deliveryOption: string;
    deliveryOptionValue: 'scheduled' | 'onHold';
    deliveryOptions: DeliveryOption[];
    deliveryDate: string;
    deliveryTime: string | null;
    deliveryTimes: DeliveryOption[];
    expressDeliveryTimes: DeliveryOption[];
    shippingMethod: string;
    shippingMethodValue: 'Pick_up' | 'Ship_to';
    shippingMethods: DeliveryOption[];
    shippingAddress: ShippingAddress;
    addressBooks: AddressBook[];
    addressBook: AddressBook | null;
    branchAddress: BranchAddress;
    instructions: string | null;
}

interface BranchAddress {
    displayName: string | null;
    address1: string | null;
    address2: string | null;
    address3: string | null;
    country: string | null;
    city: string | null;
    state: string | null;
    stateValue: string | null;
    postalCode: string | null;
    phoneNumber: string | null;
    branchNumber: string | null;
}

export interface AddressBook {
    id: string;
    displayName: string;
    contactInfo: BookContactInfo | null;
    shippingAddress: BookShippingAddress | null;
    messageCode?: unknown;
    message?: unknown;
    messageMap?: unknown;
}

export interface BookShippingAddress {
    country: string;
    address3: string | null;
    address2: string;
    city: string;
    address1: string;
    postalCode: string;
    state: string;
    states: unknown;
}

export interface BookContactInfo {
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    nickName: string;
}

interface ShippingAddress {
    addressBookId: string | null;
    nickName: string | null;
    firstName: string | null;
    lastName: string | null;
    address1: string | null;
    address2: string | null;
    address3: string | null;
    city: string | null;
    stateValue: string | null;
    states: DeliveryOption[] | null;
    postalCode: string | null;
    countryValue: string | null;
    countries: DeliveryOption[] | null;
    phoneNumber: string | null;
}

interface DeliveryOption {
    displayName: string;
    value: string | null;
    selected: boolean;
    disabled: null | boolean;
}

export const emptyAddressBookEntry: AddressBook = {
    id: '',
    contactInfo: null,
    displayName: '',
    shippingAddress: null,
    message: null,
    messageCode: null,
    messageMap: null,
};
