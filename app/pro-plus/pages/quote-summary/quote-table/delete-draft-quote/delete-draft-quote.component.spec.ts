import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteDraftQuoteComponent } from './delete-draft-quote.component';

xdescribe('DeleteDraftQuoteComponent', () => {
    let component: DeleteDraftQuoteComponent;
    let fixture: ComponentFixture<DeleteDraftQuoteComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DeleteDraftQuoteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DeleteDraftQuoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
