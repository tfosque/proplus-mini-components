import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobAccountComponent } from './job-account.component';

describe('JobAccountComponent', () => {
  let component: JobAccountComponent;
  let fixture: ComponentFixture<JobAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
