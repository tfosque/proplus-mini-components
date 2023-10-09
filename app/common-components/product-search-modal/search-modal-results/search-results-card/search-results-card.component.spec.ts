import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsCardComponent } from './search-results-card.component';

describe('SearchResultsCardComponent', () => {
  let component: SearchResultsCardComponent;
  let fixture: ComponentFixture<SearchResultsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchResultsCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
