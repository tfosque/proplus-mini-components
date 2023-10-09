import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemTypeComponent } from './system-type.component';

describe('SystemTypeComponent', () => {
  let component: SystemTypeComponent;
  let fixture: ComponentFixture<SystemTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
