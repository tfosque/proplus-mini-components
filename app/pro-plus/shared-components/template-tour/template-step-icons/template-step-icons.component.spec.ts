import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateStepIconsComponent } from './template-step-icons.component';

describe('TemplateStepIconsComponent', () => {
  let component: TemplateStepIconsComponent;
  let fixture: ComponentFixture<TemplateStepIconsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateStepIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateStepIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
