import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuoteDetailComponent } from './quote-detail.component';

xdescribe('QuoteDetailComponent', () => {
    let component: QuoteDetailComponent;
    let fixture: ComponentFixture<QuoteDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuoteDetailComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuoteDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
