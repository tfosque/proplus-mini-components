import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QuoteOrderComponent } from './quote-order.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DumpGridComponent } from '../../../common-components/components/dump-grid/dump-grid.component';
import { ProductSelectorComponent } from '../../shared-components/product-selector/product-selector.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorImagePipe } from '../../../pipes/error-image.pipe';
import { ProductImagePipe } from '../../../pipes/product-image.pipe';
import { ImagePreloadDirective } from '../../../common-components/directives/image-preload.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { TotalPricePipe } from '../../../pipes/total-price.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
    MatDialog,
    MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
} from '@angular/material/dialog';

fdescribe('QuoteOrderComponent', () => {
    let component: QuoteOrderComponent;
    let fixture: ComponentFixture<QuoteOrderComponent>;
    let activatedRoute: ActivatedRoute;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                MatFormFieldModule,
                MatTableModule,
                MatIconModule,
                MatProgressSpinnerModule,
                MatDividerModule,
                MatStepperModule,
                FormsModule,
                MatRadioModule,
                MatSelectModule,
                MatDatepickerModule,
                MatMenuModule,
                MatCheckboxModule,
                ReactiveFormsModule,
                MatInputModule,
                RouterTestingModule.withRoutes([]),
                MatButtonModule,
                MatSnackBarModule,
                HttpClientTestingModule,
                HttpClientModule,
            ],
            declarations: [
                QuoteOrderComponent,
                DumpGridComponent,
                ProductSelectorComponent,
                ErrorImagePipe,
                ProductImagePipe,
                ImagePreloadDirective,
                TotalPricePipe,
            ],
            providers: [
                ErrorStateMatcher,
                SafeHtmlPipe,
                MatDialog,
                MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: convertToParamMap({
                                accountId: '280381',
                                quoteOrderId: 'qo15100001',
                            }),
                        },
                    },
                },
            ],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(QuoteOrderComponent);
        component = fixture.componentInstance;
        activatedRoute = TestBed.inject(ActivatedRoute);
        // fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    let isTest = true;
    it('simple boolean test', () => {
        isTest = false;
        expect(isTest).toBe(false);
    });

    it('quoteOrderDetail test', () => {
        expect(component.quoteOrderDetail).toBeUndefined();
    });

    it('quoteOrderId test', () => {
        expect(activatedRoute.snapshot.paramMap.get('quoteOrderId')).toBe(
            'qo15100001'
        );
    });

    it('accountId test', () => {
        expect(activatedRoute.snapshot.paramMap.get('accountId')).toBe(
            '280381'
        );
    });
});
