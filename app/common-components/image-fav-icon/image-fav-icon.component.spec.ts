import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFavIconComponent } from './image-fav-icon.component';

describe('ImageFavIconComponent', () => {
  let component: ImageFavIconComponent;
  let fixture: ComponentFixture<ImageFavIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageFavIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageFavIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
