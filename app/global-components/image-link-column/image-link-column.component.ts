import { Component, OnDestroy, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';
import {
    CmsLinksService,
    URLInfo,
} from '../../common-components/services/cms-links.service';

@Component({
    selector: 'app-image-link-column',
    templateUrl: './image-link-column.component.html',
    styleUrls: ['./image-link-column.component.scss'],
})
export class ImageLinkColumnComponent
    extends BrBaseContentComponent
    implements OnInit, OnDestroy
{
    images: {
        imageTitle: string;
        pageLink: string;
        fullPageLink: URLInfo;
        imageUrl: string;
    }[] = [];

    constructor(private cmsService: CmsLinksService) {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.images = this.content.productBrandLinks.map((l: any) => {
                const { brandName: imageTitle, brandImage, pageLink } = l;
                const imageUrl = this.getImageUrl(brandImage);
                const fullPageLink = this.cmsService.getLink(pageLink);
                const isExternal = fullPageLink.isFullyQualified;
                return {
                    isExternal,
                    imageTitle,
                    pageLink,
                    fullPageLink,
                    imageUrl,
                };
            });
        }
    }

    ngOnDestroy() {}
}
