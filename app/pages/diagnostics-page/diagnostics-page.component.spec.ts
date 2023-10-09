import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiagnosticsPageComponent } from './diagnostics-page.component';

xdescribe('DiagnosticsPageComponent', () => {
    let component: DiagnosticsPageComponent;
    let fixture: ComponentFixture<DiagnosticsPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DiagnosticsPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DiagnosticsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
