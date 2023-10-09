import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSpecsComponent } from './product-specs.component';

xdescribe('ProductSpecsComponent', () => {
    let component: ProductSpecsComponent;
    let fixture: ComponentFixture<ProductSpecsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductSpecsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductSpecsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
