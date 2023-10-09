import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrderHistoryPageComponent } from './order-history-page.component';

xdescribe('OrderHistoryPageComponent', () => {
    let component: OrderHistoryPageComponent;
    let fixture: ComponentFixture<OrderHistoryPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OrderHistoryPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderHistoryPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
