import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserAdminDetailComponent } from './user-admin-detail.component';

xdescribe('UserAdminDetailComponent', () => {
    let component: UserAdminDetailComponent;
    let fixture: ComponentFixture<UserAdminDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [UserAdminDetailComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserAdminDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
