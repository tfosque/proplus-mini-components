import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomeHeroCarouselComponent } from './home-hero-carousel.component';

xdescribe('HomeHeroCarouselComponent', () => {
    let component: HomeHeroCarouselComponent;
    let fixture: ComponentFixture<HomeHeroCarouselComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HomeHeroCarouselComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeHeroCarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
