import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalBreadCrumbComponent } from './search-modal-bread-crumb.component';

describe('SearchModalBreadCrumbComponent', () => {
  let component: SearchModalBreadCrumbComponent;
  let fixture: ComponentFixture<SearchModalBreadCrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchModalBreadCrumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchModalBreadCrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
