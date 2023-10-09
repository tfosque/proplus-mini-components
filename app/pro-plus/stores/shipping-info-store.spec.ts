import moment from 'moment';
import { canPickExpress, getMinimumHour } from './shipping-info-store';

// import { createShippingStore, toDate, getShippingAddress } from './shipping-info-store';
// import { ShippingResponseExamples } from './shipping.examples';
// import { GetOrderShippingInfoResponse } from '../../../services/GetOrderShippingInfoResponse';
// import { AddressBookExamples } from '../../../model/address-book-response.example';

xdescribe('Time selection works', () => {
    it('Test', async () => {
        await expect(canPickExpress(moment('2020-10-22'), '2020-10-27')).toBe(
            true
        );
        await expect(canPickExpress(moment('2020-10-22'), '2020-10-28')).toBe(
            false
        ); // 6 day
        // Today is monday, Thursday should display express hours
        await expect(canPickExpress(moment('2020-10-26'), '2020-10-29')).toBe(
            true
        );
        // Today is monday, Friday should not
        await expect(canPickExpress(moment('2020-10-26'), '2020-10-30')).toBe(
            false
        ); // 4 days
    });

    it('Fail Test', async () => {
        const timeOffset = -4 * 60 * 60; // Assume EDT0
        console.log({ timeOffset });

        await expect(testHour(`10:00:00`)).toBe(11);
        await expect(testHour(`10:20:00`)).toBe(12);
        await expect(testHour(`10:30:00`)).toBe(12);
        await expect(testHour(`10:50:00`)).toBe(12);
        await expect(testHour(`11:01:00`)).toBe(13);

        // no past 4pm
        // earliest hour is 8am

        function testHour(hour: string) {
            const now = new Date(`December 10, 2020 ${hour} (EDT)`);
            const currentDate = new Date(2020, 11, 10);
            return getMinimumHour(now, currentDate, timeOffset);
        }
    });
});

// fdescribe('Shipping Info Store', () => {

//     const ex1 = ShippingResponseExamples.ex;
//     const addressbook = AddressBookExamples.response1;

//     it('Setting scheduled time', async () => {

//         const store = createShippingStore();
//         const dispatch = store.dispatch;
//         const scheduledDate = toDate('08-19-2020');
//         dispatch.emptyForm(true)
//             .setScheduledOption('scheduled')
//             .setScheduledDate(scheduledDate)
//             .setScheduledTime('8');

//         const value = store.value;
//         await expect(value.deliveryDate).toBe(scheduledDate);
//         await expect(value.deliveryTime).toBe('8');
//         await expect(value.scheduledOptionValue).toBe('scheduled');
//     });

//     it('Loading an example should provide available pickup times', async () => {
//         const store = getLoadedStore(ex1);

//         // Verify we have delivery and express times
//         await expect(ex1.deliveryTimes.length).toBeGreaterThan(0);
//         await expect(ex1.expressDeliveryTimes.length).toBeGreaterThan(0);

//         // Verify the delivery times and the express times are the correct types of times
//         await expect(ex1.deliveryTimes.map(t => t.value)).toContain('Morning');
//         await expect(ex1.expressDeliveryTimes.map(t => t.value)).toContain('8');

//         await expect(store.value.availablePickupTimes.length).toBeGreaterThan(0);
//     });

//     it('should provide numeric hours when pick up is selected', async () => {
//         const store = getLoadedStore(ex1);
//         store.dispatch.setShippingMethod('Pick_up');
//         await expect(store.value.availablePickupTimes.map(t => t.value)).toContain('8');
//     });

//     it('Should provide times of day when ship two is selected', async () => {
//         const store = getLoadedStore(ex1);
//         store.dispatch.setShippingMethod('Ship_to');
//         await expect(store.value.availablePickupTimes.map(t => t.value)).toContain('Morning');
//     });

//     it('Should provided addresses when loaded', async () => {
//         const store = getLoadedStore(ex1);

//         await expect(store.value.addressBooks.length).toBeGreaterThan(0);
//     });

//     it('Should set the shipping address to blank when set to null', async () => {
//         const emptyAddress = {
//             address1: '', city: '', stateValue: '', postalCode: '',
//             phoneNumber: '', branchName: '', addressBookId: '', nickName: '',
//             firstName: '', lastName: '', address2: '', address3: '', countryValue: ''
//         };

//         const store = getLoadedStore(ex1);

//         store.dispatch.setAddressBook(null);
//         await expect(store.value.shippingAddress).toEqual(emptyAddress);
//         store.dispatch.setAddressBook(undefined);
//         await expect(store.value.shippingAddress).toEqual(emptyAddress);
//     });

//     it('Should set the shipping address to blank when set to null', async () => {
//         const entry1 = addressbook.addressBooks[0];
//         const store = getLoadedStore(ex1);

//         store.dispatch.setAddressBook(entry1);
//         const a = getShippingAddress(entry1);
//         await expect(store.value.shippingAddress).toEqual(a);
//     });

//     function getLoadedStore(ex: GetOrderShippingInfoResponse) {
//         const store = createShippingStore();
//         store.dispatch.load(ex).loadAddressBooks(addressbook.addressBooks);
//         return store;
//     }
// });

export function print<T>(state: T) {
    // tslint:disable-next-line: no-console
    console.log(JSON.stringify(state, null, 2));
}
