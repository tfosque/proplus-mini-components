import { TestBed } from '@angular/core/testing';

import { CachingService } from './caching.service';

describe('CachingService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', async () => {
        const cache: CachingService<unknown> = TestBed.inject(CachingService);
        const result = cache.getOrAdd('x', () => 5);
        await expect(result).toBe(5);

        //  We should return the previous value
        const result2 = cache.getOrAdd('x', () => 6);
        await expect(result2).toBe(5);

        cache.addMap({
            'product/123': 123,
            'product/234': 234,
        });

        await expect(cache.getOrAdd('product/123', () => 1)).toBe(123);
        await expect(cache.getOrAdd('product/234', () => 1)).toBe(234);

        cache.invalidatePrefix('product');
        await expect(cache.getOrAdd('product/123', () => 4)).toBe(4);
        await expect(cache.getOrAdd('product/234', () => 5)).toBe(5);
    });
});
