import { Observable, Subject } from 'rxjs';
import { scan, shareReplay, map } from 'rxjs/operators';

export type StoreState<T> =
    | { status: 'not-loaded' }
    | { status: 'loaded'; state: T }
    | { status: 'error'; error: unknown };

///////////////////////////////////////////////////////////////

export type ActionMessages<S, T> = {
    [K in keyof T]: T[K] extends (s: S, x: infer P) => S
        ? { type: K; payload: P }
        : never;
}[keyof T];

export type PostMethodType<S, M> = M extends (s: S, x: infer P) => S
    ? P
    : never;

export type PostMethod<S, M> = M extends (s: S, x: infer P) => S
    ? (payload: P) => void
    : never;

export type ActionMethods<S, T> = {
    [K in keyof T]: (payload: PostMethodType<S, T[K]>) => ActionMethods<S, T>;
};

export type Reducer<S, M> = (state: S, message: M) => S;
// tslint:disable-next-line: no-any
export type ReducerMap<S> = Record<string, Reducer<S, any>>;

export function makeReducer<S, T extends ReducerMap<S>>(
    initialState: S,
    fnCollection: T
): Reducer<S, ActionMessages<S, T>> {
    type M = ActionMessages<S, T>;
    return function (state: S, message: M | null): S {
        if (!message) {
            return state;
        }
        const fn = fnCollection[message.type];
        if (!fn) {
            return state;
        }
        const payload = message.payload;
        const newState = fn(state, payload);
        // console.log('Message:', message.type, { payload, newState });
        return newState;
    };
}

export interface IStore<S, T> {
    readonly dispatch: ActionMethods<S, T>;
    readonly value: S;
    getState(): Observable<S>;
}

export interface IMappedStore<S, S2, T> {
    readonly dispatch: ActionMethods<S, T>;
    value: S2;
    getState(): Observable<S2>;
}

export function makeStore<S, T extends ReducerMap<S>>(
    initialState: S,
    fnCollection: T
): IStore<S, T> {
    type M = ActionMessages<S, T>;

    const reducer = makeReducer(initialState, fnCollection);

    let stateValue = initialState;
    const messages$ = new Subject<M>();
    const state$ = messages$
        .asObservable()
        .pipe(scan(reducer, initialState), shareReplay(1));

    state$.subscribe((newState) => {
        stateValue = newState;
    });

    const poster = makePoster();

    return {
        get value(): S {
            return stateValue;
        },

        getState(): Observable<S> {
            return state$;
        },
        dispatch: poster,
    };

    function makePoster(): ActionMethods<S, T> {
        type ReturnType = ActionMethods<S, T>;
        const methods = {} as ReturnType;

        // tslint:disable-next-line: forin
        for (const k in fnCollection) {
            // if (fnCollection.hasOwnProperty(k)) {
            type K = keyof T;
            type MT = ReturnType[K];
            type P = PostMethodType<S, T[K]>;
            const f: MT = function (payload: P): ReturnType {
                // console.log('Payload', { k, payload });
                const p = ({
                    type: k,
                    payload: payload,
                } as unknown) as ActionMessages<S, T>;
                messages$.next(p);
                return methods;
            };
            methods[k] = f;
            // }
        }
        return methods;
    }
}

// tslint:disable-next-line: no-any
export class Store<S, T extends Record<string, any>> {
    store: IStore<S, T>;
    constructor(initialState: S, constr: { new (): T }) {
        this.store = makeStore(initialState, new constr());
    }

    get value() {
        return this.store.value;
    }
    getState() {
        return this.store.getState();
    }
    get dispatch() {
        return this.store.dispatch;
    }
}

class StoreInt<S, T extends ReducerMap<S>> {
    store: IStore<S, T>;
    constructor(initialState: S, fnCollection: T) {
        this.store = makeStore(initialState, fnCollection);
    }

    get value() {
        return this.store.value;
    }
    getState() {
        return this.store.getState();
    }
    get dispatch() {
        return this.store.dispatch;
    }

    map<S2>(f: (value: S) => S2): IMappedStore<S, S2, T> {
        const store = this;
        return {
            dispatch: store.dispatch,
            get value() {
                return f(store.value);
            },
            getState() {
                return store.getState().pipe(map(f));
            },
        };
    }
}

export function storeOf<SI>(initialState: SI) {
    type S = Readonly<SI>;
    return {
        defineReducers<T extends ReducerMap<S>>(r: T): T {
            return r;
        },
        createStore<T extends ReducerMap<S>>(r: T): StoreInt<S, T> {
            return new StoreInt<S, T>(initialState, r);
        },
    };
}

export module Examples {
    export const r = storeOf(0).createStore({
        incr(x, y: number) {
            return x + y;
        },
        addLength(x, s: string) {
            return x + s.length;
        },
    });

    export const person = storeOf({
        first: '',
        last: '',
        age: 0,
        journal: ['created'],
    }).createStore({
        incrementAge(p, y: number) {
            return { ...p, age: p.age + 1 };
        },
        getMarried(p, newLastName: string) {
            const entry = `Changed name frmo ${p.last} to ${newLastName}`;
            return {
                ...p,
                last: newLastName,
                journal: p.journal.concat(entry),
            };
        },
    });
}
