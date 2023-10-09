import { TestBed } from '@angular/core/testing';

import { InstantAddressApiService } from './instant-address-api.service';

describe('InstantAddressApiService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: InstantAddressApiService = TestBed.inject(
            InstantAddressApiService
        );
        expect(service).toBeTruthy();
    });
});
