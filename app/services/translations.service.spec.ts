import { TestBed } from '@angular/core/testing';

import { TranslationsService } from './translations.service';

xdescribe('TranslationsService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: TranslationsService = TestBed.inject(
            TranslationsService
        );
        expect(service).toBeTruthy();
    });
});
