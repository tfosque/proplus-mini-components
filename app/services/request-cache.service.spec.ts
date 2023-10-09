import { TestBed } from '@angular/core/testing';

import { RequestCacheService } from './request-cache.service';

xdescribe('RequestCacheService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: RequestCacheService = TestBed.inject(
            RequestCacheService
        );
        expect(service).toBeTruthy();
    });
});
