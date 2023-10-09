import { BehaviorSubject, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { StoreState } from './store';

export class SimpleStore<T> {
    private readonly subject = new BehaviorSubject<StoreState<T>>({
        status: 'not-loaded',
    });

    get isLoaded() {
        return this.subject.value.status === 'loaded';
    }

    public get value() {
        const state = this.subject.value;
        return state.status === 'loaded' ? state.state : undefined;
    }
    public get state$() {
        return this.subject
            .asObservable()
            .pipe(flatMap((s) => (s.status === 'loaded' ? [s.state] : [])));
    }
    public setState(newState: T) {
        this.subject.next({ status: 'loaded', state: newState });
    }

    public setError(err: unknown) {
        this.subject.next({ status: 'error', error: err });
    }

    public listenTo(newState: Observable<T>) {
        newState.subscribe(
            (state) => this.setState(state),
            (error) => this.setError(error)
        );
    }
}
