import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSelectorAllComponent } from './product-selector-all.component';

xdescribe('ProductSelectorAllComponent', () => {
    let component: ProductSelectorAllComponent;
    let fixture: ComponentFixture<ProductSelectorAllComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductSelectorAllComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductSelectorAllComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
