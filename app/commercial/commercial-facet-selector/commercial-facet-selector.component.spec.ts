import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialFacetSelectorComponent } from './commercial-facet-selector.component';

describe('CommercialFacetSelectorComponent', () => {
  let component: CommercialFacetSelectorComponent;
  let fixture: ComponentFixture<CommercialFacetSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialFacetSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialFacetSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
