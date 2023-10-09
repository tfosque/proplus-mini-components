import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StormPlusComponent } from './storm-plus.component';

describe('StormPlusComponent', () => {
  let component: StormPlusComponent;
  let fixture: ComponentFixture<StormPlusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StormPlusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StormPlusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
