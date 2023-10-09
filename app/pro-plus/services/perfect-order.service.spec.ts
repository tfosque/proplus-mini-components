import { TestBed } from '@angular/core/testing';

import { PerfectOrderService } from './perfect-order.service';

xdescribe('PerfectOrderService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: PerfectOrderService = TestBed.inject(
            PerfectOrderService
        );
        expect(service).toBeTruthy();
    });
});
