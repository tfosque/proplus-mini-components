import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';
import { Image } from '../../global-classes/image';

@Component({
    selector: 'app-brand-banner',
    templateUrl: './brand-banner.component.html',
    styleUrls: ['./brand-banner.component.scss'],
})
export class BrandBannerComponent
    extends BrBaseContentComponent
    implements OnInit
{
    brandBannerHeading?: string;
    brandBannerImage: Image | null = null;
    brandBannerCTA?: string;
    brandBannerCTAUrl?: string;
    brandBannerContent: string = '';
    isExternal?: boolean;

    constructor() {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.brandBannerHeading = this.content.title;
            const imageSrc = this.getImageUrl(this.content.backgroundImage);
            this.brandBannerImage =
                this.content.backgroundImage && imageSrc
                    ? new Image(imageSrc, this.content.title, false)
                    : null;
            this.brandBannerCTA = this.content.btnText;
            this.brandBannerCTAUrl = this.getPrimaryDocumentPageLink(
                this.content.btnUrl,
                this.content.primaryDocument
            );
            this.brandBannerContent = this.content.content.toString();
            this.isExternal = this.content.isExternal;
        }
    }
}
