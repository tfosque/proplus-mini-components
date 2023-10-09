import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuoteUploadComponent } from './quote-upload.component';

describe('QuoteUploadComponent', () => {
  let component: QuoteUploadComponent;
  let fixture: ComponentFixture<QuoteUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
