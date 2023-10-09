import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CachingService<T> {
    private readonly store = new Map<string, CacheResult<T>>();
    constructor() {}

    public getOrAdd(key: string, getValue: () => T) {
        const result = this.store.get(key);
        if (isGood(result)) {
            return result.value;
        }
        return this.set(key, getValue());
    }

    public set(key: string, newValue: T) {
        const newRecord = { timeSet: new Date(), value: newValue };
        this.store.set(key, newRecord);
        return newValue;
    }

    public addMap(obj: Record<string, T>) {
        Object.entries(obj).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    public invalidatePrefix(prefix: string) {
        const keys = this.store.keys();
        for (const key of keys) {
            this.store.delete(key);
        }
    }
}

interface CacheResult<T> {
    timeSet: Date;
    value: T;
}

export function isGood<T>(r: CacheResult<T> | undefined): r is CacheResult<T> {
    if (!r) {
        return false;
    }
    //  Default cache length of 60 minutes
    const maxCacheMs = 1000 * 60 * 60;
    const now = new Date();
    const diff = now.getTime() - r.timeSet.getTime();
    const isCacheGood = diff > maxCacheMs ? false : true;
    return isCacheGood;
}
