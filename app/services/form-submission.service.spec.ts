import { TestBed } from '@angular/core/testing';

import { FormSubmissionService } from './form-submission.service';

xdescribe('FormSubmissionService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: FormSubmissionService = TestBed.inject(
            FormSubmissionService
        );
        expect(service).toBeTruthy();
    });
});
