import { TestBed } from '@angular/core/testing';

import { SkywordService } from './skyword.service';

describe('SkywordService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: SkywordService = TestBed.inject(SkywordService);
        expect(service).toBeTruthy();
    });
});
