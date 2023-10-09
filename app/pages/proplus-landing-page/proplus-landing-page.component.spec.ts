import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProplusLandingPageComponent } from './proplus-landing-page.component';

describe('ProplusLandingPageComponent', () => {
  let component: ProplusLandingPageComponent;
  let fixture: ComponentFixture<ProplusLandingPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProplusLandingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProplusLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
