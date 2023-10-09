import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EagleViewLandingComponent } from './eagle-view-landing.component';

describe('EagleViewLandingComponent', () => {
  let component: EagleViewLandingComponent;
  let fixture: ComponentFixture<EagleViewLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EagleViewLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EagleViewLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
