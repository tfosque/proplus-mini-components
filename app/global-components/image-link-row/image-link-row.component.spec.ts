import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageLinkRowComponent } from './image-link-row.component';

describe('ImageLinkRowComponent', () => {
  let component: ImageLinkRowComponent;
  let fixture: ComponentFixture<ImageLinkRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageLinkRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageLinkRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
