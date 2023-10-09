import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderlaymentVaporBarrierComponent } from './underlayment-vapor-barrier.component';

describe('UnderlaymentVaporBarrierComponent', () => {
  let component: UnderlaymentVaporBarrierComponent;
  let fixture: ComponentFixture<UnderlaymentVaporBarrierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnderlaymentVaporBarrierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnderlaymentVaporBarrierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
