import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationTestComponent } from './variation-test.component';

describe('VariationTestComponent', () => {
  let component: VariationTestComponent;
  let fixture: ComponentFixture<VariationTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
