import { GetOrderShippingInfoResponse } from '../../../services/GetOrderShippingInfoResponse';
const deliveryOptions = [
    {
        displayName: 'Schedule Delivery Or Pick-Up',
        disabled: null,
        value: 'scheduled',
        selected: true,
    },
    {
        displayName: 'Place Order On Hold',
        disabled: null,
        value: 'onHold',
        selected: false,
    },
];

export const deliveryTimes = [
    {
        displayName: 'Anytime',
        disabled: null,
        value: 'Anytime',
        selected: false,
    },
    {
        displayName: 'Afternoon',
        disabled: null,
        value: 'Afternoon',
        selected: false,
    },
    {
        displayName: 'Special Request',
        disabled: null,
        value: 'Special Request',
        selected: false,
    },
    {
        displayName: 'Morning',
        disabled: null,
        value: 'Morning',
        selected: false,
    },
];
export const shippingMethods = [
    {
        displayName: 'Pick Up In Store',
        disabled: null,
        value: 'Pick_up',
        selected: true,
    },
    {
        displayName: 'Shipping To Address',
        disabled: null,
        value: 'Ship_to',
        selected: false,
    },
];

export const states = [
    {
        displayName: 'Alaska',
        disabled: null,
        value: 'AK',
        selected: false,
    },
    {
        displayName: 'Alabama',
        disabled: null,
        value: 'AL',
        selected: false,
    },
    {
        displayName: 'Arkansas',
        disabled: null,
        value: 'AR',
        selected: false,
    },
    {
        displayName: 'Arizona',
        disabled: null,
        value: 'AZ',
        selected: false,
    },
    {
        displayName: 'California',
        disabled: null,
        value: 'CA',
        selected: false,
    },
    {
        displayName: 'Colorado',
        disabled: null,
        value: 'CO',
        selected: false,
    },
    {
        displayName: 'Connecticut',
        disabled: null,
        value: 'CT',
        selected: false,
    },
    {
        displayName: 'District of Columbia',
        disabled: null,
        value: 'DC',
        selected: false,
    },
    {
        displayName: 'Delaware',
        disabled: null,
        value: 'DE',
        selected: false,
    },
    {
        displayName: 'Florida',
        disabled: null,
        value: 'FL',
        selected: false,
    },
    {
        displayName: 'Georgia',
        disabled: null,
        value: 'GA',
        selected: false,
    },
    {
        displayName: 'Hawaii',
        disabled: null,
        value: 'HI',
        selected: false,
    },
    {
        displayName: 'Iowa',
        disabled: null,
        value: 'IA',
        selected: false,
    },
    {
        displayName: 'Idaho',
        disabled: null,
        value: 'ID',
        selected: false,
    },
    {
        displayName: 'Illinois',
        disabled: null,
        value: 'IL',
        selected: false,
    },
    {
        displayName: 'Indiana',
        disabled: null,
        value: 'IN',
        selected: false,
    },
    {
        displayName: 'Kansas',
        disabled: null,
        value: 'KS',
        selected: false,
    },
    {
        displayName: 'Kentucky',
        disabled: null,
        value: 'KY',
        selected: false,
    },
    {
        displayName: 'Louisiana',
        disabled: null,
        value: 'LA',
        selected: false,
    },
    {
        displayName: 'Massachusetts',
        disabled: null,
        value: 'MA',
        selected: false,
    },
    {
        displayName: 'Maryland',
        disabled: null,
        value: 'MD',
        selected: false,
    },
    {
        displayName: 'Maine',
        disabled: null,
        value: 'ME',
        selected: false,
    },
    {
        displayName: 'Michigan',
        disabled: null,
        value: 'MI',
        selected: false,
    },
    {
        displayName: 'Minnesota',
        disabled: null,
        value: 'MN',
        selected: false,
    },
    {
        displayName: 'Missouri',
        disabled: null,
        value: 'MO',
        selected: false,
    },
    {
        displayName: 'Mississippi',
        disabled: null,
        value: 'MS',
        selected: false,
    },
    {
        displayName: 'Montana',
        disabled: null,
        value: 'MT',
        selected: false,
    },
    {
        displayName: 'North Carolina',
        disabled: null,
        value: 'NC',
        selected: false,
    },
    {
        displayName: 'North Dakota',
        disabled: null,
        value: 'ND',
        selected: false,
    },
    {
        displayName: 'Nebraska',
        disabled: null,
        value: 'NE',
        selected: false,
    },
    {
        displayName: 'New Hampshire',
        disabled: null,
        value: 'NH',
        selected: false,
    },
    {
        displayName: 'New Jersey',
        disabled: null,
        value: 'NJ',
        selected: false,
    },
    {
        displayName: 'New Mexico',
        disabled: null,
        value: 'NM',
        selected: false,
    },
    {
        displayName: 'Nevada',
        disabled: null,
        value: 'NV',
        selected: false,
    },
    {
        displayName: 'New York',
        disabled: null,
        value: 'NY',
        selected: false,
    },
    {
        displayName: 'Ohio',
        disabled: null,
        value: 'OH',
        selected: false,
    },
    {
        displayName: 'Oklahoma',
        disabled: null,
        value: 'OK',
        selected: false,
    },
    {
        displayName: 'Oregon',
        disabled: null,
        value: 'OR',
        selected: false,
    },
    {
        displayName: 'Pennsylvania',
        disabled: null,
        value: 'PA',
        selected: false,
    },
    {
        displayName: 'Rhode Island',
        disabled: null,
        value: 'RI',
        selected: false,
    },
    {
        displayName: 'South Carolina',
        disabled: null,
        value: 'SC',
        selected: false,
    },
    {
        displayName: 'South Dakota',
        disabled: null,
        value: 'SD',
        selected: false,
    },
    {
        displayName: 'Tennessee',
        disabled: null,
        value: 'TN',
        selected: false,
    },
    {
        displayName: 'Texas',
        disabled: null,
        value: 'TX',
        selected: false,
    },
    {
        displayName: 'Utah',
        disabled: null,
        value: 'UT',
        selected: false,
    },
    {
        displayName: 'Virginia',
        disabled: null,
        value: 'VA',
        selected: false,
    },
    {
        displayName: 'Vermont',
        disabled: null,
        value: 'VT',
        selected: false,
    },
    {
        displayName: 'Washington',
        disabled: null,
        value: 'WA',
        selected: false,
    },
    {
        displayName: 'Wisconsin',
        disabled: null,
        value: 'WI',
        selected: false,
    },
    {
        displayName: 'West Virginia',
        disabled: null,
        value: 'WV',
        selected: false,
    },
    {
        displayName: 'Wyoming',
        disabled: null,
        value: 'WY',
        selected: false,
    },
];
export const expressDeliveryTimes = [
    {
        displayName: '8 AM',
        disabled: false,
        value: '8',
        selected: false,
    },
    {
        displayName: '9 AM',
        disabled: false,
        value: '9',
        selected: false,
    },
    {
        displayName: '10 AM',
        disabled: false,
        value: '10',
        selected: false,
    },
    {
        displayName: '11 AM',
        disabled: false,
        value: '11',
        selected: false,
    },
    {
        displayName: '12 PM',
        disabled: false,
        value: '12',
        selected: false,
    },
    {
        displayName: '1 PM',
        disabled: false,
        value: '13',
        selected: false,
    },
    {
        displayName: '2 PM',
        disabled: false,
        value: '14',
        selected: false,
    },
    {
        displayName: '3 PM',
        disabled: false,
        value: '15',
        selected: false,
    },
    {
        displayName: '4 PM',
        disabled: false,
        value: '16',
        selected: false,
    },
];

export module ShippingResponseExamples {
    export const ex: GetOrderShippingInfoResponse = {
        deliveryTimes: deliveryTimes,
        instructions: null,
        expressDeliveryTimes: expressDeliveryTimes,
        deliveryTime: null,
        shippingMethod: 'Pick Up In Store',
        branchAddress: {
            country: null,
            phoneNumber: '7203029965',
            address3: null,
            address2: '14200 E MONCRIEFF PLACE',
            branchNumber: null,
            city: 'AURORA',
            address1: 'BEACON BUILDING PRODUCTS',
            displayName: 'DENVER HUB BRANCH',
            postalCode: '80011-1647',
            stateValue: 'CO',
            state: 'Colorado',
        },
        shippingMethodValue: 'Pick_up',
        deliveryOptions: deliveryOptions,
        addressBooks: [
            {
                contactInfo: null,
                displayName: '0506 test',
                messageCode: null,
                shippingAddress: null,
                id: '185115332',
                message: null,
                messageMap: null,
            },
            {
                contactInfo: null,
                displayName: 'Test,registerNow',
                messageCode: null,
                shippingAddress: null,
                id: '193542260',
                message: null,
                messageMap: null,
            },
        ],
        shippingAddress: {
            lastName: null,
            address3: null,
            address2: null,
            city: null,
            address1: null,
            nickName: null,
            postalCode: null,
            stateValue: null,
            countries: [
                {
                    displayName: 'United States',
                    disabled: null,
                    value: null,
                    selected: true,
                },
            ],
            addressBookId: null,
            states: states,
            firstName: null,
            phoneNumber: null,
            countryValue: null,
        },
        deliveryOptionValue: 'scheduled',
        deliveryDate: '',
        addressBook: null,
        deliveryOption: 'Schedule Delivery Or Pick-Up',
        shippingMethods: shippingMethods,
    };

    export const ex1: GetOrderShippingInfoResponse = {
        deliveryTimes: deliveryTimes,
        instructions: null,
        expressDeliveryTimes: expressDeliveryTimes,
        deliveryTime: null,
        shippingMethod: 'Pick Up In Store',
        branchAddress: {
            country: null,
            phoneNumber: '7203029965',
            address3: null,
            address2: '14200 E MONCRIEFF PLACE',
            branchNumber: null,
            city: 'AURORA',
            address1: 'BEACON BUILDING PRODUCTS',
            displayName: '',
            postalCode: '80011-1647',
            stateValue: 'CO',
            state: 'Colorado',
        },
        shippingMethodValue: 'Pick_up',
        deliveryOptions: deliveryOptions,
        addressBooks: [
            {
                contactInfo: null,
                displayName: '0506 test',
                messageCode: null,
                shippingAddress: null,
                id: '185115332',
                message: null,
                messageMap: null,
            },
            {
                contactInfo: null,
                displayName: 'Test,registerNow',
                messageCode: null,
                shippingAddress: null,
                id: '193542260',
                message: null,
                messageMap: null,
            },
        ],
        shippingAddress: {
            lastName: null,
            address3: null,
            address2: '14200 E MONCRIEFF PLACE',
            city: 'AURORA',
            address1: 'BEACON BUILDING PRODUCTS',
            nickName: null,
            postalCode: '80011-1647',
            stateValue: 'CO',
            countries: [
                {
                    displayName: 'United States',
                    disabled: null,
                    value: null,
                    selected: true,
                },
            ],
            addressBookId: null,
            states: states,
            firstName: null,
            phoneNumber: '7203029965',
            countryValue: null,
        },
        deliveryOptionValue: 'onHold',
        deliveryDate: '',
        addressBook: null,
        deliveryOption: 'Place Order On Hold',
        shippingMethods: shippingMethods,
    };
}
