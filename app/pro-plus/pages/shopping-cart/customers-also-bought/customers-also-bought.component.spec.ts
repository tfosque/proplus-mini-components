import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomersAlsoBoughtComponent } from './customers-also-bought.component';

describe('CustomersAlsoBoughtComponent', () => {
    let component: CustomersAlsoBoughtComponent;
    let fixture: ComponentFixture<CustomersAlsoBoughtComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomersAlsoBoughtComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomersAlsoBoughtComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
