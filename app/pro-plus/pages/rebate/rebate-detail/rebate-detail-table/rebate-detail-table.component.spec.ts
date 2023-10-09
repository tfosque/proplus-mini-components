import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebateDetailTableComponent } from './rebate-detail-table.component';

describe('RebateDetailTableComponent', () => {
  let component: RebateDetailTableComponent;
  let fixture: ComponentFixture<RebateDetailTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RebateDetailTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RebateDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
