import {
    LocationsService,
    BranchWithLocation,
} from '../../../services/locations.service';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { flatMap, debounceTime, map } from 'rxjs/operators';

export interface LocationMarker extends BranchWithLocation {
    label: string;
}
export class LocationPicker {
    public readonly addressOrZip: BehaviorSubject<string>;
    public readonly center$ = new BehaviorSubject<{
        latitude: number;
        longitude: number;
        range: number;
    } | null>(null);
    locations$: Observable<LocationMarker[]>;

    public zipSearch = '';
    public get range() {
        return this._range;
    }
    public set range(newRange: number) {
        this._range = newRange;
        // tslint:disable-next-line: no-floating-promises
        this.setZipCode();
    }
    constructor(
        public readonly locationsService: LocationsService,
        private _range: number = 25,
        public latitude = 0,
        public longitude = 0,
        public zoom = 9,
        public maxZoom = 20,
        public fitBounds = false
    ) {
        this.addressOrZip = new BehaviorSubject('');

        this.addressOrZip.subscribe(async (address) => {
            this.zipSearch = address;
            if (!address || address.length < 5) {
                return;
            }
            const loc = await this.locationsService
                .getGeoLocationFromAddress(address)
                .toPromise();
            if (!loc) {
                return;
            }
            this.center$.next({
                latitude: loc.lat,
                longitude: loc.lng,
                range: this.range,
            });
        });

        const basicCharCode = 'A'.charCodeAt(0);

        const locations = this.center$.pipe(
            debounceTime(500),
            flatMap((geoLocation) => {
                if (!geoLocation) {
                    return from([]);
                }
                this.latitude = geoLocation.latitude;
                this.longitude = geoLocation.longitude;
                const locationRequest = {
                    lat: geoLocation.latitude,
                    lng: geoLocation.longitude,
                    range: this.range,
                };
                return this.locationsService
                    .getLocationsFromLatLong(locationRequest)
                    .pipe(
                        map((branches) => {
                            return branches
                                .filter((b, i) => i < 26)
                                .map((b, i) => ({
                                    ...b,
                                    label: String.fromCharCode(
                                        basicCharCode + i
                                    ),
                                }));
                        })
                    );
            })
        );

        this.locations$ = locations;
    }

    // public mapCenterChange(evt: google.maps.LatLngLiteral) {
    public mapCenterChange(evt: any) {
        this.center$.next({
            latitude: evt.lat,
            longitude: evt.lng,
            range: this.range,
        });
    }
    // public boundsChange(evt: google.maps.LatLngBounds) {
    public boundsChange(evt: any) {
        // console.log('boundsChange', evt);
    }
    public zoomChange(evt: number) {
        // console.log('zoomChange', evt);
    }
    public async setZipCode(newZipCode?: string) {
        newZipCode = newZipCode || this.zipSearch;
        if (newZipCode && newZipCode.length > 0) {
            this.addressOrZip.next(newZipCode);
        }
    }
}
