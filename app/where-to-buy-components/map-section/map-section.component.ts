import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../global-classes/location';
import { Observable, of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '../../enums/breakpoints.enum';
import { map, tap } from 'rxjs/operators';

@Component({
    selector: 'app-map-section',
    templateUrl: './map-section.component.html',
    styleUrls: ['./map-section.component.scss'],
})
export class MapSectionComponent implements OnInit {
    private _labels: string = '';
    private _expanded: boolean = false;
    private _activeLabel: string = '';

    @Input() set labels(value: string) {
        this._labels = value;
    }
    @Input() set expanded(value: boolean) {
        this._expanded = value;
    }
    @Input() set activeLabel(value: string) {
        this._activeLabel = value;
    }
    @Output() activeLabelChange: EventEmitter<string> =
        new EventEmitter<string>();
    @Output() expandedChange: EventEmitter<boolean> =
        new EventEmitter<boolean>();

    get labels(): string {
        return this._labels;
    }

    get expanded(): boolean {
        return this._expanded;
    }

    get activeLabel(): string {
        return this._activeLabel;
    }
    readonly desktopLat = 41.850033;
    readonly desktopLong = -95.6500523;
    readonly desktopZoom = 3.6;
    readonly mobileLat = 41.850033;
    readonly mobileLong = -87.6500523;
    readonly mobileZoom = 2.3;
    readonly smallRangeMaxZoom = 11;
    readonly largeRangeMaxZoom = 10;
    readonly markerFontStatic = {
        weight: '700',
        family: 'Catamaran',
    };
    readonly markerIconsStatic = {
        selectedIcon: '../../../assets/images/finder-icon-small-selected.png',
        regularIcon: '../../../assets/images/finder-icon-small.png',
    };
    currentMaxZoom = 11;

    isLargeScreen$: Observable<boolean> = of(false);
    resultsList$: Observable<Location[]> = of([]);
    loading$: Observable<boolean> = of(true);

    constructor(
        private readonly locationsService: LocationsService,
        private readonly breakpointObserver: BreakpointObserver
    ) {}

    ngOnInit() {
        this.isLargeScreen$ = this.breakpointObserver
            .observe([Breakpoints.large])
            .pipe(map((result) => result.matches));

        this.resultsList$ = this.locationsService.locations$.pipe(
            tap(() => {
                this.currentMaxZoom =
                    this.locationsService.range === 25
                        ? this.smallRangeMaxZoom
                        : this.largeRangeMaxZoom;
            }),
            map((newLocations) => newLocations)
        );

        this.loading$ = this.locationsService.loading$;
    }

    /**
     * Takes in a string to set as the new active label.  Then emits an event to update the parent
     * activeLabel value.
     * @param newActiveLabel the new active label string
     */
    setActiveLabel(newActiveLabel: string) {
        this.activeLabel = newActiveLabel;
        this.activeLabelChange.emit(newActiveLabel);
    }

    /**
     * Toggle the is expanded variable and fire event emitter to update parent container.
     */
    toggleExpanded() {
        this.expandedChange.emit(!this.expanded);
    }
}
