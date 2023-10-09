import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrandBannerComponent } from './brand-banner.component';

xdescribe('BrandBannerComponent', () => {
    let component: BrandBannerComponent;
    let fixture: ComponentFixture<BrandBannerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [BrandBannerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BrandBannerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
