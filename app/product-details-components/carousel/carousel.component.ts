import {
    Component,
    OnInit,
    Input,
    ChangeDetectionStrategy,
    ViewChild,
} from '@angular/core';
import { NguCarouselConfig, NguCarousel } from '@ngu/carousel';
import { Image } from '../../global-classes/image';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
    @Input() images!: Image[];
    @Input() initialSlideIndex!: number;
    @ViewChild('carousel') carousel?: NguCarousel<any>;

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
    };

    constructor() {}

    ngOnInit() {
        setTimeout(() => {
            if (this.initialSlideIndex && this.carousel) {
                this.carousel.moveTo(this.initialSlideIndex, true);
            }
        }, 0);
    }
}
