import { Component, OnInit } from '@angular/core';
import { NguCarouselConfig } from '@ngu/carousel';
import { Image } from '../../global-classes/image';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

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
    selector: 'app-rotating-carousel',
    templateUrl: './rotating-carousel.component.html',
    styleUrls: ['./rotating-carousel.component.scss'],
})
export class RotatingCarouselComponent
    extends BrBaseContentComponent
    implements OnInit
{
    slides!: HeroSlide[];
    noForeground!: boolean;

    public carouselTileConfig: NguCarouselConfig = {
        grid: {
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 1,
            all: 0,
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
        load: 2,
        slide: 1,
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
                    const backgroundImageSrc = this.getImageUrl(
                        slideContent.backgroundImage
                    );
                    const foregroundImageSrc = this.getImageUrl(
                        slideContent.foregroundImage
                    );
                    const newHeroSlide: HeroSlide = {
                        title: slideContent.title,
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

                this.noForeground = !this.slides.some(
                    (slide) => slide.foregroundImage !== null
                );
            }
        }
    }
}
