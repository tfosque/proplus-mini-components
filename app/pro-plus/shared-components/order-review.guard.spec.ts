import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { OrderReviewGuard } from './order-review.guard';

xdescribe('OrderReviewGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
            ],
            providers: [OrderReviewGuard],
        });
    });

    it('should create an instance of order review guard', inject(
        [OrderReviewGuard],
        (guard: OrderReviewGuard) => {
            expect(guard).toBeTruthy();
        }
    ));
});
