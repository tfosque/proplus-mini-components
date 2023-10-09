import {
    Component,
    Inject,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
} from '@angular/core';
import { Image } from '../../global-classes/image';
import { isPlatformBrowser } from '@angular/common';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';
export interface BannerAd {
    image?: Image | null;
    title?: string;
    textContent?: string;
    showContent?: boolean;
    btnText?: string;
    btnUrl?: string;
    isExternal?: boolean;
}

@Component({
    selector: 'app-marketing-block',
    templateUrl: './marketing-block.component.html',
    styleUrls: ['./marketing-block.component.scss'],
})
export class MarketingBlockComponent
    extends BrBaseContentComponent
    implements OnInit, OnDestroy
{
    bannerAds: BannerAd[] = [];
    visibleAd?: BannerAd;
    id?: any;
    selectedAd: number = 0;
    isBrowser = false;

    constructor(@Inject(PLATFORM_ID) platformId: string) {
        super();
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        if (this.content) {
            this.bannerAds = this.loadBannerAds();
            this.visibleAd = this.getSelectedAd();
            if (this.isBrowser) {
                this.id = setInterval(() => {
                    this.visibleAd = this.getSelectedAd();
                }, 5000);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.id) {
            clearInterval(this.id);
        }
    }

    private loadBannerAds(): any {
        if (this.content) {
            const imageSrc = this.getImageUrl(this.content.backgroundImage);
            return [
                {
                    image:
                        this.content.backgroundImage && imageSrc
                            ? new Image(imageSrc, this.content.title, false)
                            : null,
                    title: this.content.title,
                    textContent: this.content.content,
                    btnText: this.content.btnText,
                    btnUrl: this.getPrimaryDocumentPageLink(
                        this.content.btnUrl,
                        this.content.primaryDocument
                    ),
                    isExternal: this.content.isExternal,
                },
            ];
        }
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
