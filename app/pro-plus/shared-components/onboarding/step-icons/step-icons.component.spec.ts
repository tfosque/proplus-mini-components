import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StepIconsComponent } from './step-icons.component';

describe('StepIconsComponent', () => {
  let component: StepIconsComponent;
  let fixture: ComponentFixture<StepIconsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StepIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
