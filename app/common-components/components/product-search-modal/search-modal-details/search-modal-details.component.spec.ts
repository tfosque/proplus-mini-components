import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalDetailsComponent } from './search-modal-details.component';

describe('SearchModalDetailsComponent', () => {
  let component: SearchModalDetailsComponent;
  let fixture: ComponentFixture<SearchModalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchModalDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchModalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
