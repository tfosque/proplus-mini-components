import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectedFacetsContainerComponent } from './selected-facets-container.component';

xdescribe('SelectedFacetsContainerComponent', () => {
    let component: SelectedFacetsContainerComponent;
    let fixture: ComponentFixture<SelectedFacetsContainerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SelectedFacetsContainerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectedFacetsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
