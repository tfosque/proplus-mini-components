import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FacetsSelectorComponent } from './facets-selector.component';

xdescribe('FacetsSelectorComponent', () => {
    let component: FacetsSelectorComponent;
    let fixture: ComponentFixture<FacetsSelectorComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [FacetsSelectorComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacetsSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
