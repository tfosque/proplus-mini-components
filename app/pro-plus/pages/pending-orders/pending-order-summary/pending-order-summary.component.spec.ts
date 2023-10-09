import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PendingOrderSummaryComponent } from './pending-order-summary.component';

describe('PendingOrderSummaryComponent', () => {
  let component: PendingOrderSummaryComponent;
  let fixture: ComponentFixture<PendingOrderSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingOrderSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingOrderSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
