import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationCardComponent } from './application-card.component';

xdescribe('ApplicationCardComponent', () => {
    let component: ApplicationCardComponent;
    let fixture: ComponentFixture<ApplicationCardComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ApplicationCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ApplicationCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
