import { TestBed } from '@angular/core/testing';

import { OrganizationService } from './organization.service';

xdescribe('OrganizationService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: OrganizationService = TestBed.inject(
            OrganizationService
        );
        expect(service).toBeTruthy();
    });
});
