import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalloutComponent } from './callout.component';

xdescribe('CalloutComponent', () => {
    let component: CalloutComponent;
    let fixture: ComponentFixture<CalloutComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CalloutComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CalloutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
