import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UpgradeEagleViewReportComponent } from './upgrade-eagle-view-report.component';

describe('UpgradeEagleViewReportComponent', () => {
  let component: UpgradeEagleViewReportComponent;
  let fixture: ComponentFixture<UpgradeEagleViewReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradeEagleViewReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradeEagleViewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
