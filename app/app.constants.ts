import { environment } from '../environments/environment';
// Store any app-wide constants here.

//  TODO:  Use different keys for each Google API key restricted to Maps
export const googleMapsApiKey = 'AIzaSyAqlMMlGIK5EMhfSwmIBdWpt-qH_2FVQv8';
export const siteRoot = `${environment.hippoRootProto}://${environment.hippoSpaRootUrl}`;
export const categoriesKey = 'Categories';
export const isProductHeader = 'Is-Product-Page';
export const productIdHeader = 'Product-ID';
export const itemNumberHeader = 'Item-Number';
export const beaconServiceRoot = `${environment.cacheServiceRoot}${environment.beaconServiceUri}`;
