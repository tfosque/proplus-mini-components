export interface AddressBookResponse {
    result?: unknown;
    code?: unknown;
    callBackParam?: unknown;
    messages: Message[] | null;
    messageCode: number | null;
    success: boolean;
    addressBooks: AddressBook[];
}

export interface AddressBook {
    addressBookId: string;
    accountLegacyId: string;
    accountName: string;
    addressBookInfo: AddressBookInfo;
}

export const emptyAddressBookEntry = {
    accountLegacyId: '',
    accountName: '',
    addressBookId: '',
    addressBookInfo: {
        address1: '',
        address2: '',
        city: '',
        country: '',
        countryValue: '',
        firstName: '',
        lastName: '',
        nickName: '',
        phoneNumber: '',
        postalCode: '',
        state: '',
        stateValue: '',
    },
};

interface AddressBookInfo {
    nickName: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    stateValue: string;
    postalCode: string;
    country: string;
    countryValue: string;
    phoneNumber: string;
}

interface Message {
    type: string;
    value: string;
    code: string;
}
