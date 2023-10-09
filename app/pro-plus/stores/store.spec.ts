import { storeOf } from './store';

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
        incrementAge(p, by: number) {
            return { ...p, age: p.age + by };
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
