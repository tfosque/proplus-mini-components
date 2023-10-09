import { TestBed } from '@angular/core/testing';

import { FacetsService } from './facets.service';

describe('FacetsService', () => {
  let service: FacetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
