import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationItemComponent } from './variation-item.component';

describe('VariationItemComponent', () => {
  let component: VariationItemComponent;
  let fixture: ComponentFixture<VariationItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
