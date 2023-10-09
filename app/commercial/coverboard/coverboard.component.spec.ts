import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverboardComponent } from './coverboard.component';

describe('CoverboardComponent', () => {
  let component: CoverboardComponent;
  let fixture: ComponentFixture<CoverboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoverboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
