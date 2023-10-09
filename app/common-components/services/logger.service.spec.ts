import { TestBed } from '@angular/core/testing';

import { LoggerService } from './logger.service';

xdescribe('LoggerService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', async () => {
        const service: LoggerService = TestBed.inject(LoggerService);
        await expect(service).toBeTruthy();
        await expect(2 + 2).toBe(4);
    });
});
