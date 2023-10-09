import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingCarouselComponent } from './marketing-carousel.component';

describe('MarketingCarouselComponent', () => {
  let component: MarketingCarouselComponent;
  let fixture: ComponentFixture<MarketingCarouselComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
