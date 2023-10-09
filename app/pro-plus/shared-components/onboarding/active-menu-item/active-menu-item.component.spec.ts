import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActiveMenuItemComponent } from './active-menu-item.component';

describe('ActiveMenuItemComponent', () => {
  let component: ActiveMenuItemComponent;
  let fixture: ComponentFixture<ActiveMenuItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveMenuItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
