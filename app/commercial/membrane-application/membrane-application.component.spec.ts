import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembraneApplicationComponent } from './membrane-application.component';

describe('MembraneApplicationComponent', () => {
  let component: MembraneApplicationComponent;
  let fixture: ComponentFixture<MembraneApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembraneApplicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembraneApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
