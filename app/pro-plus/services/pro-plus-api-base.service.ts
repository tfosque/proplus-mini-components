import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpResponse,
    HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
    UnauthorizedError,
    ApiError,
    ForbiddenError,
    // AppError,
} from '../../common-components/classes/app-error';
import { BehaviorSubject, throwError } from 'rxjs';
import { SessionInfo } from './SessionInfo';
import { beaconServiceRoot } from '../../../app/app.constants';
import { flatMap, catchError, retry, shareReplay } from 'rxjs/operators';
import { AllPermissions } from './UserPermissions';
// import { PageService } from 'src/app/services/page.service';

export type ApiVersion = 'v1' | 'v2' | 'v3';

@Injectable( {
    providedIn: 'root',
} )
export class ProPlusApiBase {
    public readonly userSession = new BehaviorSubject<SessionInfo>(
        new SessionInfo( { tag: 'notInitialized' } )
    );

    constructor(
        private readonly http: HttpClient // private pageService: PageService
    ) { }
    private readonly baseUrlV1 = environment.beaconV1ServiceUri;
    private readonly baseUrlV2 = environment.beaconV2ServiceUri;
    private readonly baseUrlV3 = `${beaconServiceRoot}`;

    // backendErrMessage = 'Unfortunately, Beacon PRO+ isn\'t working properly at the moment. Our team is working on it! Please try back in a few minutes.'

    public get permissions(): AllPermissions {
        return this.userSession.value.permissions;
    }

    public getV1<T>(
        relPage: string,
        getParameters: object
    ): Promise<HttpResponse<T>> {
        return this.getApi<T>( 'v1', relPage, getParameters );
    }

    public async getV2<T>(
        relPage: string,
        getParameters: object
    ): Promise<HttpResponse<T>> {
        return this.getApi<T>( 'v2', relPage, getParameters );
    }

    public async getV2WithTimeout<T>(
        relPage: string,
        getParameters: object
    ): Promise<HttpResponse<T>> {
        return this.getApiTimeout<T>( 'v2', relPage, getParameters );
    }

    public async getV23DPlus<T>(
        relPage: string,
        getParameters: object
    ): Promise<HttpResponse<T>> {
        return this.getApi3DPlus<T>( 'v2', relPage, getParameters );
    }

    public async getV2NoErrThrow<T>(
        relPage: string,
        getParameters: object
    ): Promise<HttpResponse<T>> {
        return this.getApiNoErrThrow<T>( 'v2', relPage, getParameters );
    }

    public async getV2NoStandardErrCheck<T>(
        relPage: string,
        getParameters: object
    ): Promise<HttpResponse<T>> {
        return this.getApiNoStandardErrCheck<T>( 'v2', relPage, getParameters );
    }

    public async tryGetResponse<T>(
        version: ApiVersion,
        relPage: string,
        getParameters: any
    ) {
        const response = await this.getApi<ApiResponse<T>>(
            version,
            relPage,
            getParameters
        );
        return this.tryGetResponseInt<T>( response );
    }

    public async getApi<T>(
        version: ApiVersion,
        relPage: string,
        getParameters: any
    ): Promise<HttpResponse<T>> {
        try {
            const baseUrl = this.getVersionUrl( version );
            const url = `${baseUrl}/${relPage}`;
            const r = await this.http
                .get<T>( url, {
                    observe: 'response',
                    withCredentials: true,
                    params: getParameters,
                } )
                .toPromise();
            return this.checkResponse( r );
        } catch ( err ) {
            this.checkForStandardErrors<T>( err );
            console.error( 'getApi', err );
            throw err;
        }
    }

    // quotes2OrderRestCall( quotesParams: any ) { 
    //     // Just as an example to handle long api calls. 
    //     const apiURL = 'https://dev-static.becn.com'; 
    //     const options = { 
    // headers: { 'Content-Type': 'application/json', 'apiKey': 'someApiKey' } } 
    //     this.httpClient.post( apiURL, quotesParams, options ) 
    //     .pipe( shareReplay(), retry( 2 ) ) 
    //     .subscribe( response => { console.log( { response } ); }, 
    //     error => this.handleError( error ) ); } 
    //     handleError( err: any ) { alert( 'A problem has been detected with your request.' ) 
    //     console.log( { err } ); }

    public async getApiTimeout<T>(
        version: ApiVersion,
        relPage: string,
        getParameters: any
    ): Promise<HttpResponse<T>> {
        try {
            const baseUrl = this.getVersionUrl( version );
            const url = `${baseUrl}/${relPage}`;
            const r = await this.http
                .get<T>( url, {
                    observe: 'response',
                    withCredentials: true,
                    params: getParameters,
                } )
                .pipe( retry( 2 ) )
                .toPromise();
            return this.checkResponse( r );
        } catch ( err ) {
            this.checkForStandardErrors<T>( err );
            console.error( 'getApi', err );
            throw err;
        }
    }

    public async getApi3DPlus<T>(
        version: ApiVersion,
        relPage: string,
        getParameters: any
    ): Promise<HttpResponse<T>> {
        try {
            const baseUrl = this.getVersionUrl( version );
            const url = `${baseUrl}/${relPage}`;
            const r = await this.http
                .get<T>( url, {
                    observe: 'response',
                    withCredentials: true,
                    params: getParameters,
                } )
                .toPromise();
            return this.checkResponse3DPlus( r );
        } catch ( err ) {
            this.checkForStandardErrors<T>( err );
            console.error( 'getApi', err );
            throw err;
        }
    }

    public async getApiNoErrThrow<T>(
        version: ApiVersion,
        relPage: string,
        getParameters: any
    ): Promise<HttpResponse<T>> {
        try {
            const baseUrl = this.getVersionUrl( version );
            const url = `${baseUrl}/${relPage}`;
            const r = await this.http
                .get<T>( url, {
                    observe: 'response',
                    withCredentials: true,
                    params: getParameters,
                } )
                .toPromise();
            return this.checkResponseNoErrThrow( r );
        } catch ( err ) {
            this.checkForStandardErrors<T>( err );
            console.error( 'getApi', err );
            throw err;
        }
    }

    public async getApiNoStandardErrCheck<T>(
        version: ApiVersion,
        relPage: string,
        getParameters: any
    ): Promise<HttpResponse<T>> {
        try {
            const baseUrl = this.getVersionUrl( version );
            const url = `${baseUrl}/${relPage}`;
            const r = await this.http
                .get<T>( url, {
                    observe: 'response',
                    withCredentials: true,
                    params: getParameters,
                } )
                .toPromise();
            return this.checkResponse( r );
        } catch ( err ) {
            // this.checkForStandardErrors<T>(err);
            console.error( 'getApi', err );
            throw err;
        }
    }

    public updateFavorites() {
        /* {
            "account": "string",
            "action": "string",
            "categorySort": true,
            "items": [
              {
                "itemId": "string",
                "itemNumber": "string",
                "unitOfMeasure": "string",
                "nickName": "string",
                "quantity": 0,
                "matchColor": "string",
                "matchMFG": "string"
              }
            ]
          } */
    }

    public getApiObservable<T>(
        version: ApiVersion,
        relPage: string,
        getParameters: any
    ) {
        const baseUrl = this.getVersionUrl( version );
        const url = `${baseUrl}/${relPage}`;
        const obs = this.http.get<T>( url, {
            withCredentials: true,
            params: getParameters,
        } );

        return obs.pipe(
            // tap(() => {
            //     this.pageService.forcePageLoading(false);
            // }),
            shareReplay(),
            catchError( ( err ) => {
                if ( err instanceof HttpErrorResponse && err.status === 403 ) {
                    return throwError(
                        new ForbiddenError(
                            `You do not have access to this resouce`
                        )
                    );
                }
                return throwError( err );
            } )
        );
    }

    public getApiDataUrl(
        version: ApiVersion,
        relPage: string,
        getParameters: Record<string, string>
    ) {
        const baseUrl = this.getVersionUrl( version );
        const url = `${baseUrl}/${relPage}`;
        return this.http
            .get( url, {
                withCredentials: true,
                params: getParameters,
                responseType: 'blob',
                observe: 'body',
            } )
            .pipe( flatMap( ( blob ) => blobToDataUrl( blob ) ) );
    }

    public getApiDataUrlBlob(
        version: ApiVersion,
        relPage: string,
        getParameters: Record<string, string>
    ) {
        const baseUrl = this.getVersionUrl( version );
        const url = `${baseUrl}/${relPage}`;
        return this.http
            .get( url, {
                withCredentials: true,
                params: getParameters,
                responseType: 'blob',
                observe: 'body',
            } )
            .pipe( ( blob ) => blob );
    }

    public postApiObservable<T>(
        version: ApiVersion,
        relPage: string,
        body: any,
        queryParams?: any
    ) {
        const baseUrl = this.getVersionUrl( version );
        const url = `${baseUrl}/${relPage}`;
        const httpParams = {
            withCredentials: true,
            params: queryParams,
        };
        if ( !queryParams ) {
            delete httpParams.params;
        }
        const obs = this.http.post<T>( url, body, httpParams );
        return obs;
    }

    public getVersionUrl( version: ApiVersion ) {
        switch ( version ) {
            case 'v1':
                return this.baseUrlV1;
            case 'v2':
                return this.baseUrlV2;
            case 'v3':
                return this.baseUrlV3;
        }
    }

    public postV1<T>( relPage: string, parameters: any ) {
        return this.postApi<T>( this.baseUrlV1, relPage, parameters );
    }
    public postV2<T>( relPage: string, bodyParameters: any, parameters?: any ) {
        return this.postApi<T>(
            this.baseUrlV2,
            relPage,
            bodyParameters,
            parameters
        );
    }

    public postV2WithToken<T>(
        relPage: string,
        bodyParameters: any,
        userRegisterToken: string,
        parameters?: any
    ) {
        return this.postApiWithToken<T>(
            this.baseUrlV2,
            relPage,
            bodyParameters,
            userRegisterToken,
            parameters
        );
    }

    public postV2WithError<T>(
        relPage: string,
        bodyParameters: any,
        parameters?: any
    ) {
        return this.postApiWithError<T>(
            this.baseUrlV2,
            relPage,
            bodyParameters,
            parameters
        );
    }

    public async tryPostApi<T>(
        version: ApiVersion,
        relPage: string,
        bodyParameters: any,
        parameters?: any
    ) {
        const response = await this.postApi<ApiResponse<T>>(
            this.baseUrlV2,
            relPage,
            bodyParameters,
            parameters
        );
        return this.tryGetResponseInt( response );
    }

    public async postApi<TResponse>(
        baseUrl: string,
        relPage: string,
        body: any,
        parameters?: any
    ) {
        const url = `${baseUrl}/${relPage}`;
        try {
            const response = await this.http
                .post<TResponse>( url, body, {
                    observe: 'response',
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                        // 'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    params: parameters,
                } )
                .toPromise();
            return this.checkResponse( response );
        } catch ( err ) {
            this.checkForStandardErrors<TResponse>( err );
            console.error( 'postApi', err );
            throw err;
        }
    }

    public async postApiWithToken<TResponse>(
        baseUrl: string,
        relPage: string,
        body: any,
        userRegisterToken: string,
        parameters?: any
    ) {
        const url = `${baseUrl}/${relPage}`;
        try {
            const response = await this.http
                .post<TResponse>( url, body, {
                    observe: 'response',
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                        // 'Content-Type': 'application/x-www-form-urlencoded'
                        'X-User-Register-Token': userRegisterToken,
                    },
                    params: parameters,
                } )
                .toPromise();
            return this.checkResponseWithError( response );
        } catch ( err ) {
            this.checkForStandardErrors<TResponse>( err );
            console.error( 'postApi', err );
            // throw err;
            return err;
        }
    }

    public async postApiWithError<TResponse>(
        baseUrl: string,
        relPage: string,
        body: any,
        parameters?: any
    ) {
        const url = `${baseUrl}/${relPage}`;
        try {
            const response = await this.http
                .post<TResponse>( url, body, {
                    observe: 'response',
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                        // 'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    params: parameters,
                } )
                .toPromise();
            return this.checkResponseWithError( response );
        } catch ( err ) {
            this.checkForStandardErrors<TResponse>( err );
            console.error( 'postApi', err );
            throw err;
        }
    }

    private checkForStandardErrors<TResponse>( err: unknown ) {
        if ( err instanceof HttpErrorResponse && err.status === 401 ) {
            this.setNotLoggedIn();
            throw new UnauthorizedError( `Session logged out` );
        }
        if ( err instanceof HttpErrorResponse && err.status === 403 ) {
            throw new ForbiddenError( `You do not have access to this resource` );
        }
    }

    private checkResponse<T>( response: HttpResponse<T> ) {
        if ( response && response.body ) {
            const { status, body } = response;
            if ( status === 401 ) {
                this.setNotLoggedIn();
                // throw new UnauthorizedError(statusText);
            } else if ( status === 403 ) {
                console.log( '403 error' );
            }
            if (
                isApiResponse( body ) &&
                !body.success &&
                body.messages &&
                body.messages.length
            ) {
                console.error( 'API Response error', body );
                const message = body.messages[0];
                throw new ApiError<T>( message.value, body );
            }
            // if (isSimpleApiResponse(body)) {
            //   throw new ApiError<T>(body.message, body);
            // }
        }
        return response;
    }

    private checkResponse3DPlus<T>( response: HttpResponse<T> ) {
        if ( response && response.body ) {
            const { status, body } = response;
            if ( status === 401 ) {
                this.setNotLoggedIn();
                // throw new UnauthorizedError(statusText);
            }
            if (
                isApiResponse( body ) &&
                !body.success &&
                body.messages &&
                body.messages.length &&
                ( parseInt( body.messages[0].code, 10 ) !== 1007 ||
                    body.messages[0].value.indexOf( 'no hover token' ) === -1 )
            ) {
                console.error( 'API Response error', body );
                const message = body.messages[0];
                throw new ApiError<T>( message.value, body );
            }
            // if (isSimpleApiResponse(body)) {
            //   throw new ApiError<T>(body.message, body);
            // }
        }
        return response;
    }

    private checkResponseNoErrThrow<T>( response: HttpResponse<T> ) {
        if ( response && response.body ) {
            const { status } = response;
            if ( status === 401 ) {
                this.setNotLoggedIn();
                // throw new UnauthorizedError(statusText);
            }
            // if (
            //   isApiResponse(body) &&
            //   !body.success &&
            //   body.messages &&
            //   body.messages.length
            // ) {
            //   console.error("API Response error", body);
            //   const message = body.messages[0];
            //   throw new ApiError<T>(message.value, body);
            // }
            // if (isSimpleApiResponse(body)) {
            //   throw new ApiError<T>(body.message, body);
            // }
        }
        return response;
    }

    private checkResponseWithError<T>( response: HttpResponse<T> ) {
        if ( response && response.body ) {
            const { status } = response;
            // const { status, body } = response;
            if ( status === 401 ) {
                this.setNotLoggedIn();
                // throw new UnauthorizedError(statusText);
            }
            // if (isApiResponse(body) && !body.success && body.messages && body.messages.length) {
            //   console.error('API Response error', body);
            //   const message = body.messages[0];
            //   throw new ApiError<T>(message.value, body);
            // }
            // if (isSimpleApiResponse(body)) {
            //   throw new ApiError<T>(body.message, body);
            // }
        }
        return response;
    }

    private setNotLoggedIn() {
        this.userSession.next( new SessionInfo( { tag: 'notLoggedIn' } ) );
    }

    private tryGetResponseInt<T>( response: HttpResponse<ApiResponse<T>> ) {
        const body = this.checkResponse( response ).body;
        if ( !body || !body.result ) {
            throw Error( 'Invalid body' );
        }
        return body.result;
    }
}

export interface ApiResult {
    success: boolean;
    messages?: ApiMessage[];
}

export interface ApiResponse<T> extends ApiResult {
    result: T;
}

export interface ApiMessage {
    type: string;
    value: string;
    code: string;
}

async function blobToDataUrl( blob: Blob ) {
    return new Promise<string | ArrayBuffer | null>( ( res, _rej ) => {
        const reader = new FileReader();
        reader.onloadend = function ( ev ) {
            if ( ev.type === 'loadend' && ev.returnValue ) {
                res( reader.result );
            } else {
                res( null );
            }
        };
        reader.readAsDataURL( blob );
    } );
}

// tslint:disable-next-line: no-any
export function isApiResponse( object: any ): object is ApiResult {
    return object && 'success' in object;
}
