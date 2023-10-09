import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationCardSectionComponent } from './application-card-section.component';

xdescribe('ApplicationCardSectionComponent', () => {
    let component: ApplicationCardSectionComponent;
    let fixture: ComponentFixture<ApplicationCardSectionComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ApplicationCardSectionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ApplicationCardSectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
