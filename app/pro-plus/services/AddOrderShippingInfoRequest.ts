import {
    Record,
    String,
    Static,
    Literal,
    Boolean,
    Undefined,
    Partial,
} from 'runtypes';

export const ScheduledOrder = Record({
    deliveryOptionValue: Literal('scheduled'),
    deliveryDate: String.withConstraint(
        (t) => t.length > 0 || 'Delivery date is required'
    ),
    deliveryTime: String.withConstraint(
        (t) => t.length > 0 || 'Delivery time is required'
    ),
});

export const OnHoldOrder = Record({
    deliveryOptionValue: Literal('onHold'),
});

export const SchedulingOption = ScheduledOrder.Or(OnHoldOrder);
export type SchedulingOption = Static<typeof SchedulingOption>;
export type ScheduledOrder = Static<typeof ScheduledOrder>;
export type OnHoldOrder = Static<typeof OnHoldOrder>;

export const PickupAddress = Record({
    address1: String,
    city: String,
    stateValue: String,
    postalCode: String,
    phoneNumber: String,
});
export type PickupAddress = Static<typeof PickupAddress>;

export const PickupOrder = Record({
    shippingMethodValue: Literal('Pick_up'),
    changeShippingAddressLocation: Boolean,
    shippingAddress: PickupAddress,
});

export const ShippingAddress = PickupAddress.And(
    Partial({
        branchName: String,
        addressBookId: String,
        nickName: String,
        firstName: String,
        lastName: String,
        address2: String,
        address3: String,
        countryValue: String,
    })
);

export type ShippingAddress = Static<typeof ShippingAddress>;

export const ShippedOrder = Record({
    shippingMethodValue: Literal('Ship_to'),
    shippingAddress: ShippingAddress.Or(Undefined),
    changeShippingAddressLocation: Boolean,
    saveShippingAddressToAddressBook: Boolean,
});
export type ShippedOrder = Static<typeof ShippedOrder>;
export const DeliveryOption = PickupOrder.Or(ShippedOrder);
export type DeliveryOption = PickupOrder | ShippedOrder;

export const Instructions = Record({
    specialInstruction: String,
});

export type Instructions = Static<typeof Instructions>;

export const AddOrderShippingInfoRequest = Record({
    deliveryOptionValue: Literal('onHold').Or(Literal('scheduled')), // scheduled
    shippingMethodValue: Literal('Pick_up').Or(Literal('Ship_to')), // Pick_up
    specialInstruction: String, // Test
})
    .And(
        Partial({
            deliveryDate: String, // 07-23-2020
            deliveryTime: String, // 8
            changeShippingAddressLocation: Boolean, // false
            saveShippingAddressToAddressBook: Boolean,
            shippingAddress: ShippingAddress, // ...object...
        })
    )
    .withConstraint((r) => {
        const errorMsg: string[] = [];
        if (r.deliveryOptionValue === 'scheduled') {
            const type =
                r.shippingMethodValue === 'Pick_up' ? 'Pick-up' : 'Delivery';
            if (!r.deliveryDate || r.deliveryDate.length <= 0) {
                errorMsg.push(`${type} date is required`);
            }
            if (!r.deliveryTime || r.deliveryTime.length <= 0) {
                errorMsg.push(`${type} time is required`);
            }
        }
        if (r.shippingMethodValue === 'Ship_to') {
            if (!r.shippingAddress) {
                return 'Shipping address is required';
            }
            const sa = r.shippingAddress;
            if (sa.address1.length <= 0) {
                errorMsg.push('Address 1 is required');
            }
            if (sa.city.length <= 0) {
                errorMsg.push('City is required');
            }
            if (!sa.lastName || sa.lastName.length <= 0) {
                errorMsg.push('Last name is required');
            }
            if (sa.stateValue.length <= 0) {
                errorMsg.push('State is required');
            }
            if (sa.postalCode.length <= 0) {
                errorMsg.push('Postal code is required');
            } else if (!sa.postalCode.match(/^\d{5}$|^\d{5}-\d{4}$/)) {
                errorMsg.push('Postal code is invalid. Should be numeric characters and formatted in either XXXXX-XXXX or XXXXX.')
            }
            if (sa.phoneNumber.length <= 0) {
                errorMsg.push('Phone number is required');
            } else if (!sa.phoneNumber.match(/^(\d{3})\-*(\d{3})\-*(\d{4})$/)) {
                errorMsg.push('Phone number is invalid. Should be 10 numeric characters.');
            }
        }
        if (r.specialInstruction.length > 234) {
            errorMsg.push('Order notes exceed character limit of 234 characters.');
        }
        if (errorMsg.length > 0) {
            return errorMsg.join("\n");
        }
        return true;
    });

export type AddOrderShippingInfoRequest = Static<
    typeof AddOrderShippingInfoRequest
>;
export type PickupOrder = Static<typeof PickupOrder>;

// export module Examples {

//     const delTime = moment(Date.now()).format('MM-DD-YYYY');
//     export const pickupAddress: PickupAddress = {
//         address1: '1 Address Lane',
//         city: 'Cityville',
//         stateValue: 'TX',
//         postalCode: '12345',
//         phoneNumber: '1234567890',
//     };

//     export const shippingAddress: ShippingAddress = {
//         branchName: '',
//         addressBookId: '',
//         nickName: '',
//         firstName: '',
//         lastName: '',
//         countryValue: '',
//         phoneNumber: '7203029965',
//         address1: 'BEACON BUILDING PRODUCTS',
//         address2: '14201 E MONCRIEFF PLACE',
//         address3: '',
//         city: 'AURORA',
//         stateValue: 'CO',
//         postalCode: '80011-1647',
//     };

//     export const exampleSchedulingOptions: SchedulingOption[] = [
//         {
//             deliveryOptionValue: 'onHold',
//         },
//         {
//             deliveryOptionValue: 'scheduled',
//             deliveryDate: delTime,
//             deliveryTime: '9'
//         },
//         {
//             deliveryOptionValue: 'scheduled',
//             deliveryDate: delTime,
//             deliveryTime: '14'
//         }
//     ];
//     export const exampleDeliveryOptions: DeliveryOption[] = [
//         {
//             shippingMethodValue: 'Pick_up',
//             changeShippingAddressLocation: false,
//             shippingAddress: Examples.pickupAddress,
//         },
//         {
//             shippingMethodValue: 'Ship_to',
//             saveShippingAddressToAddressBook: false,
//             changeShippingAddressLocation: false,
//             shippingAddress: Examples.shippingAddress
//         }
//     ];

//     // export let requests = (function () {
//     //     const result: AddOrderShippingInfoRequest[] = [];
//     //     {
//     //         for (const d of exampleDeliveryOptions) {
//     //             for (const s of exampleSchedulingOptions) {
//     //                 const r: AddOrderShippingInfoRequest = {
//     //                     ...d,
//     //                     ...s,
//     //                     specialInstruction: '',
//     //                 };
//     //                 result.push(r);
//     //             }
//     //         }
//     //     }
//     //     return result;
//     // })();

//     export const examples: AddOrderShippingInfoRequestV2[] = [
//         {
//             'deliveryOptionValue': 'SCHEDULED',
//             'deliveryDate': '08-20-2020',
//             'deliveryTime': '13',
//             'shippingMethodValue': 'PICK_UP',
//             'changeShippingAddressLocation': true,
//             'shippingAddress': {
//                 'branchName': 'a',
//                 'address1': 'b',
//                 'city': 'c',
//                 'stateValue': 'LA',
//                 'postalCode': 11111,
//                 'phoneNumber': 1234567890
//             },
//             'specialInstruction': 'a'
//         },
//         {
//             'deliveryOptionValue': 'ONHOLD',
//             'shippingMethodValue': 'SHIP_TO',
//             'shippingAddress': {
//                 'nickName': '1',
//                 'firstName': '2',
//                 'lastName': '3',
//                 'address1': '4',
//                 'address2': '5',
//                 'city': '6',
//                 'stateValue': 'AK',
//                 'postalCode': 11111,
//                 'countryValue': '8',
//                 'phoneNumber': 1234567890
//             },
//             'specialInstruction': 'a'
//         },
//         {
//             'deliveryOptionValue': 'onHold',
//             'shippingMethodValue': 'SHIP_TO',
//             'shippingAddress': {
//                 'addressBookId': '41840007',
//                 'nickName': 'asdasdas',
//                 'firstName': '2',
//                 'lastName': '3',
//                 'address1': '4',
//                 'address2': '5',
//                 'city': '6',
//                 'stateValue': 'AK',
//                 'postalCode': 11111,
//                 'countryValue': '8',
//                 'phoneNumber': 1234567890
//             },
//             'saveShippingAddressToAddressBook': true,
//             'specialInstruction': 'a'
//         }
//     ];

// }
