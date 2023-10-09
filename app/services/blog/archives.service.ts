import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ArchivesService {
    private readonly currSelArchive = new BehaviorSubject<string>('');
    public readonly currSelArchive$ = this.currSelArchive.asObservable();
    constructor() {}

    setSelArchive(selection: string) {
        this.currSelArchive.next(selection);
    }
}
