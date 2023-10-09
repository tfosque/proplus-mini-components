// This file can be replaced during build by using the `fileReplacements` array.
// The list of file replacements can be found in `angular.json`.
const host = 'localhost';

const apiHost = 'https://dev-static.becn.digital'; // where is this cache service located in GCP
const apiPrefix = '/becn';

const googleMapsApiKey = 'AIzaSyA75YM--h6gCZHztioIkWI76_FspRUHXOc';
const mapUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${googleMapsApiKey}&`;

export const environment = {
    // Begin of spa-sdk configuration
    brxmEndpoint: 'http://localhost:8080/site/resourceapi',
    brxmApiOrigin: 'http://localhost:8080',
    brxmApiBaseUrl: 'http://localhost:8080/site/resourceapi/',
    brxmSpaOrigin: 'http://localhost:4200',
    brxmSpaBaseUrl: '/',
    brxmSiteUrl: 'https://dev-site.becn.digital/site/',
    // End of spa-sdk configuration

    hasMultiTenantSupport: undefined,
    production: false,
    devServer: false,
    uatServer: false,
    prodServer: false,
    local: true,
    hippoRootProto: 'http',
    hippoRootUrl: host,
    hippoCmsRootUrl: host,
    hippoSpaRootUrl: `${host}:4200`,
    hippoRootPort: '8080',
    hippoSitePrefix: 'site',
    cacheServiceRoot: `${apiHost}`,
    beaconServiceUri: `${apiPrefix}/rest/model/REST/NewRestService/v3/rest/com/becn`,
    beaconV1ServiceUri: `${apiHost}${apiPrefix}/rest/model/REST/NewRestService/v1/rest/com/becn`,
    beaconV2ServiceUri: `${apiHost}${apiPrefix}/rest/model/REST/NewRestService/v2/rest/com/becn`,
    imageServiceUri: '/insecure/plain/',
    mapUrl: mapUrl,
    blogApiPath: 'https://beacon-api-x7xzzdp35a-uk.a.run.app/api/beacon-bits',
    // addressValidationRoot: `http://localhost:3000/api/address-validation`, // TODO 
    addressValidationRoot: `https://beacon-api-x7xzzdp35a-uk.a.run.app/api/address-validation`,
    timezoneUrl: `https://maps.googleapis.com/maps/api/timezone/json?key=${googleMapsApiKey}&`,
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
