import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDetailsPageV2Component } from './template-details-page-v2.component';

describe('TemplateDetailsPageV2Component', () => {
  let component: TemplateDetailsPageV2Component;
  let fixture: ComponentFixture<TemplateDetailsPageV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateDetailsPageV2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateDetailsPageV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
