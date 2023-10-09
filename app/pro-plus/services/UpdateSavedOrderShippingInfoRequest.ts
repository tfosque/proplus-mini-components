import { Record, String, Static, Literal } from 'runtypes';

export const ContactInfo = Record({
    firstName: String, // .withConstraint(s => s.length > 0 || 'First name is required'),
    lastName: String,
    nickName: String,
    phoneNumber: String,
});

export type ContactInfo = Static<typeof ContactInfo>;

export const ShippingAddress = Record({
    displayName: String,
    address1: String,
    address2: String,
    address3: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
});

export type ShippingAddress = Static<typeof ShippingAddress>;

export const UpdateSavedOrderShippingInfoRequest = Record({
    orderId: String,
    deliveryOption: Literal('scheduled').Or(Literal('onHold')),
    deliveryDate: String,
    deliveryTime: String,
    shippingMethod: Literal('Pick_up').Or(Literal('Ship_to')),
    shippingAddress: ShippingAddress,
    branchName: String,
    contactInfo: ContactInfo,
    instructions: String,
}).withConstraint((r) => {
    const errorMsg: string[] = [];
        if (r.deliveryOption === 'scheduled') {
            const type =
                r.shippingMethod === 'Pick_up' ? 'Pick-up' : 'Delivery';
            if (!r.deliveryDate || r.deliveryDate.length <= 0) {
                errorMsg.push(`${type} date is required`);
            }
            if (!r.deliveryTime || r.deliveryTime.length <= 0) {
                errorMsg.push(`${type} time is required`);
            }
        }
        if (r.shippingMethod === 'Ship_to') {
            if (!r.shippingAddress) {
                return 'Shipping address is required';
            }
            const sa = r.shippingAddress;
            const c = r.contactInfo;
            if (sa.address1.length <= 0) {
                errorMsg.push('Address 1 is required');
            }
            if (sa.city.length <= 0) {
                errorMsg.push('City is required');
            }
            if (!c.lastName || c.lastName.length <= 0) {
                errorMsg.push('Last name is required');
            }
            if (sa.state.length <= 0) {
                errorMsg.push('State is required');
            }
            if (sa.postalCode.length <= 0) {
                errorMsg.push('Postal code is required');
            } else if (!sa.postalCode.match(/^\d{5}$|^\d{5}-\d{4}$/)) {
                errorMsg.push('Postal code is invalid. Should be numeric characters and formatted in either XXXXX-XXXX or XXXXX.')
            }
            if (c.phoneNumber.length <= 0) {
                errorMsg.push('Phone number is required');
            } else if (!c.phoneNumber.match(/^(\d{3})\-*(\d{3})\-*(\d{4})$/)) {
                errorMsg.push('Phone number is invalid. Should be 10 numeric characters.');
            }
        }
        if (errorMsg.length > 0) {
            return errorMsg.join("\n");
        }
        return true;
});

export type UpdateSavedOrderShippingInfoRequest = Static<
    typeof UpdateSavedOrderShippingInfoRequest
>;
