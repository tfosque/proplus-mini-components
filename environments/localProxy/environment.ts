//  Wanted a configuration where the local development environment is all done behind the proxy

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    devServer: false,
    uatServer: false,
    prodServer: false,
    local: false,
    hippoRootProto: 'http',
    hippoRootUrl: 'localhost',
    hippoCmsRootUrl: 'localhost',
    hippoSpaRootUrl: 'localhost:8888',
    hippoRootPort: '8888',
    hippoSitePrefix: 'site',
    cacheServiceRoot: 'https://dev-static.becn.digital',
    beaconServiceUri: '/becn/rest/model/REST/NewRestService/v3/rest/com/becn',
    beaconV1ServiceUri:
        'https://beacon-uat.becn.com/rest/model/REST/NewRestService/v1/rest/com/becn',
    beaconV2ServiceUri:
        'https://beacon-uat.becn.com/rest/model/REST/NewRestService/v2/rest/com/becn',
    imageServiceUri: '/insecure/plain/',
    mapUrl: '/api/location?',
    blogApiPath: '/api/blog',
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
