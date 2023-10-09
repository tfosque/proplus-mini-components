import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgFavIconComponent } from './img-fav-icon.component';

describe('ImgFavIconComponent', () => {
  let component: ImgFavIconComponent;
  let fixture: ComponentFixture<ImgFavIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImgFavIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgFavIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
