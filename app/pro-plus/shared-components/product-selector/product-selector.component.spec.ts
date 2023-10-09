import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSelectorComponent } from './product-selector.component';

xdescribe('ProductSelectorComponent', () => {
    let component: ProductSelectorComponent;
    let fixture: ComponentFixture<ProductSelectorComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductSelectorComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
