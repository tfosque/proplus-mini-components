import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FacetModalComponent } from './facet-modal.component';

xdescribe('FacetModalComponent', () => {
    let component: FacetModalComponent;
    let fixture: ComponentFixture<FacetModalComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [FacetModalComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacetModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
