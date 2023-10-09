import { TestBed } from '@angular/core/testing';

import { CachingInterceptor } from './caching-interceptor.service';

xdescribe('CachingInterceptorService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: CachingInterceptor = TestBed.inject(CachingInterceptor);
        expect(service).toBeTruthy();
    });
});
