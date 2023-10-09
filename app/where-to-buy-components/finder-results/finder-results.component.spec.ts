import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FinderResultsComponent } from './finder-results.component';

xdescribe('FinderResultsComponent', () => {
    let component: FinderResultsComponent;
    let fixture: ComponentFixture<FinderResultsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [FinderResultsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FinderResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
