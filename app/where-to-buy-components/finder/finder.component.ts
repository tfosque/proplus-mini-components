import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    HostListener,
    AfterViewInit,
    NgZone,
} from '@angular/core';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '../../enums/breakpoints.enum';
import { Subscription } from 'rxjs';
import { LocationsService } from '../../services/locations.service';

@Component({
    selector: 'app-finder',
    templateUrl: './finder.component.html',
    styleUrls: ['./finder.component.scss'],
})
export class FinderComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('contentContainer')
    contentContainer!: ElementRef;
    contentContainerScroll!: CdkScrollable;
    @ViewChild('titleContainer') titleContainer!: ElementRef;
    @ViewChild('storesContainer')
    storesContainer!: ElementRef;
    @ViewChild('overflowIcon') overflowIcon!: ElementRef;

    readonly DEFAULT_DISTANCE = 25;

    layoutSub!: Subscription;
    searchLocationSub!: Subscription;
    searchFacetsSub!: Subscription;

    isMediumScreen = false;

    location = '';

    distance: number = this.DEFAULT_DISTANCE;

    // Content Model
    storeCategories!: {
        title: string;
        selected?: boolean;
    }[];
    distanceOptions!: {
        text: string;
        value: number;
    }[];

    // Determines if arrow icon should display
    isOverflowing!: boolean;
    contentEnd!: boolean;

    /**
     * Fire methods that check if the scroll indicator should be displayed
     */
    @HostListener('window:resize')
    runIndicatorChecks() {
        this.checkIfOverflowing();
        this.checkIfScrollEnded();
    }

    constructor(
        private locationsService: LocationsService,
        private scrollDispatcher: ScrollDispatcher,
        private ngZone: NgZone,
        private breakpointObserver: BreakpointObserver
    ) {}

    ngOnInit() {
        const layoutChanges$ = this.breakpointObserver.observe([
            Breakpoints.medium,
        ]);

        this.layoutSub = layoutChanges$.subscribe((result) => {
            if (result.matches) {
                this.isMediumScreen = true;
            } else {
                this.isMediumScreen = false;
            }
        });

        this.searchLocationSub = this.locationsService.searchLocation$.subscribe(
            (newSearchLocation) => {
                this.location = newSearchLocation;
            }
        );

        this.searchFacetsSub = this.locationsService.availableFacetSubj$.subscribe(
            (facets) => {
                this.storeCategories = facets;
            }
        );

        this.distanceOptions = [
            {
                text: '25 Miles',
                value: 25,
            },
            {
                text: '50 Miles',
                value: 50,
            },
            {
                text: '100 Miles',
                value: 100,
            },
        ];
    }

    ngOnDestroy() {
        this.scrollDispatcher.deregister(this.contentContainerScroll);
        this.searchFacetsSub.unsubscribe();
        this.searchLocationSub.unsubscribe();
        this.layoutSub.unsubscribe();
    }

    ngAfterViewInit() {
        setTimeout(() => this.checkIfOverflowing());
        this.contentContainerScroll = new CdkScrollable(
            this.contentContainer,
            this.scrollDispatcher,
            this.ngZone
        );

        this.contentContainerScroll.elementScrolled().subscribe(() => {
            this.checkIfScrollEnded();
            this.checkIfOverflowing();
        });
    }

    /**
     * Runs a check to see if titleContainer and brandsContainer is currently overflowing the contentContainer by comparing
     * the combinded widths.  Sets value of isOverflowing accordingly.
     */
    checkIfOverflowing() {
        if (this.storesContainer && this.contentContainer) {
            if (
                this.storesContainer.nativeElement.offsetWidth >
                this.contentContainer.nativeElement.offsetWidth
            ) {
                this.ngZone.run(() => {
                    this.isOverflowing = true;
                });
            } else if (this.isOverflowing) {
                this.ngZone.run(() => {
                    this.isOverflowing = false;
                });
            }
        }
    }

    /**
     * Runs a check to see if the user has scrolled all the way to the end of the popular brands container.
     */
    checkIfScrollEnded() {
        if (this.contentContainer) {
            const scrollWidth = this.contentContainer.nativeElement.scrollWidth;
            const scrollLeft = this.contentContainer.nativeElement.scrollLeft;
            const totalWidth =
                this.contentContainer.nativeElement.offsetWidth + scrollLeft;
            if (scrollWidth === totalWidth) {
                this.ngZone.run(() => {
                    this.contentEnd = true;
                });
            } else if (this.contentEnd) {
                this.ngZone.run(() => {
                    this.contentEnd = false;
                });
            }
        }
    }

    /**
     * When a facet changes, update its selected variable to match.
     */
    onFacetChange(facet: any) {
        facet.selected = !facet.selected;
        this.locationsService.facetsArray = this.storeCategories
            .filter((curCat) => {
                return curCat.selected;
            })
            .map((curCat) => curCat.title);
        this.locationsService.getLocations();
    }

    /**
     * Update the location param in the locationsService to match the new location value.  Then call for new results.
     */
    onLocationSubmit() {
        this.locationsService.getLocations(this.location);
    }

    /**
     * Update the distance param in the locationsService to match the new distance value.  Then call for new results.
     */
    onDistanceChange() {
        this.locationsService.range = this.distance;
        this.locationsService.getLocations();
    }
}
