import { TestBed } from '@angular/core/testing';

import { SeoService } from './seo.service';

xdescribe('SeoService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: SeoService = TestBed.inject(SeoService);
        expect(service).toBeTruthy();
    });
});
