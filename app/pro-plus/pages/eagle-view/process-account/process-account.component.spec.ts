import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAccountComponent } from './process-account.component';

describe('ProcessAccountComponent', () => {
  let component: ProcessAccountComponent;
  let fixture: ComponentFixture<ProcessAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
