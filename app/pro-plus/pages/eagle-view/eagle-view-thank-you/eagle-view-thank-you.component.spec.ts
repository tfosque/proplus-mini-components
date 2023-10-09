import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EagleViewThankYouComponent } from './eagle-view-thank-you.component';

describe('EagleViewThankYouComponent', () => {
    let component: EagleViewThankYouComponent;
    let fixture: ComponentFixture<EagleViewThankYouComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [EagleViewThankYouComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EagleViewThankYouComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
