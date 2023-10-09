import { TestBed, inject } from '@angular/core/testing';
import { SavedOrdersSummaryGuard } from './saved-orders-summary.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

xdescribe('SavedOrdersSummaryGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
            ],
            providers: [SavedOrdersSummaryGuard],
        });
    });

    it('should create an instance of saved orders summary guard', inject(
        [SavedOrdersSummaryGuard],
        (guard: SavedOrdersSummaryGuard) => {
            expect(guard).toBeTruthy();
        }
    ));
});
