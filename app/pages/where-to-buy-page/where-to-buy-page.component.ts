import {
    Component,
    Inject,
    PLATFORM_ID,
    Optional,
    OnInit,
} from '@angular/core';
import { LocationsService } from '../../services/locations.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Breakpoints } from '../../enums/breakpoints.enum';
import { Title } from '@angular/platform-browser';
import { SeoService } from '../../services/seo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page.component';
import { BrPageComponent } from '@bloomreach/ng-sdk';
import { NavigationStateService } from 'src/app/services/navigation-state.service';
import { PageTypes } from 'src/app/enums/page-types.enum';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-where-to-buy-page',
    templateUrl: './where-to-buy-page.component.html',
    styleUrls: ['./where-to-buy-page.component.scss'],
})
export class WhereToBuyPageComponent
    extends BasePageComponent
    implements OnInit
{
    isLoading = true;
    requestingLocation = true;
    locationRequestFailed = false;
    readonly labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';

    // Determines whether to use mobile or desktop layout
    isLargeScreen$: Observable<boolean> = of(false);
    curSearchLocation$: Observable<string> = of('');
    isExpandedMap$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    );
    activeLabel = '';

    get pageType() {
        return PageTypes.whereToBuy;
    }

    constructor(
        titleService: Title,
        route: ActivatedRoute,
        router: Router,
        seoService: SeoService,
        navigationService: NavigationStateService,
        private readonly locationsService: LocationsService,
        private readonly breakpointObserver: BreakpointObserver,
        @Inject(PLATFORM_ID) platformId: string,
        @Optional() page?: BrPageComponent
    ) {
        super(
            titleService,
            seoService,
            navigationService,
            route,
            router,
            platformId,
            page
        );
    }

    ngOnInit() {
        super.ngOnInit();

        this.isLargeScreen$ = this.breakpointObserver
            .observe([Breakpoints.large])
            .pipe(map((result) => result.matches));
    }

    initPage(): void {
        super.initPage();

        // Early return, only run the page setup if this is the correct page to display.
        if (!this.isCorrectTemplate) return;

        this.initializeGeoLocation();

        this.curSearchLocation$ = this.locationsService.searchLocation$.pipe(
            map((curSearchLocation) => curSearchLocation)
        );
    }

    initializeGeoLocation() {
        if (
            typeof window !== 'undefined' &&
            window.navigator &&
            window.navigator.geolocation
        ) {
            window.navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.locationsService.getLocations(
                        '',
                        position.coords.latitude,
                        position.coords.longitude
                    );
                },
                (error) => {
                    this.locationRequestFailed = true;
                    this.isLoading = false;
                    this.locationsService.setLoading(false);
                    switch (error.code) {
                        case 1:
                            console.log('Permission Denied');
                            break;
                        case 2:
                            console.log('Position Unavailable');
                            break;
                        case 3:
                            console.log('Timeout');
                            break;
                    }
                },
                {
                    timeout: 5000,
                }
            );
        }
        this.isLoading = false;
    }

    /**
     * Set the activeLabel value that is passed to child params.
     * @param newActiveLabel new active label.
     */
    setActiveLabel(newActiveLabel: string) {
        this.activeLabel = newActiveLabel;
    }

    /**
     * Update the templates global is expanded value.
     * @param newValue new value of is expanded variable.
     */
    toggleIsExpanded(newValue: boolean) {
        this.isExpandedMap$.next(newValue);
    }
}
