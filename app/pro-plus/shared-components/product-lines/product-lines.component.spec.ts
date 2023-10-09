import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductLinesComponent } from './product-lines.component';

xdescribe('ProductLinesComponent', () => {
    let component: ProductLinesComponent;
    let fixture: ComponentFixture<ProductLinesComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductLinesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductLinesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
