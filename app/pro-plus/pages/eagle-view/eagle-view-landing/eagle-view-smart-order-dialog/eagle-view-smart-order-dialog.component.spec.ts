import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EagleViewSmartOrderDialogComponent } from './eagle-view-smart-order-dialog.component';

describe('EagleViewSmartOrderDialogComponent', () => {
  let component: EagleViewSmartOrderDialogComponent;
  let fixture: ComponentFixture<EagleViewSmartOrderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EagleViewSmartOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EagleViewSmartOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
