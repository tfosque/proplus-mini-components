import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PendingOrderDetailsComponent } from './pending-order-details.component';

describe('PendingOrderDetailsComponent', () => {
  let component: PendingOrderDetailsComponent;
  let fixture: ComponentFixture<PendingOrderDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingOrderDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
