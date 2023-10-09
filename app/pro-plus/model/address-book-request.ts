export interface AddressBookRequest {
    addressBookId: string;
    addressBookInfo: AddressBookInfo;
}

export interface AddressBookInfo {
    nickName: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    city: string;
    stateValue: string;
    postalCode: string;
    countryValue: string;
    phoneNumber: string;
}
