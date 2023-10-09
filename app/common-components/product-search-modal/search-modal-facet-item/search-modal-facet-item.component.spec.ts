import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalFacetItemComponent } from './search-modal-facet-item.component';

describe('SearchModalFacetItemComponent', () => {
  let component: SearchModalFacetItemComponent;
  let fixture: ComponentFixture<SearchModalFacetItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchModalFacetItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchModalFacetItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
