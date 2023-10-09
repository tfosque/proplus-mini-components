import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductAllComponent } from './product-all.component';

xdescribe('ProductAllComponent', () => {
    let component: ProductAllComponent;
    let fixture: ComponentFixture<ProductAllComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductAllComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductAllComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
