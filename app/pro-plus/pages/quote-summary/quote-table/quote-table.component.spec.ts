import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuoteTableComponent } from './quote-table.component';

xdescribe('QuoteTableComponent', () => {
    let component: QuoteTableComponent;
    let fixture: ComponentFixture<QuoteTableComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuoteTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuoteTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
