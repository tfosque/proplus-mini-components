import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MainNavMegaMenuComponent } from './main-nav-mega-menu.component';

xdescribe('MainNavMegaMenuComponent', () => {
    let component: MainNavMegaMenuComponent;
    let fixture: ComponentFixture<MainNavMegaMenuComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MainNavMegaMenuComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainNavMegaMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
