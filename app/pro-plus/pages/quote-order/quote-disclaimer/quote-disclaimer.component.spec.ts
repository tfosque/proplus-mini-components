import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteDisclaimerComponent } from './quote-disclaimer.component';

describe('QuoteDisclaimerComponent', () => {
  let component: QuoteDisclaimerComponent;
  let fixture: ComponentFixture<QuoteDisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteDisclaimerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
