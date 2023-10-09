import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateTemplateDialogComponent } from './create-template-dialog.component';

xdescribe('CreateTemplateDialogComponent', () => {
    let component: CreateTemplateDialogComponent;
    let fixture: ComponentFixture<CreateTemplateDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateTemplateDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateTemplateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
