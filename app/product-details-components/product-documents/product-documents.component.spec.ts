import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductDocumentsComponent } from './product-documents.component';

xdescribe('ProductDocumentsComponent', () => {
    let component: ProductDocumentsComponent;
    let fixture: ComponentFixture<ProductDocumentsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProductDocumentsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductDocumentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
