import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavedOrderSummaryComponent } from './saved-order-summary.component';

xdescribe('SavedOrdersComponent', () => {
    let component: SavedOrderSummaryComponent;
    let fixture: ComponentFixture<SavedOrderSummaryComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SavedOrderSummaryComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SavedOrderSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
