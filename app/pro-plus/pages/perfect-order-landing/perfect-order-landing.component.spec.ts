import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PerfectOrderLandingComponent } from './perfect-order-landing.component';

xdescribe('PerfectOrderLandingComponent', () => {
    let component: PerfectOrderLandingComponent;
    let fixture: ComponentFixture<PerfectOrderLandingComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PerfectOrderLandingComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PerfectOrderLandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
