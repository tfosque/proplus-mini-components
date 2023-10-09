import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateStepTitleDescComponent } from './template-step-title-desc.component';

describe('TemplateStepTitleDescComponent', () => {
  let component: TemplateStepTitleDescComponent;
  let fixture: ComponentFixture<TemplateStepTitleDescComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateStepTitleDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateStepTitleDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
