import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { JobDetailComponent } from './job-detail.component';

describe('JobDetailComponent', () => {
    let component: JobDetailComponent;
    let fixture: ComponentFixture<JobDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [JobDetailComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
