import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    NgZone,
    Output,
    EventEmitter,
    OnDestroy,
} from '@angular/core';
import { InPageNavItem } from '../../global-classes/in-page-nav-item';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { ProductImp } from '../../global-classes/product-imp';
import { Image } from '../../global-classes/image';
import { Subscription } from 'rxjs';
import { UserService } from '../../pro-plus/services/user.service';

@Component({
    selector: 'app-in-page-navigation',
    templateUrl: './in-page-navigation.component.html',
    styleUrls: ['./in-page-navigation.component.scss'],
})
export class InPageNavigationComponent implements OnInit, OnDestroy {
    @Input() navItems!: InPageNavItem[];
    @Input() product?: ProductImp;
    @Input() brandLogo?: Image;
    @Output() activeNavItem: EventEmitter<{
        activeNavId: string;
        navigationHeight: number;
    }> = new EventEmitter();
    @ViewChild('navStatic') navStatic?: ElementRef;
    @ViewChild('navSticky') navSticky?: ElementRef;

    scrollDispSub!: Subscription;
    isSticky = false;
    activeElementId?: string;
    public isLoggedIn = false;

    constructor(
        private readonly scrollDispatcher: ScrollDispatcher,
        private readonly ngZone: NgZone,
        private readonly user: UserService
    ) {}

    async ngOnInit() {
        /**
         * On scroll of ancestors set the isSticky value based on whether or not the navStatic element is
         * in the viewport.
         */

        const userInfo = await this.user.getSessionInfo();
        this.isLoggedIn = (userInfo && !!userInfo.profileId) || false;

        setTimeout(() => {
            const navSticky = this.navStatic;
            const navStatic = this.navStatic;
            if (!navSticky || !navStatic) {
                return;
            }

            this.scrollDispSub = this.scrollDispatcher
                .ancestorScrolled(navSticky)
                .subscribe(() => {
                    const elementTop =
                        navStatic.nativeElement.getBoundingClientRect().top;
                    const elementHeight = navStatic.nativeElement.offsetHeight;
                    const checkValue =
                        navSticky.nativeElement.offsetHeight - elementHeight;

                    if (elementTop <= checkValue && !this.isSticky) {
                        this.ngZone.run(() => {
                            this.isSticky = true;
                        });
                    } else if (elementTop > checkValue && this.isSticky) {
                        this.ngZone.run(() => {
                            this.isSticky = false;
                        });
                    }

                    /**
                     * If the sticky nav is active, check the element id located directly beneath the stick nav.
                     * set the active id to this element's id.  DEVELOPER NOTE: I'm somewhat unsure of performance
                     * of the elementFromPoint method.  Keep an eye on this.
                     */
                    if (this.isSticky) {
                        const navStickyBottom =
                            navSticky.nativeElement.getBoundingClientRect()
                                .top + navSticky.nativeElement.offsetHeight;
                        const newActiveElement = document.elementFromPoint(
                            0,
                            navStickyBottom
                        );

                        if (newActiveElement) {
                            const newActiveElementId = newActiveElement.id;
                            if (newActiveElementId !== this.activeElementId) {
                                this.ngZone.run(() => {
                                    this.activeElementId = newActiveElementId;
                                });
                            }
                        }
                    }
                });
        });
    }

    ngOnDestroy() {
        this.scrollDispSub?.unsubscribe();
    }

    /**
     * On any change of the routes fragment, attempt to find an element with that fragment as an id
     * and then scroll to its position.
     * @param newFragment new id of element to scroll to.
     */
    scrollToElement(newFragment: string) {
        const navSticky = this.navStatic;
        if (!navSticky) {
            return;
        }
        this.activeNavItem.emit({
            activeNavId: newFragment,
            navigationHeight: navSticky.nativeElement.offsetHeight,
        });
    }
}
