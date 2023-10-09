import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EagleViewReportListComponent } from './eagle-view-report-list.component';

describe('EagleViewReportListComponent', () => {
  let component: EagleViewReportListComponent;
  let fixture: ComponentFixture<EagleViewReportListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EagleViewReportListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EagleViewReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
