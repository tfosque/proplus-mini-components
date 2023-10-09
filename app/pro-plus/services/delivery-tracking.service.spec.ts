import { TestBed } from '@angular/core/testing';

import { DeliveryTrackingService } from './delivery-tracking.service';

xdescribe('DeliveryTrackingService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: DeliveryTrackingService = TestBed.inject(
            DeliveryTrackingService
        );
        expect(service).toBeTruthy();
    });
});
