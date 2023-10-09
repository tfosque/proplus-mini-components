import { TestBed } from '@angular/core/testing';

import { ProductBrowseService } from './product-browse.service';

xdescribe('ProductBrowseServiceService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: ProductBrowseService = TestBed.inject(
            ProductBrowseService
        );
        expect(service).toBeTruthy();
    });
});
