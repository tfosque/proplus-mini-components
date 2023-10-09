import { Component, OnInit, OnDestroy } from '@angular/core';
import { Image } from '../../global-classes/image';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '../../enums/breakpoints.enum';
import { BrBaseContentComponent } from '../../../app/core/BrBaseContentComponent';

@Component({
    selector: 'app-marketing-banner',
    templateUrl: './marketing-banner.component.html',
    styleUrls: ['./marketing-banner.component.scss'],
})
export class MarketingBannerComponent
    extends BrBaseContentComponent
    implements OnInit, OnDestroy
{
    alignment: string = 'left';
    colorOption: number = 0;

    alignmentOptions: { [alignment: string]: string } = {
        left: 'marketing-banner--left-align',
        right: 'marketing-banner--right-align',
    };
    colorOptions = [
        'margeting-banner--color-option1',
        'margeting-banner--color-option2',
        'margeting-banner--color-option3',
    ];

    isMediumScreen = false;

    layoutChangesMediumSub!: Subscription;

    bannerTitle?: string;
    bannerDescription?: string;
    bannerCTAText?: string;
    bannerCTAUrl?: string;
    bannerCTAIsExternal?: boolean;
    bannerSecondaryImage?: Image;
    bannerMainImage?: Image;

    constructor(private breakpointObserver: BreakpointObserver) {
        super();
    }

    ngOnInit() {
        if (this.content) {
            switch (this.content.colorOption) {
                case 'Gray':
                    this.colorOption = 1; // 0,1,2
                    break;
                case 'Dark Gray':
                    this.colorOption = 2; // 0,1,2
                    break;
                default:
                    this.colorOption = 0;
            }
            this.alignment = this.content.alignment
                ? this.content.alignment.toLowerCase()
                : 'left'; // left or right

            this.bannerTitle = this.content.bannerTitle;
            this.bannerDescription = this.content.bannerDescription;

            if (this.content.bannerCta) {
                this.bannerCTAText = this.content.bannerCta.text;
                this.bannerCTAUrl = this.getPrimaryDocumentPageLink(
                    this.content.bannerCta.url,
                    this.content.bannerCta.primaryDocument
                );
                this.bannerCTAIsExternal = this.content.bannerCta.isExternal;
            }

            if (this.content.mainImage) {
                const imageSrc = this.getImageUrl(this.content.mainImage);
                this.bannerMainImage =
                    this.content.mainImage && imageSrc
                        ? new Image(imageSrc, this.content.bannerTitle, false)
                        : undefined;
            }

            if (this.content.secondaryImage) {
                const imageSrc = this.getImageUrl(this.content.secondaryImage);
                this.bannerSecondaryImage =
                    this.content.secondaryImage && imageSrc
                        ? new Image(imageSrc, this.content.bannerTitle, false)
                        : undefined;
            }
        }

        const layoutChangesMedium$ = this.breakpointObserver.observe([
            Breakpoints.mediumHomepage,
        ]);

        this.layoutChangesMediumSub = layoutChangesMedium$.subscribe(
            (result) => {
                if (result.matches) {
                    this.isMediumScreen = true;
                } else {
                    this.isMediumScreen = false;
                }
            }
        );
    }

    ngOnDestroy() {
        this.layoutChangesMediumSub.unsubscribe();
    }
}
