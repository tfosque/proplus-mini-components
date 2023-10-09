import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceUrls } from '../enums/service-urls.enum';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Location } from '../global-classes/location';
import { map, flatMap, distinct, toArray, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ProPlusApiBase } from '../pro-plus/services/pro-plus-api-base.service';
import { UserService } from '../pro-plus/services/user.service';

interface TitledRecord {
    title: string;
}

@Injectable({
    providedIn: 'root',
})
export class LocationsService {
    //  Cache geolocations locally
    private readonly addressLocationCache = new Map<
        string,
        { lat: number; lng: number } | null
    >();
    private readonly latlngToGeoLocationCache = new Map<
        string,
        GeoLocationResult | null
    >();
    private readonly _locationsSubj: BehaviorSubject<Location[]> =
        new BehaviorSubject<Location[]>([]);
    locations$ = this._locationsSubj.asObservable();
    private readonly _loadingSubj: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(true);
    loading$ = this._loadingSubj.asObservable();
    facetsArray: string[] = [];
    private readonly _searchLocationSubj: BehaviorSubject<string> =
        new BehaviorSubject('');
    searchLocation$ = this._searchLocationSubj.asObservable();
    private readonly _availableFacetsSubj: BehaviorSubject<TitledRecord[]> =
        new BehaviorSubject<TitledRecord[]>([]);
    availableFacetSubj$ = this._availableFacetsSubj.asObservable();

    // Default value.  Can be overridden by caller.
    range = 25;
    // Coordinates from google api.
    googleLat?: number | null;
    googleLong?: number | null;

    private readonly locationPrefix = environment.hippoSitePrefix
        ? `/${environment.hippoSitePrefix}`
        : '';
    private readonly locationsUrlRoot = `${environment.hippoRootProto}://${environment.hippoRootUrl}:${environment.hippoRootPort}${this.locationPrefix}`;
    allBranches: Promise<Branch[]>;

    // tslint:disable-next-line:max-line-length
    get locationsUrl() {
        return `${this.locationsUrlRoot}${ServiceUrls.hippoRestApi}${ServiceUrls.locations}`;
    }

    constructor(
        private readonly http: HttpClient,
        private readonly api: ProPlusApiBase,
        private readonly userService: UserService
    ) {
        // tslint:disable-next-line: no-floating-promises
        this.allBranches = this.getBranches({ pageNo: 1, pageSize: 10000 });
    }

    /**
     * Update the loading param.
     * @param newValue the new loading value.
     */
    setLoading(newValue: boolean) {
        this._loadingSubj.next(newValue);
    }

    /**
     * Takes in params for locations endpoint and updates the locations$ with the returned data mapped to
     * Location objects.  If necessary also makes a call to the google geocoding api to convert the given address
     * to coordinates.
     * @param searchLocation the center of the search radius.  Plain string to be converted to coordinates by google api.
     * @param geoLat Optional lat param that can be passed from browser location api.  Converted to address by google api.
     * @param geoLong Optional long param that can be passed from browser location api.  Converted to address by google api.
     */
    getLocations(
        searchLocation: string = this._searchLocationSubj.value,
        geoLat?: number,
        geoLong?: number
    ): void {
        /**
         * If there are geoLat and geoLong variables, priortize those and execute reverse geocode lookup with google api to
         * get formatted address.  Else check if there is a new searchLocation string.  If there else, use google api to get
         * coords and then set locations.  Else, just run setLocations.
         */
        if (geoLat && geoLong) {
            this._loadingSubj.next(true);
            this.getGeoLocationFromLatLng(geoLat, geoLong).subscribe(
                (result) => {
                    if (result && result.results && result.results.length) {
                        this._searchLocationSubj.next(
                            result.results[0].formatted_address || ''
                        );
                        this.googleLat = geoLat;
                        this.googleLong = geoLong;

                        this.setLocations(geoLat, geoLong);
                    } else {
                        // If there are no results from google, empty the results array.
                        this.googleLat = null;
                        this.googleLong = null;
                        this._locationsSubj.next([]);
                        this._loadingSubj.next(false);
                    }
                }
            );
        } else if (
            searchLocation &&
            searchLocation !== this._searchLocationSubj.value
        ) {
            this._loadingSubj.next(true);
            this._searchLocationSubj.next(searchLocation);
            this.getGeoLocationFromAddress(searchLocation).subscribe(
                (result) => {
                    if (result) {
                        this.googleLat = result.lat;
                        this.googleLong = result.lng;
                        this.setLocations(result.lat, result.lng);
                    } else {
                        // If there are no results from google, empty the results array.
                        this.googleLat = null;
                        this.googleLong = null;
                        this._locationsSubj.next([]);
                        this._loadingSubj.next(false);
                    }
                }
            );
        } else if (searchLocation) {
            this.updateLocations();
        }
    }

    public async getTimeZoneFromAddress(address: string) {
        const loc = await this.getGeoLocationFromAddress(address).toPromise();
        if (!loc) {
            return null;
        }
        return await this.getTimeZoneFromLatLng(loc.lat, loc.lng).toPromise();
    }

    public getTimeZoneFromLatLng(geoLat: number, geoLong: number) {
        const prefix = environment.timezoneUrl;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const url = `${prefix}location=${geoLat},${geoLong}&timestamp=${timestamp}`;
        return this.http.get<TimezoneResponse>(url);
    }

    private getGeoLocationFromLatLng(geoLat: number, geoLong: number) {
        const mapUrl = environment.mapUrl;
        const latlngPair = `${geoLat},${geoLong}`;
        //  Try fetching from the cache first
        const result = this.latlngToGeoLocationCache.get(latlngPair);
        if (result) {
            return of(result);
        }
        return this.http
            .get<GeoLocationResult>(`${mapUrl}latlng=${latlngPair}`)
            .pipe(
                tap((r) => {
                    this.latlngToGeoLocationCache.set(latlngPair, r);
                })
            );
    }

    public getGeoLocationFromAddress(address: string): Observable<{
        lat: number;
        lng: number;
    } | null> {
        if (!address || !address.trim()) {
            return from([null]);
        }
        //  Try fetching from the cache first
        const location = this.addressLocationCache.get(address);
        if (location) {
            return of(location);
        }
        const mapUrl = environment.mapUrl;
        return this.http
            .get<GeoLocationResult>(
                `${mapUrl}address=${encodeURIComponent(address)}`
            )
            .pipe(
                map((l) => getLocationFromResult(l)),
                tap((l) => {
                    //  Update he cache when the result comes back
                    this.addressLocationCache.set(address, l);
                })
            );
    }

    public async getBranches(req: {
        zipCode?: string;
        city?: string;
        pageSize?: number;
        pageNo?: number;
    }) {
        if (this.userService.isLoggedIn) {
            req.pageNo = req.pageNo || 0;
            req.pageSize = req.pageSize || 21;

            const { ok, body } = await this.api.getV1<BranchListResponse>(
                'branchlist',
                req
            );
            if (!ok || !body) {
                return [];
            }
            return body.branches;
        } else {
            return [];
        }
    }

    /**
     * Given lat and long values attempts to get location results from express api.  Then updates the locationsSubj with those new results
     * after they've been converted to Location objects.
     * @param lat latitude that is the center of the search radius.
     * @param long longitude that is the center of the search radius.
     */
    setLocations(lat: number, long: number) {
        this._loadingSubj.next(true);
        this.facetsArray = [];

        this.getLocationsFromLocation({ lat, long, range: this.range })
            .pipe(
                flatMap(async (results) => {
                    return await removeDuplicateLocations(results);
                }),
                map((response) => {
                    return {
                        items: response.items
                            ? response.items.map(
                                  (
                                      curResult:
                                          | StoreLocation
                                          | StoreLocationDistance
                                  ) => {
                                      return getLocation(curResult);
                                  }
                              )
                            : [],
                        facets: response.facets
                            ? response.facets.map((curFacet: any) => {
                                  return {
                                      title: curFacet,
                                  };
                              })
                            : [],
                    };
                })
            )
            .subscribe((newLocations) => {
                this._locationsSubj.next(newLocations.items);
                this._availableFacetsSubj.next(newLocations.facets);
                this._loadingSubj.next(false);
            });
    }

    // public getLocationsFromAddress(l: { address: string, range: number }) {
    //   return this.getGeoLocationFromAddress(l.address).pipe(
    //     flatMap((loc) => {
    //       if (!loc) { return []; }
    //       return this.getLocationsFromLatLong({ lat: loc.lat, lng: loc.lng, range: l.range });
    //     })
    //   );
    // }

    public getLocationsFromLatLong(loc: {
        lat: number;
        lng: number;
        range: number;
    }) {
        return this.getLocationsFromLocation({
            lat: loc.lat,
            long: loc.lng,
            range: loc.range,
        }).pipe(
            flatMap(async (sl) => {
                const items = sl.items || [];
                return await this.getBranchIds(items);
            })
        );
    }

    private async getBranchIds(locations: StoreLocationDistance[]) {
        const branches = await this.allBranches;
        return locations.flatMap((l) => {
            return branches
                .filter(
                    // b.address could be null in uat api environment (local and dev database)
                    (b) =>
                        b.address &&
                        b.address.postalCode === l.storeLocation.postalcode
                )
                .map((b) => {
                    const { storeLocation, distance } = l;
                    const { latitude, longitude } = storeLocation;
                    // const { address } = b;
                    const res: BranchWithLocation = {
                        ...b,
                        latitude,
                        longitude,
                        distance,
                    };
                    return res;
                });
        });
    }

    public getLocationsFromLocation(l: {
        lat: number;
        long: number;
        range: number;
    }) {
        const facets = (this.facetsArray = []);
        return this.http.get<LocationSearchResult>(
            `${this.locationsUrl}?facets=${facets.join(',')}&lat=${
                l.lat
            }&long=${l.long}&range=${l.range}`
        );
    }

    /**
     * Given lat and long values attempts to get location results from express api.  Then updates the locationsSubj with those new results
     * after they've been converted to Location objects.
     */
    updateLocations() {
        this._loadingSubj.next(true);

        /**
         * If the googleLat and googleLong are not set, no request is required as there are no results.
         */
        if (this.googleLat && this.googleLong) {
            this.http
                .get<LocationSearchResult>(
                    `${this.locationsUrl}?facets=${this.facetsArray.join(
                        ','
                    )}&lat=${this.googleLat}&long=${this.googleLong}&range=${
                        this.range
                    }`
                )
                .pipe(
                    flatMap(async (results) => {
                        return await removeDuplicateLocations(results);
                    }),
                    map((response) => {
                        return {
                            items: response.items
                                ? response.items.map(
                                      (
                                          curResult:
                                              | StoreLocation
                                              | StoreLocationDistance
                                      ) => {
                                          return getLocation(curResult);
                                      }
                                  )
                                : [],
                        };
                    })
                )
                .subscribe((newLocations) => {
                    this._locationsSubj.next(newLocations.items);
                    this._loadingSubj.next(false);
                });
        } else {
            this._locationsSubj.next([]);
            this._loadingSubj.next(false);
        }
    }

    public async getBranchByNumber( branchNumber: String){
        return (await this.allBranches).find((b)=>b.branchNumber == branchNumber);
    
    }
}

async function removeDuplicateLocations(results: LocationSearchResult) {
    const newItems = await from(results.items)
        .pipe(
            distinct(
                (l) =>
                    `${l.storeLocation.name},${l.storeLocation.latitude},${l.storeLocation.longitude},${l.storeLocation.phone}`
            ),
            toArray()
        )
        .toPromise();
    const newResults = { ...results, items: newItems };
    return newResults;
}

function getLocation(curResult: StoreLocation | StoreLocationDistance) {
    const newLocation =
        'distance' in curResult ? curResult.storeLocation : curResult;
    const distance = (
        'distance' in curResult ? curResult.distance : 0
    ).toString();

    if (
        !newLocation.productsSold ||
        !newLocation.productsSold.length ||
        !newLocation.productsSold[0]
    ) {
        newLocation.productsSold = [];
    }
    return new Location(
        newLocation.name,
        newLocation.addressLine1,
        `${newLocation.city}, ${newLocation.state} ${newLocation.postalcode}`,
        newLocation.monFriStoreHours,
        newLocation.satSunStoreHours,
        newLocation.productsSold,
        newLocation.branchname || '',
        distance,
        newLocation.phone,
        newLocation.latitude,
        newLocation.longitude,
        newLocation.url
    );
}

interface LocationSearchResult {
    error: any;
    facets: {
        title: string;
    }[];
    items: StoreLocationDistance[];
}

interface StoreLocationDistance {
    distance: number;
    storeLocation: StoreLocation;
}

export interface StoreLocation {
    addressLine1: string;
    addressLine2: string;
    branchName: string;
    city: string;
    country: string;
    description: string;
    latitude: number;
    longitude: number;
    metakeywords: string;
    monFriStoreHours: string;
    name: string;
    phone: string;
    postalcode: string;
    productsSold: string[] | null;
    satSunStoreHours: string;
    state: string;
    url: string;
    branchname?: string;
}

export interface GeoLocationResult {
    results: {
        formatted_address?: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }[];
}

export interface TimezoneResponse {
    dstOffset: number;
    rawOffset: number;
    status: string;
    timeZoneId: string;
    timeZoneName: string;
}

function getLocationFromResult(geo: GeoLocationResult | null) {
    if (!geo) {
        return null;
    }
    return geo.results && geo.results.length
        ? geo.results[0].geometry.location
        : null;
}

export interface BranchListResponse {
    message: string;
    totalNumRecs: number;
    pageNumRecs: number;
    branches: Branch[];
}

export interface Branch {
    address: Address;
    branchNumber: string;
    branchName: string;
    branchPhone: string;
    branchRegionId: string;
}

export interface BranchWithLocation extends Branch {
    latitude: number;
    longitude: number;
    distance: number;
}

export interface Address {
    postalCode: string;
    state: string;
    address1: string;
    address2: string;
    address3: string;
    country: string;
    city: string;
}

// export function getLocExample() {
// return {
//   'results' : [
//      {
//         'address_components' : [
//            {
//               'long_name' : '11919',
//               'short_name' : '11919',
//               'types' : [ 'street_number' ]
//            },
//            {
//               'long_name' : 'East 37th Avenue',
//               'short_name' : 'E 37th Ave',
//               'types' : [ 'route' ]
//            },
//            {
//               'long_name' : 'Northeast',
//               'short_name' : 'Northeast',
//               'types' : [ 'neighborhood', 'political' ]
//            },
//            {
//               'long_name' : 'Denver',
//               'short_name' : 'Denver',
//               'types' : [ 'locality', 'political' ]
//            },
//            {
//               'long_name' : 'Denver County',
//               'short_name' : 'Denver County',
//               'types' : [ 'administrative_area_level_2', 'political' ]
//            },
//            {
//               'long_name' : 'Colorado',
//               'short_name' : 'CO',
//               'types' : [ 'administrative_area_level_1', 'political' ]
//            },
//            {
//               'long_name' : 'United States',
//               'short_name' : 'US',
//               'types' : [ 'country', 'political' ]
//            },
//            {
//               'long_name' : '80239',
//               'short_name' : '80239',
//               'types' : [ 'postal_code' ]
//            },
//            {
//               'long_name' : '3307',
//               'short_name' : '3307',
//               'types' : [ 'postal_code_suffix' ]
//            }
//         ],
//         'formatted_address' : '11919 E 37th Ave, Denver, CO 80239, USA',
//         'geometry' : {
//            'location' : {
//               'lat' : 39.7682379,
//               'lng' : -104.8493689
//            },
//            'location_type' : 'ROOFTOP',
//            'viewport' : {
//               'northeast' : {
//                  'lat' : 39.76958688029149,
//                  'lng' : -104.8480199197085
//               },
//               'southwest' : {
//                  'lat' : 39.7668889197085,
//                  'lng' : -104.8507178802915
//               }
//            }
//         },
//         'place_id' : 'ChIJCceZsE17bIcR6TPxJHsNl3w',
//         'plus_code' : {
//            'compound_code' : 'Q592+77 Denver, Colorado, United States',
//            'global_code' : '85FQQ592+77'
//         },
//         'types' : [ 'establishment', 'home_goods_store', 'point_of_interest', 'store' ]
//      }
//   ],
//   'status' : 'OK'
// }
// }
