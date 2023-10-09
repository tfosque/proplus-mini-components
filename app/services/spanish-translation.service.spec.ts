import { TestBed } from '@angular/core/testing';

import { SpanishTranslationService } from './spanish-translation.service';

describe('SpanishTranslationService', () => {
  let service: SpanishTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpanishTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
