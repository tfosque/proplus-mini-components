import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalContainerComponent } from './search-modal-container.component';

describe('SearchModalContainerComponent', () => {
  let component: SearchModalContainerComponent;
  let fixture: ComponentFixture<SearchModalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchModalContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchModalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
