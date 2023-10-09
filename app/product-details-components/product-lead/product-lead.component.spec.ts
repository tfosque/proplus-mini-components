import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductLeadComponent } from './product-lead.component';

xdescribe('ProductLeadComponent', () => {
    let component: ProductLeadComponent;
    let fixture: ComponentFixture<ProductLeadComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductLeadComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductLeadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
