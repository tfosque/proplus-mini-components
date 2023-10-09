import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserAdminPermNameDialogueComponent } from './user-admin-perm-name-dialogue.component';

describe('UserAdminPermNameDialogueComponent', () => {
  let component: UserAdminPermNameDialogueComponent;
  let fixture: ComponentFixture<UserAdminPermNameDialogueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAdminPermNameDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAdminPermNameDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
