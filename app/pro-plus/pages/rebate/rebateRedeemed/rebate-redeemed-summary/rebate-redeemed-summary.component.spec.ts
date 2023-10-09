import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RebateRedeemedSummaryComponent } from './rebate-redeemed-summary.component';

xdescribe('RebateRedeemedSummaryComponent', () => {
    let component: RebateRedeemedSummaryComponent;
    let fixture: ComponentFixture<RebateRedeemedSummaryComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RebateRedeemedSummaryComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RebateRedeemedSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
