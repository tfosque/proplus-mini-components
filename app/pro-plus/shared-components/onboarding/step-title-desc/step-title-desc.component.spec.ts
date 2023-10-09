import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StepTitleDescComponent } from './step-title-desc.component';

describe('StepTitleDescComponent', () => {
  let component: StepTitleDescComponent;
  let fixture: ComponentFixture<StepTitleDescComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StepTitleDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepTitleDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
