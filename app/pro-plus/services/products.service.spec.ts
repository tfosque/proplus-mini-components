import { TestBed } from '@angular/core/testing';

import { ProductsService } from './products.service';

xdescribe('ProductsService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: ProductsService = TestBed.inject(ProductsService);
        expect(service).toBeTruthy();
    });
});
