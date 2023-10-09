import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContactUsPageComponent } from './contact-us-page.component';

xdescribe('ContactUsPageComponent', () => {
    let component: ContactUsPageComponent;
    let fixture: ComponentFixture<ContactUsPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ContactUsPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactUsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
