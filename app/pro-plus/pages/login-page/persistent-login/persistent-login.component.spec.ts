import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PersistentLoginComponent } from './persistent-login.component';

xdescribe('PersistentLoginComponent', () => {
    let component: PersistentLoginComponent;
    let fixture: ComponentFixture<PersistentLoginComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PersistentLoginComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PersistentLoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
