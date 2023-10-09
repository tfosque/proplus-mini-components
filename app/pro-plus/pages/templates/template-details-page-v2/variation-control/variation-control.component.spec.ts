import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationControlComponent } from './variation-control.component';

describe('VariationControlComponent', () => {
  let component: VariationControlComponent;
  let fixture: ComponentFixture<VariationControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
