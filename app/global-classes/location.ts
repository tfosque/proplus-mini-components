/**
 * Class that should for any location objecs returned from the server
 */
export class Location {
    constructor(
        public title: string,
        public addressLine1: string,
        public addressLine2: string,
        public monFriStoreHours: string,
        public satSunStoreHours: string,
        public productsSold: string[],
        public storeName: string,
        public distance: string,
        public phoneNumber: string,
        public latitude: number,
        public longitude: number,
        public url: string,
    ) {}

    /**
     * Attempt to separate the close time from the hours string based on the current day local to the browser.
     * If weekday, Mon-Fri hours.  If weekend Sat-Sun hours.
     */
    getCloseTime(): string {
        const curDate = new Date();
        const day = curDate.getDay();

        // Assumes format of "9:00 AM - 7:00 PM"
        if (day === 0 || (day === 6 && this.satSunStoreHours)) {
            const timeParts = this.satSunStoreHours.split('-');
            if (timeParts && timeParts.length > 1) {
                let closingTime = timeParts[1].trim();

                if (closingTime.includes(':00')) {
                    closingTime = closingTime.replace(':00', '');
                }

                return closingTime;
            }

            return '';
        } else if (this.monFriStoreHours) {
            const timeParts = this.monFriStoreHours.split('-');

            if (timeParts && timeParts.length > 1) {
                let closingTime = timeParts[1].trim();

                if (closingTime.includes(':00')) {
                    closingTime = closingTime.replace(':00', '');
                }

                return closingTime;
            }

            return '';
        }

        return 'Hours not available';
    }

    /**
     * Attempt to separate the open time from the hours string based on the current day local to the browser.
     * If weekday, Mon-Fri hours.  If weekend Sat-Sun hours.
     */
    getOpenTime(): string {
        const curDate = new Date();
        const day = curDate.getDay();

        // Assumes format of "9:00 AM - 7:00 PM"
        if (day === 0 || (day === 6 && this.satSunStoreHours)) {
            const timeParts = this.satSunStoreHours.split('-');
            if (timeParts && timeParts.length > 1) {
                let openTime = timeParts[0].trim();

                if (openTime.includes(':00')) {
                    openTime = openTime.replace(':00', '');
                }

                return openTime;
            }

            return '';
        } else if (this.monFriStoreHours) {
            const timeParts = this.monFriStoreHours.split('-');

            if (timeParts && timeParts.length > 1) {
                let openTime = timeParts[0].trim();

                if (openTime.includes(':00')) {
                    openTime = openTime.replace(':00', '');
                }

                return openTime;
            }

            return '';
        }

        return 'Hours not available';
    }
}
