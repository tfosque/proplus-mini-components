import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PerfectOrderDetailComponent } from './perfect-order-detail.component';

xdescribe('PerfectOrderDetailComponent', () => {
    let component: PerfectOrderDetailComponent;
    let fixture: ComponentFixture<PerfectOrderDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PerfectOrderDetailComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PerfectOrderDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
