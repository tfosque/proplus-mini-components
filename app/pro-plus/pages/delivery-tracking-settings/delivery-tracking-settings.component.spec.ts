import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeliveryTrackingSettingsComponent } from './delivery-tracking-settings.component';

xdescribe('DeliveryTrackingSettingsComponent', () => {
    let component: DeliveryTrackingSettingsComponent;
    let fixture: ComponentFixture<DeliveryTrackingSettingsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DeliveryTrackingSettingsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DeliveryTrackingSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
