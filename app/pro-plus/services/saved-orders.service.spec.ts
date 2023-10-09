import { TestBed } from '@angular/core/testing';

import { SavedOrdersService } from './saved-orders.service';

xdescribe('SavedOrdersService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: SavedOrdersService = TestBed.inject(SavedOrdersService);
        expect(service).toBeTruthy();
    });
});
