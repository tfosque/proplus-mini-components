import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PopularBrandsComponent } from './popular-brands.component';

xdescribe('PopularBrandsComponent', () => {
    let component: PopularBrandsComponent;
    let fixture: ComponentFixture<PopularBrandsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PopularBrandsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PopularBrandsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
