import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RebateLandingComponent } from './rebate-landing.component';

xdescribe('RebateLandingComponent', () => {
    let component: RebateLandingComponent;
    let fixture: ComponentFixture<RebateLandingComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RebateLandingComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RebateLandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
