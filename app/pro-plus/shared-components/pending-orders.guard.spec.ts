import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { PendingOrdersGuard } from './pending-orders.guard';

xdescribe('PendingOrdersGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
            ],
            providers: [PendingOrdersGuard],
        });
    });

    it('should create an instance of pending orders guard', inject(
        [PendingOrdersGuard],
        (guard: PendingOrdersGuard) => {
            expect(guard).toBeTruthy();
        }
    ));
});
