import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FinderComponent } from './finder.component';

xdescribe('FinderComponent', () => {
    let component: FinderComponent;
    let fixture: ComponentFixture<FinderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [FinderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FinderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
