import { TestBed } from '@angular/core/testing';

import { LoggerService } from './logger.service';

xdescribe('LoggerService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: LoggerService = TestBed.inject(LoggerService);
        expect(service).toBeTruthy();
    });
});
