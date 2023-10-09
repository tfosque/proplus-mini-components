import { Component, OnInit, OnDestroy } from '@angular/core';
import { Facet } from '../../global-classes/facet';
import { ProductBrowseService } from '../../services/product-browse.service';
import { Observable, Subscription } from 'rxjs';
import { FacetGroup } from '../../global-classes/facet-group';
import { Image } from '../../global-classes/image';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';
import { Reference } from '@bloomreach/spa-sdk';

@Component({
    selector: 'app-product-brand-callout',
    templateUrl: './product-brand-callout.component.html',
    styleUrls: ['./product-brand-callout.component.scss'],
})
export class ProductBrandCalloutComponent
    extends BrBaseContentComponent
    implements OnInit, OnDestroy
{
    brandsBrowseTitle?: string;
    facetGroups!: FacetGroup[];
    facetSub!: Subscription;

    selectedFacets$?: Observable<Facet[] | null>;

    brandsArray!: {
        brandImage: Image;
        brandName: string;
        brandFacet: string;
    }[];

    constructor(private productBrowseService: ProductBrowseService) {
        super();
    }

    /**
     * Call super init and initialize template variables.
     */
    ngOnInit() {
        super.ngOnInit();
        this.facetSub = this.productBrowseService.facetGroups$.subscribe(
            (facetGroups) => {
                this.facetGroups = facetGroups || [];
            }
        );
        if (this.content) {
            this.brandsArray = this.content.brandsArray.map(
                (curBrand: {
                    brandImage: Reference;
                    brandName: string;
                    brandFacet: string;
                }) => {
                    const imageUrl = curBrand?.brandImage
                        ? this.getImageUrl(curBrand?.brandImage)
                        : '';
                    return {
                        brandImage:
                            curBrand.brandImage && imageUrl
                                ? new Image(imageUrl, curBrand.brandName, false)
                                : null,
                        brandName: curBrand.brandName,
                        brandFacet: curBrand.brandFacet,
                    };
                }
            );
            this.brandsBrowseTitle = this.content.title;
            this.selectedFacets$ = this.productBrowseService.selectedFacets$;
        }
    }

    ngOnDestroy() {
        this.facetSub.unsubscribe();
    }

    /**
     * On click of a brand facet, add that facets id to the selected facets.
     * @param facetVal the ID of the selected brand facet.
     */
    onClick(facetVal: string) {
        const brandFacetGroup = this.facetGroups.find(
            (curGroup) => curGroup.title === 'Brand'
        );
        if (
            brandFacetGroup &&
            brandFacetGroup.facets &&
            brandFacetGroup.facets.length
        ) {
            const facetVar = brandFacetGroup.facets.find(
                (curFacet) => curFacet.value === facetVal
            );
            if (facetVar) {
                this.productBrowseService.addSelectedFacet(facetVar);
                this.productBrowseService.setProductList();
            }
        }
    }
}
