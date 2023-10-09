import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateLabelIconsComponent } from './template-label-icons.component';

describe('TemplateLabelIconsComponent', () => {
  let component: TemplateLabelIconsComponent;
  let fixture: ComponentFixture<TemplateLabelIconsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateLabelIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateLabelIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
