import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EagleViewCompletedReportListComponent } from './eagle-view-completed-report-list.component';

describe('EagleViewCompletedReportListComponent', () => {
  let component: EagleViewCompletedReportListComponent;
  let fixture: ComponentFixture<EagleViewCompletedReportListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EagleViewCompletedReportListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EagleViewCompletedReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
