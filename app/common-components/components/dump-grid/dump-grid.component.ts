import { Component, Input } from '@angular/core';
import { UIAction } from '../../classes/action';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
    selector: 'app-dump-grid',
    templateUrl: './dump-grid.component.html',
    styleUrls: ['./dump-grid.component.scss'],
})
export class DumpGridComponent {
    // TODO (Luis Sardon, Steve Goguen, Tim Fosque): to review during regression
    // private _input: unknown | null | undefined = null;
    private _input = new BehaviorSubject<any>(null);
    public objectInfo = describe(null);

    @Input() maxDepth = 2;

    @Input()
    get input() {
        return this._input;
    }
    set input(newValue: any) {
        this._input.next(newValue);
        this.objectInfo = describe(newValue);
    }
    @Input() currentLevel = 0;

    public isManuallyExpanded = false;

    public get isExpanded(): boolean {
        if (this.isManuallyExpanded) {
            return true;
        } else if (this.maxDepth <= 1) {
            return false;
        }
        return true;
    }

    childDepth: number;

    constructor() {
        this.childDepth = this.maxDepth - 1;
    }

    get keys(): string[] {
        return this.objectInfo.keys || [];
    }

    public toggleExpanded() {
        this.isManuallyExpanded = !this.isManuallyExpanded;
        console.log('Expanded', this.isManuallyExpanded, this.input);
    }
}

// tslint:disable-next-line: no-any
function describe(i: any) {
    const t = typeof i;
    switch (t) {
        case 'undefined':
            return { type: 'simple', stringValue: '<undefined>' };
        case 'bigint':
            return { type: 'simple', stringValue: i.toString() };
        case 'string':
            return { type: 'simple', stringValue: i as string };
        case 'number':
            return { type: 'simple', stringValue: i.toString() };
        case 'boolean':
            return { type: 'simple', stringValue: i.toString() };
        case 'symbol':
            return { type: 'simple', stringValue: i.toString() };
        case 'function':
            return { type: 'simple', stringValue: '<function>' };
        case 'object':
            const o = i;
            if (o === null) {
                return { type: 'simple', stringValue: '<null>' };
            } else if (typeof o.then === 'function') {
                return { type: 'promise', promiseValue: o as Promise<unknown> };
            } else if (o instanceof Observable) {
                return { type: 'observable', promiseValue: o };
            } else if (o instanceof Component) {
                return { type: 'component', component: o as Component };
            } else if (o instanceof UIAction) {
                return { type: 'action', component: o as UIAction };
            } else if (o instanceof Date) {
                return { type: 'simple', stringValue: i.toString() };
            } else if (Array.isArray(o)) {
                const keys = getArrayKeys(i);
                const arr = i;
                return {
                    type: 'array',
                    keys: keys,
                    records: arr,
                };
            } else {
                return {
                    type: 'object',
                    keys: Object.keys(i),
                    objectValue: i as object,
                };
            }
    }
}

function getArrayKeys(array: unknown[]) {
    const keys = new Set<string>();
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        // tslint:disable-next-line: strict-type-predicates
        if (typeof e === 'object') {
            if (!e) {
                continue;
            }
            const o = e as object;
            Object.keys(o).forEach((k) => {
                keys.add(k);
            });
        }
    }

    return Array.from(keys);
}
