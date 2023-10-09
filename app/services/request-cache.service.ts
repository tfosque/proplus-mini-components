import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class RequestCacheService {
    private readonly map = new Map<string, HttpResponse<any>>();
    constructor() {}

    get(req: HttpRequest<any>): HttpEvent<any> | null {
        const key = getKey(req);
        const item = this.map.get(key);
        if (!item) {
            return null;
        }
        // console.log('cache get', key, this.map.size);
        return item;
    }
    put(req: HttpRequest<any>, event: HttpResponse<any>) {
        const key = getKey(req);
        this.map.set(key, event);
        // console.log('cache put', key, this.map.size);
    }
}
function getKey(req: HttpRequest<any>) {
    return `${req.method}-${req.urlWithParams}`;
}
