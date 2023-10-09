import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FacetContainerComponent } from './facet-container.component';

xdescribe('FacetContainerComponent', () => {
    let component: FacetContainerComponent;
    let fixture: ComponentFixture<FacetContainerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [FacetContainerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacetContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
