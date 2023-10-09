import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    AfterViewInit,
    NgZone,
    Input,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
    ProductSkus,
    ProductBrowseService,
} from '../../services/product-browse.service';
// import { ProductImp } from '../../global-classes/product-imp';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
// import { ProductSku } from '../../global-classes/product-sku';
import { PageService } from 'src/app/services/page.service';
import { tap } from 'rxjs/operators';
import { UserService } from 'src/app/pro-plus/services/user.service';

@Component( {
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
} )
export class ProductListComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild( 'resultsContainer' )
    resultsContainer?: ElementRef;
    @Input() isSearch!: boolean;

    // An offset to determine at what point in scrolling lazy loading should occur.
    private readonly _lazyLoadOffset = 200;

    public lazyLoadTotal!: number;
    public lazyLoadCount = 0;

    public isLoading = true;
    public isLoadingMore = false;
    private isLoadingButtonVisible = false;
    public loadMoreButtonClicked = false;

    private showgotoTopButton = false;

    private scrollDispSub!: Subscription;

    private resultsCountSub!: Subscription;

    public resultsCount = 0;

    // private productListSub!: Subscription;

    private isLoadingSub!: Subscription;

    private isLoadingMoreSub!: Subscription;

    private routerSub!: Subscription;

    public productList = new BehaviorSubject<ProductSkus[]>( [] );

    get isNavigating() {
        return this.pageService.isPageLoading$;
    }

    constructor(
        private readonly pageService: PageService,
        private readonly productBrowseService: ProductBrowseService,
        private readonly scrollDispatcher: ScrollDispatcher,
        private readonly ngZone: NgZone,
        private readonly userService: UserService
    ) { }

    ngOnInit() {
        this.productBrowseService.productList$
            .pipe(
                tap( ( t: any ) => {
                    this.createCards( t );
                } )
            )
            .subscribe(
                result => {
                    console.log( { result } )
                },
                error => {
                    console.log( { error } )
                },
                () => { console.log( 'complted productBrowseService...' ) }
            );

        this.resultsCountSub =
            this.productBrowseService.resultsCount$.subscribe(
                ( resultsCount ) => {
                    this.resultsCount = resultsCount || 0;
                }
            );

        this.isLoadingSub = this.productBrowseService.isLoading$.subscribe(
            ( isLoading ) => {
                this.isLoading = isLoading;
            }
        );

        this.isLoadingMoreSub =
            this.productBrowseService.isLoadingMore$.subscribe(
                ( isLoadingMore ) => {
                    this.isLoadingMore = isLoadingMore;
                }
            );

        this.lazyLoadCount = this.productBrowseService.lazyLoadCount;
        this.lazyLoadTotal = this.productBrowseService.lazyLoadTotal;
    }

    ngOnDestroy() {
        // this.productListSub?.unsubscribe();
        this.resultsCountSub?.unsubscribe();
        this.isLoadingSub?.unsubscribe();
        this.isLoadingMoreSub?.unsubscribe();
        this.scrollDispSub?.unsubscribe();
        this.routerSub?.unsubscribe();
        this.isLoadingButtonVisible = false;
        this.loadMoreButtonClicked = false;
        this.showgotoTopButton = false;
    }

    ngAfterViewInit() {
        setTimeout( () => {
            const resultsContainer = this.resultsContainer;
            if ( !resultsContainer ) {
                return;
            }
            /**
             * On scroll check if viewport is beyond the specified offset from the bottom of the results container.
             * If the viewport is and results are not currently being loaded and there are more results to load and
             * we have not met the lazy load threshold then initiated load more results from service.
             */
            this.scrollDispSub = this.scrollDispatcher
                .ancestorScrolled( resultsContainer )
                .subscribe( () => {
                    const elementTop = resultsContainer.nativeElement.offsetTop;
                    const elementBottom =
                        elementTop +
                        resultsContainer.nativeElement.offsetHeight;
                    const windowTop = window.pageYOffset;
                    const windowBottom = windowTop + window.innerHeight;
                    this.ngZone.run( () => {
                        this.lazyLoadCount =
                            this.productBrowseService.lazyLoadCount;
                    } );

                    if (
                        !this.isLoading &&
                        !this.isLoadingMore &&
                        this.productList.value.length < ( this.resultsCount || 0 ) &&
                        windowBottom + this._lazyLoadOffset > elementBottom &&
                        this.lazyLoadCount < this.lazyLoadTotal
                    ) {
                        this.isLoadingMore = true;
                        this.ngZone.run( () => {
                            this.loadMoreResults();
                        } );
                    }

                    // when to show goto button:
                    // product list is over 24 and lazy load count == total
                    this.showgotoTopButton =
                        this.productList &&
                        this.productList.value.length > 24 &&
                        this.lazyLoadCount === this.lazyLoadTotal;
                } );
        } );
    }

    async createCards( products: any ) {
        // check if logged out, then v3
        const isLoggedIn = await this.userService.getSessionInfo();
        console.log( { isLoggedIn } )
        //
        let baseImgUrl = '';
        let resizeFallbackImg = '';
        let hero = ''
        let swatch = ''
        let itemNumber = ''
        let productName = ''
        let productOnErrorImage = ''

        //
        const resultCards = products.map( ( product: any ) => {
            // Add brand, and heroImages to skuList cand card
            console.log( { product } )
            const hasProduct = product.productOnErrorImage; // REVIEW 
            if ( !hasProduct ) return;

            if ( isLoggedIn ) {
                baseImgUrl = 'https://beaconproplus.com';
                resizeFallbackImg = product.productOnErrorImage.replace( '_small', '' );
                hero = product.currentSKU?.itemImage;
                swatch = product.currentSKU?.swatchImage;
                itemNumber = product.currentSKU?.itemNumber;
                productName = product.productName;
                productOnErrorImage = baseImgUrl + resizeFallbackImg;
            } else {
                baseImgUrl = 'https://static.becn.com/insecure/plain';
                resizeFallbackImg = product.productOnErrorImage.replace( '_small', '' );
                hero = product.productImage.replace( '_small', '' );
                swatch = product.productImage.replace( '_small', '_swatch' );
                itemNumber = 'not set BE'; // TODO 
                productName = product.productName;
                productOnErrorImage = baseImgUrl + resizeFallbackImg;
            }


            //
            let Card = product.skuList.find( ( sku: any ) => sku.itemNumber === itemNumber );

            // Add images with urls
            Card = {
                ...product,
                productOnErrorImage,
                itemNumber,
                image: {
                    hero: baseImgUrl + hero, swatch: baseImgUrl + swatch
                }
            }

            // Add Brand and images, productName, and ErrorImage to Skus
            // this allows for selections to change to active image when clicked
            const updatedSkus = product.skuList.map( ( f: any ) => {
                f.brand = product.brand;
                f.productName = productName // REVIEW which product name
                f.productOnErrorImage = productOnErrorImage;
                f.image = { hero: baseImgUrl + f.itemImage, swatch: baseImgUrl + f.swatchImage }
                //             
                return f;
            } )
            return {
                card: Card,
                skus: updatedSkus
            }
        } )
        this.productList.next( resultCards )

    }

    /**
     * Call the loadMoreResults function of the productBrowseService.
     */
    private loadMoreResults() {
        this.productBrowseService.loadMoreResults();
    }

    /**
     * Call the loadRemainingResults function of the productBrowseService.
     */
    public setGotoButtonStyles( gotoTopButtonElement: HTMLElement ) {
        let newStyles = {
            top: this.findTopForGotoButton( gotoTopButtonElement ),
            bottom: this.isLoadingButtonVisible ? 'auto' : 0,
            display: this.showgotoTopButton ? 'block' : 'none',
        };
        // double check to make sure top and bottom are not auto
        if ( newStyles['top'] === 'auto' && newStyles['bottom'] === 'auto' ) {
            newStyles = {
                top: 'auto',
                bottom: 0,
                display: this.showgotoTopButton ? 'block' : 'none',
            };
        }
        // make sure both are not auto make bottom auto
        if ( newStyles['top'] !== 'auto' && newStyles['bottom'] !== 'auto' ) {
            newStyles = {
                top: this.findTopForGotoButton( gotoTopButtonElement ),
                bottom: 'auto',
                display: this.showgotoTopButton ? 'block' : 'none',
            };
        }
        return newStyles;
    }
    /**
     * scroll to top of the page
     */
    public gotoTop(): void {
        window.scroll( 0, 0 );
    }
    /**
     * find where the top of the load more button should be
     */
    private findTopForGotoButton( gotoTopButtonElement: HTMLElement ): string {
        const resultsContainer = this.resultsContainer;
        if ( !resultsContainer ) {
            return 'auto';
        }
        if ( gotoTopButtonElement ) {
            // check if bottom of list view is there
            const resultsContainerPosition = this.getPosition(
                resultsContainer.nativeElement
            )['y'];
            const resultsContainerHeight =
                resultsContainer.nativeElement.offsetHeight;
            const differentOfHeight =
                resultsContainerPosition + resultsContainerHeight;
            if (
                differentOfHeight > 0 &&
                differentOfHeight < window.document.documentElement.clientHeight
            ) {
                return `${differentOfHeight - gotoTopButtonElement.offsetHeight
                    } + px`;
            }
        }

        return 'auto';
    }
    /**
     * Helper function to get an element's exact position
     * @param el element to get position of
     */
    private getPosition( el: any ) {
        let xPos = 0;
        let yPos = 0;

        while ( el ) {
            if ( el.tagName === 'BODY' ) {
                // deal with browser quirks with body/window/document and page scroll
                const xScroll =
                    el.scrollLeft || document.documentElement.scrollLeft;
                const yScroll =
                    el.scrollTop || document.documentElement.scrollTop;

                xPos += el.offsetLeft - xScroll + el.clientLeft;
                yPos += el.offsetTop - yScroll + el.clientTop;
            } else {
                // for all other non-BODY elements
                xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
                yPos += el.offsetTop - el.scrollTop + el.clientTop;
            }

            el = el.offsetParent;
        }
        return {
            x: xPos,
            y: yPos,
        };
    }
    /**
   * helper function to see if element is fully visible in the y direction
   * @param el element being passed in
  //  */
    // private visibleY(el: any) {
    //   let rect = el.getBoundingClientRect();
    //   const top = rect.top, height = rect.height;
    //   el = el.parentNode;
    //   // Check if bottom of the element is off the page
    //   if (rect.bottom > document.documentElement.clientHeight) {
    //     return false;
    //   }
    //   // Check its within the document viewport
    //   if (top > document.documentElement.clientHeight) {
    //     return false;
    //   }
    //   do {
    //     rect = el.getBoundingClientRect();
    //     if (top <= rect.bottom === false) {
    //       return false;
    //     }
    //     // Check if the element is out of view due to a container scrolling
    //     if ((top + height) <= rect.top) {
    //       return false;
    //     }
    //     el = el.parentNode;
    //   } while (el !== window.document.body);
    //   return true;
    // }
}
