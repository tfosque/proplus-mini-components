import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RebateRedeemedDetailComponent } from './rebate-redeemed-detail.component';

xdescribe('RebateRedeemedDetailComponent', () => {
    let component: RebateRedeemedDetailComponent;
    let fixture: ComponentFixture<RebateRedeemedDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RebateRedeemedDetailComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RebateRedeemedDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
