import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateTourComponent } from './template-tour.component';

describe('TemplateTourComponent', () => {
  let component: TemplateTourComponent;
  let fixture: ComponentFixture<TemplateTourComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateTourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
