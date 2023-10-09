import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebateDetailComponent } from './rebate-detail.component';

describe('RebateDetailComponent', () => {
  let component: RebateDetailComponent;
  let fixture: ComponentFixture<RebateDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RebateDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RebateDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
