import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingBannerComponent } from './marketing-banner.component';

xdescribe('MarketingBannerComponent', () => {
    let component: MarketingBannerComponent;
    let fixture: ComponentFixture<MarketingBannerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MarketingBannerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MarketingBannerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
