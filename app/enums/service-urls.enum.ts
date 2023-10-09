/**
 * URL segmentes related to beacon apis. Beacon service url is https://beaconproplus.com/rest/model/REST/NewRestService/v3/rest/com/becn
 * mock service is https://private-c6c172-beaconmock.apiary-mock.com
 * the UAT link is: https://beacon-uat.becn.com/rest/model/REST/NewRestService/v3/rest/com/becn
 * hippoRoot link is: http://localhost:8080
 * hippoRoot mock link is: https://private-c6c172-beaconmock.apiary-mock.com
 */

export enum ServiceUrls {
    items = '/itemDetails',
    itemlist = '/itemlist',
    locations = '/StoreLocation',
    formSubmissions = '/form-submission',
    contactUsHandler = '/contact-us',
    emailSignUpHandler = '/email-sign-up',
    resourceApi = '/resourceapi',
    pagenotfound = '/pagenotfound',
    hippoRestApi = '/api-man',
}
