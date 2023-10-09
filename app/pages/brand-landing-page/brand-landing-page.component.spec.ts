import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrandLandingPageComponent } from './brand-landing-page.component';

xdescribe('BrandLandingPageComponent', () => {
    let component: BrandLandingPageComponent;
    let fixture: ComponentFixture<BrandLandingPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [BrandLandingPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BrandLandingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
