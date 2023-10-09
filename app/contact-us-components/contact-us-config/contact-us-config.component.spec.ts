import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContactUsConfigComponent } from './contact-us-config.component';

xdescribe('ContactUsConfigComponent', () => {
    let component: ContactUsConfigComponent;
    let fixture: ComponentFixture<ContactUsConfigComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ContactUsConfigComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactUsConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
