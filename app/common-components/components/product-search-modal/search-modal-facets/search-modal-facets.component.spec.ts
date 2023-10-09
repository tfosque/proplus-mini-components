import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalFacetsComponent } from './search-modal-facets.component';

describe('SearchModalFacetsComponent', () => {
  let component: SearchModalFacetsComponent;
  let fixture: ComponentFixture<SearchModalFacetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchModalFacetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchModalFacetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
