import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationWidgetComponent } from './variation-widget.component';

describe('VariationWidgetComponent', () => {
  let component: VariationWidgetComponent;
  let fixture: ComponentFixture<VariationWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
