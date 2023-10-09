import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateActiveMenuItemComponent } from './template-active-menu-item.component';

describe('TemplateActiveMenuItemComponent', () => {
  let component: TemplateActiveMenuItemComponent;
  let fixture: ComponentFixture<TemplateActiveMenuItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateActiveMenuItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateActiveMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
