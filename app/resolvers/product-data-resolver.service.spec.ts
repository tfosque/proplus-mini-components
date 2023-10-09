import { TestBed } from '@angular/core/testing';

import { ProductDataResolverService } from './product-data-resolver.service';

xdescribe('ProductDataResolverService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: ProductDataResolverService = TestBed.inject(
            ProductDataResolverService
        );
        expect(service).toBeTruthy();
    });
});
