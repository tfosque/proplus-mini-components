export const environment = {
    // Begin of spa-sdk configuration
    brxmEndpoint: 'https://dev-site.becn.digital/site/resourceapi',
    brxmApiOrigin: 'https://dev-cms.becn.digital',
    brxmApiBaseUrl: 'https://dev-site.becn.digital/site/resourceapi/',
    brxmSpaOrigin: 'https://dev.becn.digital/',
    brxmSpaBaseUrl: '/',
    brxmSiteUrl: 'https://dev-site.becn.digital/site/',
    // End of spa-sdk configuration

    hasMultiTenantSupport: undefined,
    production: true,
    devServer: true,
    uatServer: false,
    prodServer: false,
    local: false,
    hippoRootProto: 'https',
    hippoRootUrl: 'dev-site.becn.digital',
    hippoCmsRootUrl: 'dev-cms.becn.digital',
    hippoSpaRootUrl: 'dev.becn.digital',
    hippoRootPort: '443',
    hippoSitePrefix: 'site',
    cacheServiceRoot: 'https://dev-static.becn.digital',
    beaconServiceUri: '/becn/rest/model/REST/NewRestService/v3/rest/com/becn',
    beaconV1ServiceUri:
        'https://dev-static.becn.digital/becn/rest/model/REST/NewRestService/v1/rest/com/becn',
    beaconV2ServiceUri:
        'https://dev-static.becn.digital/becn/rest/model/REST/NewRestService/v2/rest/com/becn',
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
