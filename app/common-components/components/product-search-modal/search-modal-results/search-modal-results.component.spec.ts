import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalResultsComponent } from './search-modal-results.component';

describe('SearchModalResultsComponent', () => {
  let component: SearchModalResultsComponent;
  let fixture: ComponentFixture<SearchModalResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchModalResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchModalResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
