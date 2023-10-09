import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebateLandingV2Component } from './rebate-landing-v2.component';

describe('RebateLandingV2Component', () => {
  let component: RebateLandingV2Component;
  let fixture: ComponentFixture<RebateLandingV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RebateLandingV2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RebateLandingV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
