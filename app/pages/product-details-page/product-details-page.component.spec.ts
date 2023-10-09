import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductDetailsPageComponent } from './product-details-page.component';

xdescribe('ProductDetailsPageComponent ', () => {
    let component: ProductDetailsPageComponent;
    let fixture: ComponentFixture<ProductDetailsPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductDetailsPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductDetailsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
