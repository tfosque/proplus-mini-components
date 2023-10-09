import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavedOrderShippingFormComponent } from './saved-order-shipping-form.component';

describe('SavedOrderShippingFormComponent', () => {
  let component: SavedOrderShippingFormComponent;
  let fixture: ComponentFixture<SavedOrderShippingFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavedOrderShippingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedOrderShippingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
