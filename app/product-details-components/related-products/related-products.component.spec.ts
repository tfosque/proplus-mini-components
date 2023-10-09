import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RelatedProductsComponent } from './related-products.component';

xdescribe('RelatedProductsComponent', () => {
    let component: RelatedProductsComponent;
    let fixture: ComponentFixture<RelatedProductsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RelatedProductsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RelatedProductsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
