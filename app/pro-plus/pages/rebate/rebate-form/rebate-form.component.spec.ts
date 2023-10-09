import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RebateFormComponent } from './rebate-form.component';

xdescribe('RebateFormComponent', () => {
    let component: RebateFormComponent;
    let fixture: ComponentFixture<RebateFormComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RebateFormComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RebateFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
