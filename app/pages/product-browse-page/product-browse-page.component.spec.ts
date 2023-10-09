import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductBrowsePageComponent } from './product-browse-page.component';

xdescribe('ProductBrowsePageComponent', () => {
    let component: ProductBrowsePageComponent;
    let fixture: ComponentFixture<ProductBrowsePageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductBrowsePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductBrowsePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
