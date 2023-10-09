import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThankYouPageComponent } from './thank-you-page.component';

describe('ThankYouPageComponent', () => {
    let component: ThankYouPageComponent;
    let fixture: ComponentFixture<ThankYouPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ThankYouPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ThankYouPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
