export function defaultRecord<T extends object>(o: Partial<T>, d: T) {
    const result = {} as Required<T>;
    for (const k in d) {
        if (d.hasOwnProperty(k)) {
            const defaultValue: T[Extract<keyof T, string>] = d[k];
            const value: T[Extract<keyof T, string>] | undefined = o[k];
            result[k] = value !== undefined ? value : defaultValue;
        }
    }
    return result;
}

export type NullPartial<T> = {
    [P in keyof T]?: T[P] | null;
};

export type CommonKeys<T, U> = keyof T & keyof U;

export type MissingInRight<T, U> = {
    [P in Exclude<keyof T, CommonKeys<T, U>>]: T[P];
};

export type MissingInLeft<T, U> = {
    [P in Exclude<keyof U, CommonKeys<T, U>>]: U[P];
};

export type Merge<T, U> = {
    [P in CommonKeys<T, U>]: T[P] | U[P];
} &
    {
        [P in Exclude<keyof U, CommonKeys<T, U>>]: U[P];
    } &
    {
        [P in Exclude<keyof T, CommonKeys<T, U>>]: T[P];
    };

export type Merge3<T, U, V> = Merge<Merge<T, U>, V>;
export type Merge4<T, U, V, W> = Merge<Merge<T, U>, Merge<V, W>>;
export type Merge5<T, U, V, W, X> = Merge<Merge<Merge<T, U>, Merge<V, W>>, X>;
