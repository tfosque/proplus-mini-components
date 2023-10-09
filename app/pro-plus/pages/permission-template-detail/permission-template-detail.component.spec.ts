import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PermissionTemplateDetailComponent } from './permission-template-detail.component';

xdescribe('PermissionTemplateDetailComponent', () => {
    let component: PermissionTemplateDetailComponent;
    let fixture: ComponentFixture<PermissionTemplateDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PermissionTemplateDetailComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PermissionTemplateDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
