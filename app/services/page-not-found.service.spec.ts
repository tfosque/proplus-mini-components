import { TestBed } from '@angular/core/testing';

import { PageNotFoundService } from './page-not-found.service';

xdescribe('PageNotFoundService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: PageNotFoundService = TestBed.inject(
            PageNotFoundService
        );
        expect(service).toBeTruthy();
    });
});
