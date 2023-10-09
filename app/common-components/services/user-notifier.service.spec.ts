import { TestBed } from '@angular/core/testing';

import { UserNotifierService } from './user-notifier.service';

xdescribe('UserNotifierService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: UserNotifierService = TestBed.inject(
            UserNotifierService
        );
        expect(service).toBeTruthy();
    });
});
