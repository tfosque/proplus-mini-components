import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PerfectOrderComponent } from './perfect-order.component';

xdescribe('PerfectOrderComponent', () => {
    let component: PerfectOrderComponent;
    let fixture: ComponentFixture<PerfectOrderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PerfectOrderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PerfectOrderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
