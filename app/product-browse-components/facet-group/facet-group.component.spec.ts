import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FacetGroupComponent } from './facet-group.component';

xdescribe('FacetGroupComponent', () => {
    let component: FacetGroupComponent;
    let fixture: ComponentFixture<FacetGroupComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [FacetGroupComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacetGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
