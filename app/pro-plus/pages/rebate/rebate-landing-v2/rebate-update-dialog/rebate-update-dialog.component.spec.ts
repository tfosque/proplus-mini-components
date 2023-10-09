import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebateUpdateDialogComponent } from './rebate-update-dialog.component';

describe('RebateUpdateDialogComponent', () => {
  let component: RebateUpdateDialogComponent;
  let fixture: ComponentFixture<RebateUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RebateUpdateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RebateUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
