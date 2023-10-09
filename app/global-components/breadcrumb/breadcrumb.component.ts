import {
    Component,
    OnInit,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
} from '@angular/core';
import { ProductBrowseService } from '../../services/product-browse.service';
import { categoriesKey } from '../../app.constants';
import { Facet } from '../../global-classes/facet';
import { Subscription } from 'rxjs';
import { UserService } from '../../pro-plus/services/user.service';
import { Router } from '@angular/router';
import { BrBaseComponent } from '../../core/BrBaseComponent';
import { BrPageComponent } from '@bloomreach/ng-sdk';
@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent
    extends BrBaseComponent
    implements OnInit, OnChanges, OnDestroy
{
    @Input() configuration: any;
    @Input() isProductPage?: boolean;
    @Input() isProductBrowsePage?: boolean;
    @Input() productName?: string;
    @Input() productBreadcrumb?: string[];
    @Input() extraBreadcrumb?: {
        title: string;
        facetId: string;
    };
    @Input() searchTerm?: string;

    cateFacets?: Facet[];

    facetGroupsSub?: Subscription;
    breadcrumbObject: {
        [key: string]: string;
    } = {};

    constructor(
        private productBrowseService: ProductBrowseService,
        public userService: UserService,
        public router: Router,
        @Optional() page?: BrPageComponent
    ) {
        super(page);
    }

    ngOnInit() {
        /**
         * Build out breadcrumb from provided configuration object.
         */
        if (this.configuration) {
            const { breadcrumb } = this.configuration;

            if (breadcrumb) {
                const breadcrumbKeys = Object.keys(breadcrumb);

                // Remove breadcrumbs that are from wildcard routes.
                breadcrumbKeys.forEach((curKey) => {
                    if (!curKey.includes('_any_')) {
                        this.breadcrumbObject[curKey] = breadcrumb[curKey];
                    }
                });
            }
        }

        /**
         * If this is a product browse page we also need to include the currently selected category facets in the breadcrumb.
         * These are retrieved from the product browse service.
         */
        if (this.isProductBrowsePage) {
            this.facetGroupsSub =
                this.productBrowseService.facetGroups$.subscribe(
                    (facetGroups) => {
                        if (facetGroups && facetGroups.length) {
                            const cateFacetGroup = facetGroups.find(
                                (curGroup) => {
                                    if (curGroup) {
                                        return curGroup.title === categoriesKey;
                                    }

                                    return false;
                                }
                            );

                            if (cateFacetGroup && cateFacetGroup.facets) {
                                this.cateFacets = cateFacetGroup.facets.filter(
                                    (facet) =>
                                        (facet.isParentFacet ||
                                            facet.selected) &&
                                        !facet.permanent
                                );
                            } else {
                                this.cateFacets = [];
                            }
                        }
                    }
                );
        }
    }
    async navigateHome() {
        const info = await this.userService.getSessionInfo();
        if (info && this.userService.isLoggedIn) {
            await this.router.navigate(['/proplus/home']);
        } else {
            await this.router.navigate(['/']);
        }
    }

    ngOnDestroy() {
        if (this.facetGroupsSub) {
            this.facetGroupsSub.unsubscribe();
        }
    }

    trimString(text: string, maxLength: number) {
        if (!text || !text.length || text.length <= maxLength) {
            return text;
        } else {
            return `${text.substring(0, maxLength)}...`;
        }
    }

    /**
     * Update the breadcrumb on any change to guarentee that it will render correctly.
     */
    ngOnChanges() {
        if (this.configuration) {
            this.breadcrumbObject = {};

            const { breadcrumb } = this.configuration;

            if (breadcrumb) {
                const breadcrumbKeys = Object.keys(breadcrumb);
                breadcrumbKeys.forEach((curKey) => {
                    if (!curKey.includes('_any_')) {
                        this.breadcrumbObject[curKey] = breadcrumb[curKey];
                    }
                });
            }
        }
    }
}
