import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../pro-plus/services/user.service';
import {
    CmsLinksService,
    URLInfo,
} from '../../common-components/services/cms-links.service';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

@Component({
    selector: 'app-image-link-row',
    templateUrl: './image-link-row.component.html',
    styleUrls: ['./image-link-row.component.scss'],
})
export class ImageLinkRowComponent
    extends BrBaseContentComponent
    implements OnInit, OnDestroy
{
    images: {
        imageTitle: string;
        pageLink: string;
        fullPageLink: URLInfo;
        imageUrl: string;
    }[] = [];

    constructor(
        private cmsService: CmsLinksService,
        public readonly user: UserService
    ) {
        super();
    }

    async ngOnInit() {
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
