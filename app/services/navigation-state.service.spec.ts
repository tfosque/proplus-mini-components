import { TestBed } from '@angular/core/testing';

import { NavigationStateService } from './navigation-state.service';

xdescribe('NavigationStateService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: NavigationStateService = TestBed.inject(
            NavigationStateService
        );
        expect(service).toBeTruthy();
    });
});
