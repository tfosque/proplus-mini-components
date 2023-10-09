import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RotatingCarouselComponent } from './rotating-carousel.component';

describe('RotatingCarouselComponent', () => {
  let component: RotatingCarouselComponent;
  let fixture: ComponentFixture<RotatingCarouselComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RotatingCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotatingCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
