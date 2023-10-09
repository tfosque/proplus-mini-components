import { TestBed, inject } from '@angular/core/testing';
import { ShippingFormGuard } from './shipping-form.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

xdescribe('ShippingFormGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
            ],
            providers: [ShippingFormGuard],
        });
    });

    it('should create an instance of shipping form guard', inject(
        [ShippingFormGuard],
        (guard: ShippingFormGuard) => {
            expect(guard).toBeTruthy();
        }
    ));
});
