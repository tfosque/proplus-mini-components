import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelIconsComponent } from './label-icons.component';

describe('LabelIconsComponent', () => {
  let component: LabelIconsComponent;
  let fixture: ComponentFixture<LabelIconsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
