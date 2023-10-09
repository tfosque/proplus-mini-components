export const environment = {
    // Begin of spa-sdk configuration
    brxmEndpoint: 'https://site.becn.com/site/resourceapi',
    brxmApiOrigin: 'https://cms.becn.com',
    brxmApiBaseUrl: 'https://site.becn.com/site/resourceapi/',
    brxmSpaOrigin: 'https://www.becn.com',
    brxmSpaBaseUrl: '/',
    brxmSiteUrl: 'https://site.becn.com/site/',
    // End of spa-sdk configuration

    production: true,
    devServer: false,
    uatServer: false,
    prodServer: true,
    local: false,
    hippoRootProto: 'https',
    hippoRootUrl: 'site.becn.com',
    hippoCmsRootUrl: 'cms.becn.com',
    hippoSpaRootUrl: 'site.becn.com',
    hippoRootPort: '443',
    hippoSitePrefix: 'site',
    cacheServiceRoot: 'https://static.becn.com',
    beaconServiceUri: '/becn/rest/model/REST/NewRestService/v3/rest/com/becn',
    beaconV1ServiceUri:
        'https://static.becn.com/becn/rest/model/REST/NewRestService/v1/rest/com/becn',
    beaconV2ServiceUri:
        'https://static.becn.com/becn/rest/model/REST/NewRestService/v2/rest/com/becn',
    imageServiceUri: '/insecure/plain/',
    mapUrl: '/api/location?',
    blogApiPath: '/api/beacon-bits',
    addressValidationRoot: `/api/address-validation`,
    timezoneUrl: '/api/timezone?',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
