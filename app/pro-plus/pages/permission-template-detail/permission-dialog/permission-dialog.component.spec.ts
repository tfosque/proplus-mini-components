import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PermissionDialogComponent } from './permission-dialog.component';

xdescribe('PermissionDialogComponent', () => {
    let component: PermissionDialogComponent;
    let fixture: ComponentFixture<PermissionDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PermissionDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PermissionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
