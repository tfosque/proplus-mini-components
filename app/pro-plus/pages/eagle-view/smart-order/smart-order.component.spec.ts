import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartOrderComponent } from './smart-order.component';

describe('SmartOrderComponent', () => {
  let component: SmartOrderComponent;
  let fixture: ComponentFixture<SmartOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
