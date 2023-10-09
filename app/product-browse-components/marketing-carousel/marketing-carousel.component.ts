import {
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
} from '@angular/core';
import { NguCarouselConfig } from '@ngu/carousel';
import { Image } from '../../global-classes/image';
import { isPlatformBrowser } from '@angular/common';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';
interface BannerAd {
    title: string;
    description: string;
    link: {
        url: string;
        text: string;
        isExternal: boolean;
    };
    backgroundImage: Image | null;
    foregroundImage: Image | null;
}
@Component({
    selector: 'app-marketing-carousel',
    templateUrl: './marketing-carousel.component.html',
    styleUrls: ['./marketing-carousel.component.scss'],
})
export class MarketingCarouselComponent
    extends BrBaseContentComponent
    implements OnInit, OnDestroy
{
    noForeground!: boolean;
    bannerAds: BannerAd[] = [];
    visibleAd?: BannerAd;
    id?: any;
    selectedAd: number = 0;
    isBrowser = false;
    public carouselTileConfig: NguCarouselConfig = {
        grid: {
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 1,
            all: 1,
        },
        speed: 500,
        point: {
            visible: true,
            hideOnSingleSlide: true,
        },
        touch: true,
        loop: true,
        velocity: 0.5,
        animation: 'lazy',
        easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
        RTL: false,
        interval: { timing: 4000, initialDelay: 1000 },
    };

    constructor(
        @Inject(PLATFORM_ID) platformId: string,
        private cd: ChangeDetectorRef
    ) {
        super();
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.bannerAds = this.loadBannerAds();
        this.visibleAd = this.getSelectedAd();
        if (this.isBrowser) {
            this.id = setInterval(() => {
                this.visibleAd = this.getSelectedAd();
                this.cd.detectChanges();
            }, 5000);
        }
    }

    ngOnDestroy(): void {
        if (this.id) {
            clearInterval(this.id);
        }
    }

    private loadBannerAds(): BannerAd[] {
        if (!this.content) {
            return [];
        }
        // Map CMS content for slides to slides array
        const slidesCMS = this.content.heroSlides;
        if (!slidesCMS || !slidesCMS.length) {
            return [];
        }
        return slidesCMS.map((slideContent: any) => {
            const backgroundImageSrc = this.getImageUrl(
                slideContent.backgroundImage
            );
            const foregroundImageSrc = this.getImageUrl(
                slideContent.foregroundImage
            );
            const newHeroSlide: BannerAd = {
                title: slideContent.title.replace(/[_+]/g, ''), //'_'
                description: slideContent.description,
                link: {
                    url: this.getPrimaryDocumentPageLink(
                        slideContent.link.url,
                        slideContent.link.primaryDocument
                    ),
                    text: slideContent.link.text,
                    isExternal: slideContent.link.isExternal,
                },
                backgroundImage:
                    slideContent.backgroundImage && backgroundImageSrc
                        ? new Image(
                              backgroundImageSrc,
                              slideContent.title,
                              false
                          )
                        : null,
                foregroundImage:
                    slideContent.foregroundImage && foregroundImageSrc
                        ? new Image(
                              foregroundImageSrc,
                              slideContent.title,
                              false
                          )
                        : null,
            };

            return newHeroSlide;
        });
    }
    private getSelectedAd(): BannerAd | undefined {
        const len = this.bannerAds.length;
        const i = this.selectedAd;
        this.selectedAd++;

        // let date = new Date();
        // let i = date.getMilliseconds() % len;
        return this.bannerAds[i % len];
    }
}
