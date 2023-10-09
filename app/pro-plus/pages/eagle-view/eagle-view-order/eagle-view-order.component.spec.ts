import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EagleViewOrderComponent } from './eagle-view-order.component';

describe('EagleViewOrderComponent', () => {
    let component: EagleViewOrderComponent;
    let fixture: ComponentFixture<EagleViewOrderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [EagleViewOrderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EagleViewOrderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
