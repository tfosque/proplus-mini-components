import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDetailsLineItemComponent } from './template-details-line-item.component';

describe('TemplateDetailsLineItemComponent', () => {
  let component: TemplateDetailsLineItemComponent;
  let fixture: ComponentFixture<TemplateDetailsLineItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateDetailsLineItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateDetailsLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
