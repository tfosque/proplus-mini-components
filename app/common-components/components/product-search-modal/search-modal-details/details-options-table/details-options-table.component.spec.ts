import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsOptionsTableComponent } from './details-options-table.component';

describe('DetailsOptionsTableComponent', () => {
  let component: DetailsOptionsTableComponent;
  let fixture: ComponentFixture<DetailsOptionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsOptionsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsOptionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
