import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    ElementRef,
} from '@angular/core';
import { Location } from '../../global-classes/location';
import { LocationsService } from '../../services/locations.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '../../enums/breakpoints.enum';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-finder-results',
    templateUrl: './finder-results.component.html',
    styleUrls: ['./finder-results.component.scss'],
})
export class FinderResultsComponent implements OnInit, OnDestroy {
    private _labels: string = '';
    private _expanded: boolean = false;

    @Input() set labels(value: string) {
        this._labels = value;
    }
    @Input() set expanded(value: boolean) {
        this._expanded = value;
    }

    @Input() set activeLabel(value: string) {
        this.activeLabel$.next(value);
    }
    @Output() activeLabelChange: EventEmitter<string> = new EventEmitter();

    get labels(): string {
        return this._labels;
    }

    get expanded(): boolean {
        return this._expanded;
    }

    unsubscribe = new Subject();
    activeLabel$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    loading$!: Observable<boolean>;
    isLargeScreen$: Observable<boolean> = of(false);
    resultsList$: Observable<Location[]> = of([]);

    constructor(
        private locationsService: LocationsService,
        private breakpointObserver: BreakpointObserver,
        private $el: ElementRef
    ) {}

    ngOnInit() {
        this.isLargeScreen$ = this.breakpointObserver
            .observe([Breakpoints.large])
            .pipe(map((result) => result.matches));

        this.resultsList$ = this.locationsService.locations$.pipe(
            map((newLocations) => newLocations)
        );

        this.loading$ = this.locationsService.loading$;

        this.activeLabel$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((activeLabel) => {
                const activeEl = this.$el.nativeElement.querySelector(
                    `#result-block-${activeLabel}`
                );
                if (!activeEl) return;

                activeEl.scrollIntoView({});

                activeEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                });
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    /**
     * Takes in a string and returns a URI encoded version.
     * @param value value to be encoded
     */
    encodeUri(value: string): string {
        return encodeURIComponent(value);
    }

    /**
     * Takes in a string to set as the new active label.  Then emits an event to update the parent
     * activeLabel value.
     * @param newActiveLabel the new active label string
     */
    setActiveLabel(newActiveLabel: string) {
        this.activeLabel$.next(newActiveLabel);
        this.activeLabelChange.emit(newActiveLabel);
    }
}
