import { TestBed } from '@angular/core/testing';

import { ArchivesService } from './archives.service';

describe('ArchivesService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: ArchivesService = TestBed.inject(ArchivesService);
        expect(service).toBeTruthy();
    });
});
