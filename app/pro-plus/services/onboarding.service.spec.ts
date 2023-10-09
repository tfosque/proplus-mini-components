import { TestBed } from '@angular/core/testing';

import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: OnboardingService = TestBed.inject(OnboardingService);
        expect(service).toBeTruthy();
    });
});
