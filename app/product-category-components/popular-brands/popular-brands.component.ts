import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    HostListener,
    AfterViewInit,
    NgZone,
} from '@angular/core';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Image } from '../../global-classes/image';
import { BrBaseContentComponent } from '../../../app/core/BrBaseContentComponent';

@Component({
    selector: 'app-popular-brands',
    templateUrl: './popular-brands.component.html',
    styleUrls: ['./popular-brands.component.scss'],
})
export class PopularBrandsComponent
    extends BrBaseContentComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('contentContainer')
    contentContainer!: ElementRef;
    contentContainerScroll!: CdkScrollable;
    @ViewChild('titleContainer') titleContainer!: ElementRef;
    @ViewChild('brandsContainer')
    brandsContainer!: ElementRef;
    @ViewChild('overflowIcon') overflowIcon!: ElementRef;

    // Content Model
    title!: string;
    brandLinks!: BrandLogo[];

    // Determines if arrow icon should display
    isOverflowing!: boolean;
    contentEnd!: boolean;

    // Count to keep track of if all images have been loaded.
    imageLoadedCount = 0;

    displayedItems!: BrandLogo[];
    startIndex = 0;
    maxItems = 5;
    animationOffset = 0;

    needRotating = false;

    /**
     * Fire methods that check if the scroll indicator should be displayed
     */
    @HostListener('window:resize')
    runIndicatorChecks() {
        this.checkIfOverflowing();
        this.checkIfScrollEnded();
    }

    constructor(
        private scrollDispatcher: ScrollDispatcher,
        private ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.title = this.content.title;
            if (
                this.content.displayName &&
                this.content.displayName === 'All Popular Brands'
            ) {
                this.needRotating = true;
            }
            this.brandLinks = this.content.productBrandLinks.map(
                (curBrand: {
                    pageLink: string;
                    primaryDocument: any;
                    brandName: string;
                    brandImage: {
                        $ref: string;
                    };
                }) => {
                    const imageSrc = this.getImageUrl(curBrand.brandImage);

                    return {
                        imageSrc,
                        pageLink: this.getPrimaryDocumentPageLink(
                            curBrand.pageLink,
                            curBrand.primaryDocument
                        ),
                        brandName: curBrand.brandName,
                        brandImage:
                            curBrand.brandImage && imageSrc
                                ? new Image(imageSrc, curBrand.brandName, false)
                                : null,
                    };
                }
            );
        }
        this.brandLinks = this.brandLinks.filter((b) => b.brandImage);
    }

    ngOnDestroy() {
        this.scrollDispatcher.deregister(this.contentContainerScroll);
    }

    ngAfterViewInit() {
        this.contentContainerScroll = new CdkScrollable(
            this.contentContainer,
            this.scrollDispatcher,
            this.ngZone
        );
        // we need to call this on after view init
        // but then again call it on element scroll
        this.checkIfScrollEnded();
        this.checkIfOverflowing();
        // subscribe to scroll event to see if we need to show the arrow
        this.contentContainerScroll.elementScrolled().subscribe(() => {
            this.checkIfScrollEnded();
            this.checkIfOverflowing();
        });
    }

    /**
     * Increments the imageLoadedCount. If the imageLoadedCount equals the total number of images, fire the
     */
    imageLoaded() {
        this.imageLoadedCount++;

        if (this.imageLoadedCount === this.brandLinks.length) {
            this.checkIfOverflowing();
        }
    }

    /**
     * Runs a check to see if titleContainer and brandsContainer is currently overflowing the contentContainer by comparing
     * the combinded widths.  Sets value of isOverflowing accordingly.
     */
    checkIfOverflowing() {
        if (
            this.titleContainer &&
            this.brandsContainer &&
            this.contentContainer
        ) {
            if (
                this.titleContainer.nativeElement.offsetWidth +
                    this.brandsContainer.nativeElement.offsetWidth >
                this.contentContainer.nativeElement.offsetWidth
            ) {
                this.ngZone.run(() => {
                    this.isOverflowing = true;
                });
            } else if (this.isOverflowing) {
                this.ngZone.run(() => {
                    this.isOverflowing = false;
                });
            }
        }
    }

    /**
     * Runs a check to see if the user has scrolled all the way to the end of the popular brands container.
     */
    checkIfScrollEnded() {
        const scrollWidth = this.contentContainer.nativeElement.scrollWidth;
        const scrollLeft = this.contentContainer.nativeElement.scrollLeft;
        const totalWidth =
            this.contentContainer.nativeElement.offsetWidth + scrollLeft;
        if (scrollWidth === totalWidth) {
            this.ngZone.run(() => {
                this.contentEnd = true;
            });
        } else if (this.contentEnd) {
            this.ngZone.run(() => {
                this.contentEnd = false;
            });
        }
    }

    async startAnimation() {
        while (true) {
            //  Delay for 2 seconds
            await sleep(2000);
            //  Animate by incrementing animationOffset every 33 ms.
            for (let i = 0; i < 60; i++) {
                await sleep(33);
                this.animationOffset++;
            }
            //  Increment startIndex
            this.startIndex = (this.startIndex + 1) % this.brandLinks.length;
            this.animationOffset = 0;
            this.updateDisplayed();
        }
    }

    updateDisplayed() {
        const displayedItems = [];
        for (let i = 0; i < this.maxItems; i++) {
            const pickIndex = (i + this.startIndex) % this.brandLinks.length;
            displayedItems.push(this.brandLinks[pickIndex]);
        }
        this.displayedItems = displayedItems;
    }

    calculatedslideWidth() {
        const slideWidth = this.brandLinks.length * 2 * 225;
        return `${slideWidth}px`;
    }

    setAnimation() {
        const brandLength = this.brandLinks.length;
        var animation = '';
        if (brandLength >= 4 && brandLength <= 30) {
            animation = `scroll${brandLength} 40s linear infinite`;
        } else {
            animation = `scroll 40s linear infinite`;
        }
        return animation;
    }
}

function sleep(ms: number) {
    return new Promise<boolean>((ok, reject) => {
        setTimeout(() => {
            ok(true);
        }, ms);
    });
}

interface BrandLogo {
    pageLink: string;
    brandName: string;
    brandImage: Image;
}
