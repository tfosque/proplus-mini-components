import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProPlusNavigationComponent } from './pro-plus-navigation.component';

xdescribe('ProPlusNavigationComponent', () => {
    let component: ProPlusNavigationComponent;
    let fixture: ComponentFixture<ProPlusNavigationComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProPlusNavigationComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProPlusNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
