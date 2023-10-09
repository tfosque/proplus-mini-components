import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembraneTypeComponent } from './membrane-type.component';

describe('MembraneTypeComponent', () => {
  let component: MembraneTypeComponent;
  let fixture: ComponentFixture<MembraneTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembraneTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembraneTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
