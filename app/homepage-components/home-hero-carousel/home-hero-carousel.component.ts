import { Component, Input, OnInit } from '@angular/core';
import { Component as BrComponent, Page } from '@bloomreach/spa-sdk';
import { NguCarouselConfig } from '@ngu/carousel';
import { Image } from '../../global-classes/image';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

interface HeroSlide {
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
    selector: 'app-home-hero-carousel',
    templateUrl: './home-hero-carousel.component.html',
    styleUrls: ['./home-hero-carousel.component.scss'],
})
export class HomeHeroCarouselComponent
    extends BrBaseContentComponent
    implements OnInit
{
    @Input() component!: BrComponent;
    @Input() page!: Page;

    slides!: HeroSlide[];
    noForeground!: boolean;
    // public carouselTileConfig: NguCarouselConfig = {
    //     grid: { xs: 0, sm: 0, md: 2, lg: 0, all: 1 },

    //     interval: { timing: 4000, initialDelay: 1000 },
    // };

    public carouselTileConfig: NguCarouselConfig = {
        grid: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1, all: 0 },
        slide: 3,
        speed: 500,
        point: {
            visible: true,
            hideOnSingleSlide: true,
        },
        RTL: false,
        load: 2,
        velocity: 0.5,
        animation: 'lazy',
        touch: true,
        loop: true,
        easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
        interval: { timing: 4000, initialDelay: 1000 },
    };

    constructor() {
        super();
    }
    ngOnInit() {
        if (this.content) {
            // Map CMS content for slides to slides array
            const slidesCMS = this.content.heroSlides;

            if (slidesCMS && slidesCMS.length) {
                this.slides = slidesCMS.map((slideContent: any) => {
                    const bgImageUrl = this.getImageUrl(
                        slideContent.backgroundImage
                    );
                    const fgImageUrl = this.getImageUrl(
                        slideContent.foregroundImage
                    );
                    const newHeroSlide: HeroSlide = {
                        title: slideContent.title,
                        description: slideContent.description,
                        link: {
                            url: slideContent.link.url,
                            text: slideContent.link.text,
                            isExternal: slideContent.link.isExternal,
                        },
                        backgroundImage:
                            slideContent.backgroundImage && bgImageUrl
                                ? new Image(
                                      bgImageUrl,
                                      slideContent.title,
                                      false
                                  )
                                : null,
                        foregroundImage:
                            slideContent.foregroundImage && fgImageUrl
                                ? new Image(
                                      fgImageUrl,
                                      slideContent.title,
                                      false
                                  )
                                : null,
                    };

                    return newHeroSlide;
                });

                this.noForeground = !this.slides.some(
                    (slide) => slide.foregroundImage !== null
                );
            }
        }
    }
}
