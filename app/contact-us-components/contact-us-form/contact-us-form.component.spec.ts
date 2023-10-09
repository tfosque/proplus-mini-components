import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContactUsFormComponent } from './contact-us-form.component';

xdescribe('ContactUsFormComponent', () => {
    let component: ContactUsFormComponent;
    let fixture: ComponentFixture<ContactUsFormComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ContactUsFormComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactUsFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
