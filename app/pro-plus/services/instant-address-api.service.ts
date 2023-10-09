import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
    InstantAddressWildSearchRequest,
    InstantAddressWildSearchResponse,
    InstantAddressGetAddressRequest,
} from '../model/instant-address';
import { environment } from '../../../environments/environment';

const { addressValidationRoot } = environment;

@Injectable({
    providedIn: 'root',
})
export class InstantAddressApiService {
    constructor(private http: HttpClient) {}

    public getAddress(request: InstantAddressGetAddressRequest) {
        const url = `${addressValidationRoot}/getaddress`;
        const body = request;
        return this.http
            .post<InstantAddressWildSearchResponse>(url, body, {})
            .toPromise();
    }

    public getStreetWildSearch(input: string) {
        const url = `${addressValidationRoot}/getstreetwildsearch`;
        const body: InstantAddressWildSearchRequest = {
            Street1: input,
            City: '',
            State: '',
            ZipCode: '',
            Country: 'USA',
            ResponseType: 'Standardized',
        };

        const params = {
            take: '10',
            skip: '0',
            requestId: '',
            resultsExcludeByFlag: 'U,N,R',
        };
        const response = this.http.post<InstantAddressWildSearchResponse>(
            url,
            body,
            { params: params }
        );

        return response.pipe(map((res) => res.InstantAddressResult));
    }
}
