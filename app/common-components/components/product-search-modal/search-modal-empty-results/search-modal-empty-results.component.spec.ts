import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalEmptyResultsComponent } from './search-modal-empty-results.component';

describe('SearchModalEmptyResultsComponent', () => {
  let component: SearchModalEmptyResultsComponent;
  let fixture: ComponentFixture<SearchModalEmptyResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchModalEmptyResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchModalEmptyResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
