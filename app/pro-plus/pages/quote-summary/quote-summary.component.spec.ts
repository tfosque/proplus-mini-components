import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { QuoteSummaryComponent } from './quote-summary.component';
import { MatIconModule } from '@angular/material/icon';
import { QuoteTableComponent } from './quote-table/quote-table.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import {
    MatDialog,
    MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
} from '@angular/material/dialog';

fdescribe('QuoteSummaryComponent', () => {
    let component: QuoteSummaryComponent;
    let fixture: ComponentFixture<QuoteSummaryComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    MatProgressSpinnerModule,
                    MatButtonModule,
                    MatIconModule,
                    MatTabsModule,
                    MatSelectModule,
                    MatInputModule,
                    FormsModule,
                    MatDatepickerModule,
                    MatTableModule,
                    RouterModule,
                    MatPaginatorModule,
                    HttpClientModule,
                    MatSnackBarModule,
                    RouterTestingModule.withRoutes([]),
                ],
                declarations: [QuoteSummaryComponent, QuoteTableComponent],
                providers: [MatDialog, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(QuoteSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('default to be received quote', () => {
        expect(component.getActiveTab()).toBe(2);
    });
});
