import { TestBed } from '@angular/core/testing';

import { LocationsService } from './locations.service';

xdescribe('LocationsService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: LocationsService = TestBed.inject(LocationsService);
        expect(service).toBeTruthy();
    });
});
