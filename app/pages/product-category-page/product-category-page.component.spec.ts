import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductCategoryPageComponent } from './product-category-page.component';

xdescribe('ProductCategoryPageComponent', () => {
    let component: ProductCategoryPageComponent;
    let fixture: ComponentFixture<ProductCategoryPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductCategoryPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductCategoryPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
