import { TestBed } from '@angular/core/testing';

import { ToursService } from './tours.service';

describe('ToursService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: ToursService = TestBed.inject(ToursService);
        expect(service).toBeTruthy();
    });
});
