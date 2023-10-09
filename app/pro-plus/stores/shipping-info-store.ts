import {
    Record,
    String,
    Literal,
    InstanceOf,
    Null,
    Boolean,
    Static,
} from 'runtypes';
import { storeOf } from './store';
import {
    emptyAddressBookEntry,
    AddressBook,
} from '../model/address-book-response';
import { GetOrderShippingInfoResponse } from '../services/GetOrderShippingInfoResponse';
import {
    ShippingAddress,
    AddOrderShippingInfoRequest,
    SchedulingOption,
    DeliveryOption,
} from '../services/AddOrderShippingInfoRequest';
import moment from 'moment';
import { map } from 'rxjs/operators';
import { LocationMarker } from '../pages/shopping-cart/location-picker';
import { SessionInfo } from '../services/SessionInfo';
import { Branch } from '../model/branch';
import { CartItemV2Response } from '../services/shopping-cart-service';
import {
    SavedOrderShippingResponse,
    SavedDeliveryOption,
} from '../services/saved-orders.service';
import { UpdateSavedOrderShippingInfoRequest } from '../services/UpdateSavedOrderShippingInfoRequest';
import momentBusinessDays from 'moment-business-days';

const ShippingMethod = Literal('Pick_up').Or(Literal('Ship_to'));
type ShippingMethod = Static<typeof ShippingMethod>;
const PickTime = Record({
    displayName: String,
    disabled: Boolean,
    value: String,
    selected: Boolean,
});
type PickTime = Static<typeof PickTime>;
const ScheduleMethod = Literal('scheduled').Or(Literal('onHold'));
type ScheduleMethod = Static<typeof ScheduleMethod>;
const BindingShippingAddress = Record({
    addressBookId: String,
    address1: String,
    address2: String,
    address3: String,
    city: String,
    stateValue: String,
    postalCode: String,
    phoneNumber: String,
    branchName: String,
    nickName: String,
    firstName: String,
    lastName: String,
    countryValue: String,
});
type BindingShippingAddress = Static<typeof BindingShippingAddress>;
type ShippingAddressFields = keyof BindingShippingAddress;

export const blankShippingAddress = {
    addressBookId: '',
    address1: '',
    address2: '',
    address3: '',
    branchName: '',
    city: '',
    countryValue: '',
    firstName: '',
    lastName: '',
    nickName: '',
    phoneNumber: '',
    postalCode: '',
    stateValue: '',
};
export const standardPickupHours = [
    { key: 8, value: '8 am' },
    { key: 9, value: '9 am' },
    { key: 10, value: '10 am' },
    { key: 11, value: '11 am' },
    { key: 12, value: '12 pm' },
    { key: 13, value: '1 pm' },
    { key: 14, value: '2 pm' },
    { key: 15, value: '3 pm' },
    { key: 16, value: '4 pm' },
];
export const ShippingEditorModel = Record({
    scheduledOptionValue: ScheduleMethod,
    shippingMethodValue: ShippingMethod,
    changeShippingAddressLocation: Boolean,
    deliveryDate: InstanceOf(Date).Or(Null),
    deliveryTime: String,
    saveShippingAddressToAddressBook: Boolean,
    shippingAddress: BindingShippingAddress,
    specialInstruction: String,
});
const blankShippingEditorModel: ShippingEditorModel = {
    scheduledOptionValue: 'onHold',
    shippingMethodValue: 'Pick_up',
    changeShippingAddressLocation: false,
    deliveryDate: null,
    deliveryTime: '',
    saveShippingAddressToAddressBook: false,
    shippingAddress: blankShippingAddress,
    specialInstruction: '',
};

export type ShippingEditorModel = Static<typeof ShippingEditorModel>;

interface ShippingEditor extends Readonly<ShippingEditorModel> {
    savedOrderId: string | null;
    atgOrderId: string | null;
    defaultBranchAddress: ShippingAddress | null;
    defaultBranch: Branch | null;
    pickupBranch: Branch | null;
    accountBranch: Branch | null;
    saveAddress: boolean;
    locationValidMsg: string | null;
    addressBooks: AddressBook[];
    timeZoneOffet: number;
    readonly currentDate: Date;
    readonly minDate: Date;
    readonly maxDate: Date;
    shippingInfo?: GetOrderShippingInfoResponse;
    availablePickupTimes: PickTime[];
}

const initialDate = new Date();
const initialState: ShippingEditor = {
    ...blankShippingEditorModel,
    savedOrderId: null,
    atgOrderId: null,
    defaultBranchAddress: null,
    saveAddress: false,
    locationValidMsg: '',
    addressBooks: [],
    timeZoneOffet: 0,
    currentDate: initialDate,
    minDate: new Date(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        initialDate.getDate()
    ),
    maxDate: new Date(
        initialDate.getFullYear() + 1,
        initialDate.getMonth(),
        initialDate.getDate()
    ),
    shippingInfo: undefined,
    defaultBranch: null,
    pickupBranch: null,
    accountBranch: null,
    availablePickupTimes: [],
};

function loadGetOrderShippingInfoResponse(
    m: ShippingEditor,
    r: GetOrderShippingInfoResponse | undefined
): ShippingEditor {
    const sa = r && r.shippingAddress;
    if (sa && sa.phoneNumber) {
    }
    const number =
        sa && sa.phoneNumber ? sa.phoneNumber.replace(/\D+/g, '') : '';
    const shippingAddress: BindingShippingAddress = {
        address1: (sa && sa.address1) || '',
        city: (sa && sa.city) || '',
        stateValue: (sa && sa.stateValue) || '',
        postalCode: (sa && sa.postalCode) || '',
        phoneNumber:
            (sa &&
                number.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3')) ||
            '',
        addressBookId: (sa && sa.addressBookId) || '',
        nickName: (sa && sa.nickName) || '',
        firstName: (sa && sa.firstName) || '',
        lastName: (sa && sa.lastName) || '',
        address2: (sa && sa.address2) || '',
        address3: (sa && sa.address3) || '',
        countryValue: (sa && sa.countryValue) || '',
        branchName: '',
    };
    const ba = (r && r.branchAddress) || null;
    const defaultBranch: Branch | null = !ba
        ? null
        : {
              address: {
                  address1: ba.address1 || undefined,
                  address2: ba.address2 || undefined,
                  address3: ba.address3 || undefined,
                  city: ba.city || undefined,
                  country: ba.country || undefined,
                  postalCode: ba.postalCode || undefined,
                  state: ba.stateValue || undefined,
              },
              branchName: ba.displayName || undefined,
              branchNumber: ba.branchNumber || undefined,
              branchPhone: ba.phoneNumber || undefined,
              branchRegionId: undefined,
          };
    if (
        r &&
        r.shippingMethodValue &&
        r.shippingMethodValue === 'Pick_up' &&
        ba &&
        ba.address1
    ) {
        return {
            ...m,
            defaultBranch: defaultBranch,
            pickupBranch: defaultBranch,
            scheduledOptionValue: (r && r.deliveryOptionValue) || 'onHold',
            shippingMethodValue: (r && r.shippingMethodValue) || 'Pick_up',
            changeShippingAddressLocation: false,
            deliveryDate: (r && toDate(r.deliveryDate)) || null,
            deliveryTime: (r && r.deliveryTime) || '',
            saveShippingAddressToAddressBook: false,
            shippingAddress: shippingAddress,
            specialInstruction:
                ((r && r.instructions) || '').length > 234
                    ? ((r && r.instructions) || '').substring(0, 234)
                    : (r && r.instructions) || '',
            shippingInfo: r || m.shippingInfo,
        };
    }
    return {
        ...m,
        defaultBranch: defaultBranch,
        pickupBranch: m.accountBranch,
        scheduledOptionValue: (r && r.deliveryOptionValue) || 'onHold',
        shippingMethodValue: (r && r.shippingMethodValue) || 'Pick_up',
        changeShippingAddressLocation: false,
        deliveryDate: (r && toDate(r.deliveryDate)) || null,
        deliveryTime: (r && r.deliveryTime) || '',
        saveShippingAddressToAddressBook: false,
        shippingAddress: shippingAddress,
        specialInstruction:
            ((r && r.instructions) || '').length > 234
                ? ((r && r.instructions) || '').substring(0, 234)
                : (r && r.instructions) || '',
        shippingInfo: r || m.shippingInfo,
    };
}
const storeFactory = storeOf<ShippingEditor>(initialState);
const reducers = storeFactory.defineReducers({
    load(
        m: ShippingEditor,
        r: GetOrderShippingInfoResponse | undefined
    ): ShippingEditor {
        return loadGetOrderShippingInfoResponse(m, r);
    },
    updateCartState(m, cartState: CartItemV2Response) {
        return {
            ...m,
            savedOrderId: null,
            shippingInfo: undefined,
            atgOrderId:
                (cartState &&
                    cartState.result &&
                    cartState.result.atgOrderId) ||
                null,
        };
    },

    setAddressBook(m, newBook: AddressBook | null | undefined): ShippingEditor {
        return {
            ...m,
            shippingAddress: getShippingAddress(
                newBook || emptyAddressBookEntry
            ),
        };
    },
    setTimeZoneOffet(m, newOffset): ShippingEditor {
        return { ...m, timeZoneOffet: newOffset };
    },
    emptyForm(m, _b: true): ShippingEditor {
        return { ...m, shippingAddress: blankShippingAddress };
    },
    setScheduledDate(m, newDate: Date | string | null): ShippingEditor {
        return {
            ...m,
            deliveryDate: toDate(newDate),
            availablePickupTimes: getAvailablePickupTimes(m),
        };
    },
    setScheduledTime(m, newTime: string): ShippingEditor {
        return { ...m, deliveryTime: newTime };
    },
    changePickupLocation(m, loc: LocationMarker): ShippingEditor {
        return {
            ...m,
            changeShippingAddressLocation: true,
            pickupBranch: loc,
        };
    },
    setPickupLocationMessage(
        m,
        pickLocationWarning: string | null
    ): ShippingEditor {
        return {
            ...m,
            locationValidMsg: pickLocationWarning,
        };
    },
    setScheduledOption(m, newValue: ScheduleMethod): ShippingEditor {
        return {
            ...m,
            scheduledOptionValue: newValue,
        };
    },
    setShippingMethod(m, newValue: ShippingMethod): ShippingEditor {
        return {
            ...m,
            shippingMethodValue: newValue,
            deliveryTime: '',
        };
    },
    setUserInfo(m, u: SessionInfo): ShippingEditor {
        if (!u.sessionInfo) {
            return m;
        }
        const branch = u.sessionInfo.accountBranch;
        const e: ShippingEditor = {
            ...m,
            defaultBranchAddress: getBranchShippingAddress(u),
            defaultBranch: branch || null,
            pickupBranch: { ...branch } || null,
            accountBranch: branch || null,
        };
        return e;
    },
    loadAddressBooks(m, addressBooks: AddressBook[]): ShippingEditor {
        return { ...m, addressBooks };
    },
    setInstructions(m, newInstructions: string): ShippingEditor {
        return { ...m, specialInstruction: newInstructions };
    },
    setAddressField(
        m,
        f: { name: ShippingAddressFields; value: string }
    ): ShippingEditor {
        const address = { ...m.shippingAddress };
        address[f.name] = f.value;
        return { ...m, shippingAddress: address };
    },
    pickAddress(
        m,
        a: {
            address1: string;
            address2: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        }
    ): ShippingEditor {
        const address = { ...m.shippingAddress };
        address.address1 = a.address1;
        address.address2 = a.address2;
        address.city = a.city;
        address.stateValue = a.state;
        address.postalCode = a.postalCode;
        address.countryValue = a.country;
        return { ...m, shippingAddress: address };
    },
    setSaveShippingAddressToAddressBook(m, newValue): ShippingEditor {
        return { ...m, saveShippingAddressToAddressBook: newValue };
    },
    loadSavedOrder(
        m,
        savedOrderResponse: SavedOrderShippingResponse | null
    ): ShippingEditor {
        if (!savedOrderResponse) {
            return m;
        }
        const expressDeliveryTimes =
            savedOrderResponse.expressDeliveryTimes || [];
        const deliveryTimes = savedOrderResponse.deliveryTimes || [];
        const selectedTime =
            expressDeliveryTimes.find((t) => t.selected) ||
            deliveryTimes.find((t) => t.selected);
        const sa = savedOrderResponse.shippingAddress;
        const ci = savedOrderResponse.contactInfo;
        const states = sa.states || [];
        const selectedState = states.find((s) => s.selected);
        const number = (ci.phoneNumber || '').replace(/\D+/g, '');
        const shippingAddress = {
            addressBookId: '',
            firstName: ci.firstName,
            lastName: ci.lastName,
            nickName: ci.nickName,
            address1: sa.address1,
            address2: sa.address2,
            address3: sa.address3,
            city: sa.city,
            stateValue: (selectedState && selectedState.value) || '',
            postalCode: sa.postalCode,
            countryValue: sa.country,
            countries: [],
            states: savedOrderResponse.shippingAddress.states.map(
                toDeliveryOption
            ),
            phoneNumber: number.replace(
                /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
                '$1-$2-$3'
            ),
        };
        const comp: GetOrderShippingInfoResponse = {
            ...savedOrderResponse,
            deliveryOptionValue:
                savedOrderResponse.deliveryOptionValue || 'onHold',
            expressDeliveryTimes:
                savedOrderResponse.expressDeliveryTimes.map(toDeliveryOption),
            deliveryTimes:
                savedOrderResponse.deliveryTimes.map(toDeliveryOption),
            deliveryOptions:
                savedOrderResponse.deliveryOptions.map(toDeliveryOption),
            shippingMethods:
                savedOrderResponse.shippingMethods.map(toDeliveryOption),
            shippingMethodValue:
                savedOrderResponse.shippingMethodValue || 'Pick_up',
            shippingAddress: shippingAddress,
            branchAddress: {
                ...savedOrderResponse.branchAddress,
                branchNumber: '',
            },
            deliveryTime: (selectedTime && selectedTime.value) || null,
        };
        const newEditor = loadGetOrderShippingInfoResponse(m, comp);
        return {
            ...newEditor,
            savedOrderId: savedOrderResponse.id,
        };
        function toDeliveryOption(v: SavedDeliveryOption) {
            return {
                ...v,
                disabled: null,
            };
        }
    },
});

export type ShippingInfoReducer = typeof reducers;

export type ShippingInfoStore = ReturnType<typeof createShippingStore>;

export function createShippingStore() {
    const store = storeFactory.createStore(reducers);
    const form$ = store.getState().pipe(map(toView));

    let value = toView(initialState);

    form$.subscribe((newValue) => {
        value = newValue;
    });

    const ret = {
        dispatch: store.dispatch,
        form$: form$,
        get value() {
            return value;
        },
    };

    return ret;
    function getDispatch() {
        return store.dispatch;
    }

    function toView(m: Readonly<ShippingEditor>) {
        const deliveryMethod = m.shippingMethodValue === 'Ship_to';
        const addressBookId =
            (m.shippingInfo && m.shippingInfo.shippingAddress.addressBookId) ||
            null;
        const addressBook =
            m.addressBooks.find((b) => b.addressBookId === addressBookId) ||
            null;
        const saveCartShippingInfoRequest = EditorToUpdate(m);
        const savedOrderShippingInfoRequest = getSavedOrderRequest(m);
        const validate = savedOrderShippingInfoRequest
            ? UpdateSavedOrderShippingInfoRequest.validate(
                  savedOrderShippingInfoRequest
              )
            : AddOrderShippingInfoRequest.validate(saveCartShippingInfoRequest);
        const newView = {
            ...m,
            isScheduled: m.scheduledOptionValue === 'scheduled',
            DeliveryMethod: deliveryMethod,
            isValidDate: m.deliveryDate,
            showPickupMsg:
                m.shippingMethodValue === 'Pick_up' &&
                withinWeekdays(m, 4) &&
                m.scheduledOptionValue !== 'onHold',
            availablePickupTimes: getAvailablePickupTimes(m),
            saveCartShippingInfoRequest: saveCartShippingInfoRequest,
            savedOrderShippingInfoRequest: savedOrderShippingInfoRequest,
            addressBook: addressBook,
            selectedPickupBranch: getSelectedPickupBranch(m),
            emptyForm() {
                getDispatch().emptyForm(true);
            },
            canProceed: validate.success,
            errorMessage:
                (!validate.success &&
                    ((validate.key &&
                        `${validate.key} - ${validate.message}`) ||
                        `${validate.message}`)) ||
                '',
            address: {
                get addressBookId() {
                    return m.shippingAddress.addressBookId;
                },
                set addressBookId(newValue) {
                    getDispatch().setAddressField({
                        name: 'addressBookId',
                        value: newValue,
                    });
                },
                get address1() {
                    return m.shippingAddress.address1;
                },
                set address1(newValue) {
                    getDispatch().setAddressField({
                        name: 'address1',
                        value: newValue,
                    });
                },
                get address2() {
                    return m.shippingAddress.address2;
                },
                set address2(newValue) {
                    getDispatch().setAddressField({
                        name: 'address2',
                        value: newValue,
                    });
                },
                get address3() {
                    return m.shippingAddress.address3;
                },
                set address3(newValue) {
                    getDispatch().setAddressField({
                        name: 'address3',
                        value: newValue,
                    });
                },
                get branchName() {
                    return m.shippingAddress.branchName;
                },
                set branchName(newValue) {
                    getDispatch().setAddressField({
                        name: 'branchName',
                        value: newValue,
                    });
                },
                get city() {
                    return m.shippingAddress.city;
                },
                set city(newValue) {
                    getDispatch().setAddressField({
                        name: 'city',
                        value: newValue,
                    });
                },
                get countryValue() {
                    return m.shippingAddress.countryValue;
                },
                set countryValue(newValue) {
                    getDispatch().setAddressField({
                        name: 'countryValue',
                        value: newValue,
                    });
                },
                get firstName() {
                    return m.shippingAddress.firstName;
                },
                set firstName(newValue) {
                    getDispatch().setAddressField({
                        name: 'firstName',
                        value: newValue,
                    });
                },
                get lastName() {
                    return m.shippingAddress.lastName;
                },
                set lastName(newValue) {
                    getDispatch().setAddressField({
                        name: 'lastName',
                        value: newValue,
                    });
                },
                get nickName() {
                    return m.shippingAddress.nickName;
                },
                set nickName(newValue) {
                    getDispatch().setAddressField({
                        name: 'nickName',
                        value: newValue,
                    });
                },
                get phoneNumber() {
                    return m.shippingAddress.phoneNumber;
                },
                set phoneNumber(newValue) {
                    getDispatch().setAddressField({
                        name: 'phoneNumber',
                        value: newValue,
                    });
                },
                get postalCode() {
                    return m.shippingAddress.postalCode;
                },
                set postalCode(newValue) {
                    getDispatch().setAddressField({
                        name: 'postalCode',
                        value: newValue,
                    });
                },
                get stateValue() {
                    return m.shippingAddress.stateValue;
                },
                set stateValue(newValue) {
                    getDispatch().setAddressField({
                        name: 'stateValue',
                        value: newValue,
                    });
                },
            },
        };
        return newView;
    }
}

function getSelectedPickupBranch(m: Readonly<ShippingEditor>): Branch | null {
    return m.pickupBranch || m.defaultBranch || null;
}

function getSavedOrderRequest(
    m: Readonly<ShippingEditor>
): UpdateSavedOrderShippingInfoRequest | null {
    if (!m.savedOrderId) {
        return null;
    }
    const ba = m.defaultBranchAddress;
    const pickupBranch = m.pickupBranch;
    const a = m.shippingAddress;
    const shippingAddress =
        m.shippingMethodValue === 'Pick_up' &&
        m.changeShippingAddressLocation &&
        pickupBranch
            ? {
                  displayName: pickupBranch.branchName || '',
                  address1: pickupBranch.address
                      ? pickupBranch.address.address1 || ''
                      : '',
                  address2: pickupBranch.address
                      ? pickupBranch.address.address2 || ''
                      : '',
                  address3: pickupBranch.address
                      ? pickupBranch.address.address3 || ''
                      : '',
                  city: pickupBranch.address
                      ? pickupBranch.address.city || ''
                      : '',
                  state: pickupBranch.address
                      ? pickupBranch.address.state || ''
                      : '',
                  postalCode: pickupBranch.address
                      ? pickupBranch.address.postalCode || ''
                      : '',
                  country: pickupBranch.address
                      ? pickupBranch.address.country || ''
                      : '',
              }
            : m.shippingMethodValue === 'Pick_up' &&
              m.shippingAddress &&
              m.shippingAddress.address1
            ? {
                  displayName: m.shippingAddress.branchName || '',
                  address1: m.shippingAddress.address1 || '',
                  address2: m.shippingAddress.address2 || '',
                  address3: m.shippingAddress.address3 || '',
                  city: m.shippingAddress.city || '',
                  state: m.shippingAddress.stateValue || '',
                  postalCode: m.shippingAddress.postalCode || '',
                  country: m.shippingAddress.countryValue || '',
              }
            : m.shippingMethodValue === 'Pick_up' && ba
            ? {
                  displayName: ba.branchName || '',
                  address1: ba.address1,
                  address2: ba.address2 || '',
                  address3: ba.address3 || '',
                  city: ba.city,
                  state: ba.stateValue,
                  postalCode: ba.postalCode,
                  country: ba.countryValue || '',
              }
            : {
                  displayName: a.branchName,
                  address1: a.address1,
                  address2: a.address2,
                  address3: a.address3,
                  city: a.city,
                  state: a.stateValue,
                  postalCode: a.postalCode,
                  country: a.countryValue,
              };
    const contactInfo =
        m.shippingMethodValue === 'Pick_up' && ba
            ? {
                  firstName: ba.firstName || '',
                  lastName: ba.lastName || '',
                  nickName: ba.nickName || '',
                  phoneNumber: ba.phoneNumber,
              }
            : {
                  firstName: a.firstName,
                  lastName: a.lastName,
                  nickName: a.nickName,
                  phoneNumber: a.phoneNumber,
              };
    const savedOrderRequest: UpdateSavedOrderShippingInfoRequest = {
        orderId: m.savedOrderId,
        deliveryOption: m.scheduledOptionValue,
        deliveryDate: formatDate(m.deliveryDate),
        deliveryTime: m.deliveryTime,
        shippingMethod: m.shippingMethodValue,
        shippingAddress: shippingAddress,
        branchName: (ba && ba.branchName) || '',
        contactInfo: contactInfo,
        instructions:
            m.specialInstruction.length > 234
                ? m.specialInstruction.substring(0, 234)
                : m.specialInstruction,
    };
    return savedOrderRequest;
}

function EditorToUpdate(
    m: Readonly<ShippingEditor>
): AddOrderShippingInfoRequest {
    const scheduling: SchedulingOption =
        m.scheduledOptionValue === 'onHold'
            ? {
                  deliveryOptionValue: 'onHold',
              }
            : {
                  deliveryOptionValue: 'scheduled',
                  deliveryDate: formatDate(m.deliveryDate),
                  deliveryTime: m.deliveryTime,
              };

    const shipping: DeliveryOption =
        m.shippingMethodValue === 'Pick_up'
            ? {
                  shippingMethodValue: 'Pick_up',
                  changeShippingAddressLocation:
                      m.changeShippingAddressLocation,
                  shippingAddress: getPickupAddress(m),
              }
            : {
                  shippingMethodValue: 'Ship_to',
                  changeShippingAddressLocation:
                      m.changeShippingAddressLocation,
                  saveShippingAddressToAddressBook:
                      m.saveShippingAddressToAddressBook,
                  shippingAddress: m.shippingAddress,
              };

    const r: AddOrderShippingInfoRequest = {
        ...scheduling,
        ...shipping,
        specialInstruction:
            m.specialInstruction.length > 234
                ? m.specialInstruction.substring(0, 234)
                : m.specialInstruction,
    };
    return r;
}
export function getPickupAddress(
    m: Readonly<ShippingEditor>
): BindingShippingAddress {
    const bi = m.pickupBranch;
    const a = (bi && bi.address) || null;
    return {
        address1: (a && a.address1) || '',
        address2: (a && a.address2) || '',
        address3: (a && a.address3) || '',
        city: (a && a.city) || '',
        stateValue: (a && a.state) || '',
        postalCode: (a && a.postalCode) || '',
        phoneNumber: (bi && bi.branchPhone) || '',
        branchName: (bi && bi.branchName) || '',
        addressBookId: '',
        nickName: '',
        firstName: '',
        lastName: '',
        countryValue: (a && a.country) || '',
    };
}

export function getShippingAddress(b: AddressBook): BindingShippingAddress {
    const bi = b.addressBookInfo;
    return {
        address1: bi && bi.address1,
        city: bi && bi.city,
        stateValue: bi && bi.stateValue,
        postalCode: bi && bi.postalCode,
        phoneNumber: bi && bi.phoneNumber,
        branchName: '',
        addressBookId: b.addressBookId,
        nickName: (bi && bi.nickName) || '',
        firstName: (bi && bi.firstName) || '',
        lastName: bi && bi.lastName,
        address2: (bi && bi.address2) || '',
        address3: '',
        countryValue: (bi && bi.countryValue) || '',
    };
}

function getAvailablePickupTimes(m: Readonly<ShippingEditor>): PickTime[] {
    if (!m.shippingInfo) {
        return [];
    }

    /* Display strings['anytime', 'afternoon', 'special request', etc.]
       if user's date selection is within 5 days */

    const selectedDate = m && m.deliveryDate && m.deliveryDate.toDateString();

    if (!selectedDate) {
        return [];
    }

    const today = moment();

    // determine if 5 days from today
    const canPickExpressHours = canPickExpress(today, selectedDate);

    if (m.shippingMethodValue === 'Pick_up' && canPickExpressHours) {
        // available hours if date is today's date, exclude weekends
        const minHour = getMinimumHour(
            new Date(),
            m.deliveryDate,
            m.timeZoneOffet
        );

        return standardPickupHours.map((v): PickTime => {
            return {
                displayName: v.value.toUpperCase(),
                disabled: v.key <= minHour,
                value: v.key.toString(),
                selected: false,
            };
        });
    } else {
        return m.shippingInfo.deliveryTimes.map((t) => {
            const newTime = {
                displayName: t.displayName,
                disabled: t.disabled || false,
                value: t.value || '',
                selected: t.selected,
            };
            return newTime;
        });
    }
}

/**
 * Determines the minimum hour pickups are available based on the current imee of day,
 * location and delivery date
 *
 * @param now The current time
 * @param deliveryDate The date being delivered
 * @param timeZoneOffet The timeZoneOffset in seconds
 */
export function getMinimumHour(
    now: Date,
    deliveryDate: Date | null,
    timeZoneOffet: number
) {
    // if minutes >= 30 minutes then offset is 3 rounding up;
    const expressLaneOffset = now.getMinutes() === 0 ? 0 : 1;

    // const expressLaneOffset = 1;
    // console.log('getMinimumHour', {
    //     now,
    //     deliveryDate,
    //     timeZoneOffet,
    //     expressLaneOffset,
    // });

    const todaysDayOffMonth: number = now.getDate();
    const isDeliveryToday =
        (deliveryDate && deliveryDate.getDate() === todaysDayOffMonth) || false;

    //  The minimum hour is nothing if the delivery isn't today or we don't have any useful info about
    if (!deliveryDate || timeZoneOffet === 0 || !isDeliveryToday) {
        return 0;
    }
    //  Convert timeZoneOffset to minutes
    const offsetInMinutes = Math.round(timeZoneOffet / 60);
    const minimumHour = moment(now).utcOffset(offsetInMinutes).hour();
    console.log({ minimumHour });

    const dateDiffms = deliveryDate.getTime() - now.getTime();
    const maxFutureDays = 3;
    const msInADay = 1000 * 60 * 60 * 24;
    const dateDiff = dateDiffms / msInADay;
    // const nowDate = new Date();

    // console.log('getMinimumHour', { offsetInMinutes, minimumHour, dateDiff, maxFutureDays })

    if (dateDiff <= maxFutureDays) {
        if (deliveryDate.setHours(0, 0, 0, 0) !== now.setHours(0, 0, 0, 0)) {
            return 0;
        }
        console.log(minimumHour, expressLaneOffset);

        return minimumHour + expressLaneOffset;
    }
    return 0;
}

export function canPickExpress(today: moment.Moment, selectedDate: string) {
    const lastDayFortimes = momentBusinessDays(today).businessAdd(4, 'days');
    const diff = lastDayFortimes.diff(selectedDate, 'days');
    const canPickExpressHours = diff > 0;
    return canPickExpressHours;
}

function withinWeekdays(m: ShippingEditor, maxDays: number): boolean {
    const today = new Date();
    const calculatedDate = countWeekdays(today, maxDays);
    const date = m.deliveryDate;
    if (!date) {
        return false;
    }
    const selectedDate = moment(date);
    return selectedDate.isBefore(calculatedDate, 'day');
}

export function toDate(s: string | Date | null): Date | null {
    if (s === null) {
        return null;
    }
    if (s && s instanceof Date) {
        return s;
    }
    const timestamp = Date.parse(s);
    if (isNaN(timestamp)) {
        return null;
    }
    return new Date(s);
}

function formatDate(date: Date | null): string {
    return date ? moment(date, 'DD-MM-YYYY').format('MM-DD-YYYY') : '';
}

function countWeekdays(date: Date | null, days: number) {
    if (!date) {
        return 0;
    }
    let calculatedDate = moment(date);
    while (days > 0) {
        calculatedDate = calculatedDate.add(1, 'days');
        // decrease "days" only if it's a weekday.
        if (
            calculatedDate.isoWeekday() !== 6 &&
            calculatedDate.isoWeekday() !== 7
        ) {
            days -= 1;
        }
    }
    return calculatedDate;
}

function getBranchShippingAddress(s: SessionInfo): ShippingAddress {
    const b = (s.sessionInfo && s.sessionInfo.accountBranch) || null;
    const ba = (b && b.address) || null;
    return {
        addressBookId: '',
        address1: (ba && ba.address1) || '',
        address2: (ba && ba.address2) || '',
        address3: (ba && ba.address3) || '',
        branchName: (b && b.branchName) || '',
        city: (ba && ba.city) || '',
        stateValue: (ba && ba.state) || '',
        countryValue: (ba && ba.country) || '',
        firstName: '',
        lastName: '',
        nickName: '',
        phoneNumber: (b && b.branchPhone) || '',
        postalCode: (ba && ba.postalCode) || '',
    };
}

export interface Time {
    value: string;
    key: string | number;
}
