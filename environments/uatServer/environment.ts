export const environment = {
    // Begin of spa-sdk configuration
    brxmEndpoint: 'https://uat-site.becn.digital/site/resourceapi',
    brxmApiOrigin: 'https://uat-cms.becn.digital',
    brxmApiBaseUrl: 'https://uat-site.becn.digital/site/resourceapi/',
    brxmSpaOrigin: 'https://uat.becn.digital',
    brxmSpaBaseUrl: '/',
    brxmSiteUrl: 'https://uat-site.becn.digital/site/',
    // End of spa-sdk configuration

    production: true,
    devServer: false,
    uatServer: true,
    prodServer: false,
    local: false,
    hippoRootProto: 'https',
    hippoRootUrl: 'uat-site.becn.digital',
    hippoCmsRootUrl: 'uat-cms.becn.digital',
    hippoSpaRootUrl: 'uat-site.becn.digital',
    hippoRootPort: '443',
    hippoSitePrefix: 'site',
    cacheServiceRoot: 'https://uat-static.becn.digital',
    beaconServiceUri: '/becn/rest/model/REST/NewRestService/v3/rest/com/becn',
    beaconV1ServiceUri:
        'https://uat-static.becn.digital/becn/rest/model/REST/NewRestService/v1/rest/com/becn',
    beaconV2ServiceUri:
        'https://uat-static.becn.digital/becn/rest/model/REST/NewRestService/v2/rest/com/becn',
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
