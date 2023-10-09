import { Component, PLATFORM_ID, Inject, Optional } from '@angular/core';
import { ProductBrowseService } from '../../services/product-browse.service';
import { Observable, Subscription } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { FacetModalComponent } from '../../product-browse-components/facet-modal/facet-modal.component';
import {
    ActivatedRoute,
    Router,
    // NavigationEnd
} from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SeoService } from '../../services/seo.service';
import { siteRoot } from '../../app.constants';
import { Facet } from '../../global-classes/facet';
import { environment } from '../../../environments/environment';
import { BasePageComponent } from '../base-page/base-page.component';
import { NavigationStateService } from '../../services/navigation-state.service';
import { PageTypes } from '../../enums/page-types.enum';
import { BrPageComponent } from '@bloomreach/ng-sdk';

@Component({
    selector: 'app-search-page',
    templateUrl: './search-page.component.html',
    styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent extends BasePageComponent {
    searchTerm?: string | null;
    headingText?: string;
    activeCateFilter?: Facet | null;
    currentUrlPath?: string;
    resultsCount$?: Observable<number | null>;

    selectedFiltersSub!: Subscription;

    get pageType(): PageTypes {
        return PageTypes.content;
    }

    constructor(
        private productBrowseService: ProductBrowseService,
        private modalService: ModalService,
        titleService: Title,
        seoService: SeoService,
        navigationService: NavigationStateService,
        route: ActivatedRoute,
        router: Router,
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

    initPage(): void {
        super.initPage();
        // Add robots meta tag to head since we don't want the search page indexed.
        if (environment.prodServer) {
            this.seoService.createMetaRobots();
        }

        this.headingText = 'No Results for';
        this.resultsCount$ = this.productBrowseService.resultsCount$;
        this.searchTerm = this.route.snapshot.paramMap.get('searchTerm');

        this.selectedFiltersSub =
            this.productBrowseService.selectedFacets$.subscribe(
                (selectedFacets) => {
                    const activeCateFilterArray = (selectedFacets || []).filter(
                        (facet) => facet.type === 'cateFilter'
                    );
                    this.activeCateFilter = activeCateFilterArray.length
                        ? activeCateFilterArray[0]
                        : null;
                }
            );

        let urlTree = this.router.createUrlTree([]);
        let urlWithoutParams = urlTree.root.children['primary'].segments
            .map((segment) => segment.path)
            .join('/');
        this.currentUrlPath = urlWithoutParams;

        this.productBrowseService.searchTerm = this.searchTerm || null;

        /**
         * Subscribe to router events in case of a nav event to the same route.
         */
        // this.routerSub = this.router.events.subscribe((event) => {
        //     if (event instanceof NavigationEnd) {
        //         urlTree = this.router.createUrlTree([]);
        //         urlWithoutParams = urlTree.root.children['primary'].segments
        //             .map((segment) => segment.path)
        //             .join('/');
        //         this.currentUrlPath = urlWithoutParams;
        //         this.searchTerm =
        //             this.route.snapshot.paramMap.get('searchTerm');
        //          this.productBrowseService.searchTerm = this.searchTerm || null;
        //     }
        // });
    }

    setCanonicalLink() {
        this.seoService.createLinkForCanonicalURL(`${siteRoot}/search`);
    }

    openFilterModal() {
        this.modalService.open<FacetModalComponent>(FacetModalComponent, {
            panelClass: 'modal__peek',
            data: {
                pageTitle: this.pageTitle,
                currentUrlPath: this.currentUrlPath,
            },
        });
    }
}
