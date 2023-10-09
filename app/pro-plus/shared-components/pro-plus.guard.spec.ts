import { TestBed, inject } from '@angular/core/testing';

import { ProPlusGuard } from './pro-plus.guard';

xdescribe('ProPlusGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ProPlusGuard],
        });
    });

    it('should ...', inject([ProPlusGuard], (guard: ProPlusGuard) => {
        expect(guard).toBeTruthy();
    }));
});
