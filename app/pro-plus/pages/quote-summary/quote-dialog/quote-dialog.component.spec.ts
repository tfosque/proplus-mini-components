import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuoteDialogComponent } from './quote-dialog.component';

xdescribe('QuoteDialogComponent', () => {
    let component: QuoteDialogComponent;
    let fixture: ComponentFixture<QuoteDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuoteDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuoteDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
