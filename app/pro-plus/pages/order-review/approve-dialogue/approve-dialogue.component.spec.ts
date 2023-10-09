import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApproveDialogueComponent } from './approve-dialogue.component';

describe('ApproveDialogueComponent', () => {
  let component: ApproveDialogueComponent;
  let fixture: ComponentFixture<ApproveDialogueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
