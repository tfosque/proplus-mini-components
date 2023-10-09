import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductAdderComponent } from './product-adder.component';

xdescribe('ProductAdderComponent', () => {
    let component: ProductAdderComponent;
    let fixture: ComponentFixture<ProductAdderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductAdderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductAdderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
