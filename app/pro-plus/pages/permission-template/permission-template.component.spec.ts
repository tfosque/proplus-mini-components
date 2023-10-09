import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PermissionTemplateComponent } from './permission-template.component';

xdescribe('PermissionTemplateComponent', () => {
    let component: PermissionTemplateComponent;
    let fixture: ComponentFixture<PermissionTemplateComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PermissionTemplateComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PermissionTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
