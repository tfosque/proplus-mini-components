import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PendingOrdersBarComponent } from './pending-orders-bar.component';

describe('PendingOrdersBarComponent', () => {
  let component: PendingOrdersBarComponent;
  let fixture: ComponentFixture<PendingOrdersBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingOrdersBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingOrdersBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
