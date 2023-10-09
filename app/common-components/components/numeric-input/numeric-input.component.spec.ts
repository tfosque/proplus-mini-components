import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NumericInputComponent } from './numeric-input.component';

describe('NumericInputComponent', () => {
    let component: NumericInputComponent;
    let fixture: ComponentFixture<NumericInputComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NumericInputComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NumericInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
