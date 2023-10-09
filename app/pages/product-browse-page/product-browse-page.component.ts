import {
    Component,
    OnDestroy,
    Optional,
    Inject,
    PLATFORM_ID,
} from '@angular/core';
import { ProductBrowseService } from '../../services/product-browse.service';
import { Observable, Subscription } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { FacetModalComponent } from '../../product-browse-components/facet-modal/facet-modal.component';
import { Title } from '@angular/platform-browser';
import { SeoService } from '../../services/seo.service';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { Facet } from '../../global-classes/facet';
import { BasePageComponent } from '../base-page/base-page.component';
import { BrPageComponent } from '@bloomreach/ng-sdk';
import { NavigationStateService } from '../../services/navigation-state.service';
import { PageTypes } from '../../enums/page-types.enum';

@Component({
    selector: 'app-product-browse-page',
    templateUrl: './product-browse-page.component.html',
    styleUrls: ['./product-browse-page.component.scss'],
})
export class ProductBrowsePageComponent
    extends BasePageComponent
    implements OnDestroy
{
    get pageType(): PageTypes {
        return PageTypes.browse;
    }

    currentUrlPath?: string;

    activeCateFilter?: Facet | null;

    resultsCount$?: Observable<number | null>;

    selectedFiltersSub?: Subscription;

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

    initPage() {
        super.initPage();

        // console.log('this.route.data', this.route.snapshot.data);

        let urlTree: UrlTree;
        let urlWithoutParams: string;

        // Early return, only run the page setup if this is the correct page to display.
        if (!this.isCorrectTemplate && !this.reRouted) return;

        urlTree = this.router.createUrlTree([]);
        urlWithoutParams = urlTree.root.children['primary'].segments
            .map((segment) => segment.path)
            .join('/');
        this.currentUrlPath = urlWithoutParams;

        this.resultsCount$ = this.productBrowseService.resultsCount$;

        this.selectedFiltersSub =
            this.productBrowseService.selectedFacets$.subscribe(
                (selectedFacets) => {
                    const activeCateFilterArray = (selectedFacets || []).filter(
                        (facet) => facet.type === 'cateFilter'
                    );

                    if (activeCateFilterArray && activeCateFilterArray.length) {
                        this.activeCateFilter = activeCateFilterArray[0];
                    } else {
                        this.activeCateFilter = null;
                    }
                }
            );

        /**
         * Subscribe to router events in case of a nav event to the same route.
         */
        // this.routerSub = this.router.events.subscribe((event) => {
        //     if (event instanceof NavigationEnd) {
        //         // Only run the page setup if this is the correct page to display.
        //         if (this.isCorrectTemplate || this.reRouted) {
        //             urlTree = this.router.createUrlTree([]);
        //             urlWithoutParams = urlTree.root.children['primary'].segments
        //                 .map((segment) => segment.path)
        //                 .join('/');
        //             this.currentUrlPath = urlWithoutParams;
        //         }
        //     }
        // });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.selectedFiltersSub) {
            this.selectedFiltersSub.unsubscribe();
        }

        this.seoService.destroyPrevLink();
        this.seoService.destroyNextLink();
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

    /**
     * Doing setup here because the resolver doesn't have a reference
     * of the loaded page before render
     */
}
