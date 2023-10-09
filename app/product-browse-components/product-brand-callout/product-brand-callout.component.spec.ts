import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductBrandCalloutComponent } from './product-brand-callout.component';

xdescribe('ProductBrandCalloutComponent', () => {
    let component: ProductBrandCalloutComponent;
    let fixture: ComponentFixture<ProductBrandCalloutComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductBrandCalloutComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductBrandCalloutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
