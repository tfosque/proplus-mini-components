import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    OnChanges,
    SimpleChanges,
    HostListener,
    Output,
    EventEmitter,
} from '@angular/core';
import { Image } from '../../global-classes/image';
import { BrBaseComponent } from '../../core/BrBaseComponent';

@Component({
    selector: 'app-main-nav-mega-menu',
    templateUrl: './main-nav-mega-menu.component.html',
    styleUrls: ['./main-nav-mega-menu.component.scss'],
})
export class MainNavMegaMenuComponent
    extends BrBaseComponent
    implements OnInit, OnChanges
{
    @ViewChild('megaMenu') megaMenu?: ElementRef;
    @Output() navigated = new EventEmitter<boolean>();
    @Input() isActive!: boolean;
    @Input() menuActive!: boolean;
    @Input() title!: string;
    @Input() titleUrl!: string;
    @Input() titleIsExternal!: boolean;
    @Input() menuSections!: {
        title: string;
        isMarketingBlock?: boolean;
        links: {
            title: string;
            url: string;
            isExternal?: boolean;
            // tslint:disable-next-line: no-any
            parameters?: Record<string, any>;
        }[];
    }[];
    @Input() marketingBlock!: {
        imageSrc: string;
        title: string;
        textContent: string;
        isExternal: boolean;
        // tslint:disable-next-line: no-any
        primaryDocument: any;
        btnUrl: string;
        btnText: string;
    };

    marketingBlockImage?: Image | null;

    isVisible = false;
    overflowing = false;
    offsetLeft = 0;

    ngOnInit() {
        if (this.marketingBlock) {
            this.marketingBlockImage = this.marketingBlock.imageSrc
                ? new Image(
                      this.marketingBlock.imageSrc,
                      this.marketingBlock.title,
                      false
                  )
                : null;

            this.marketingBlock.btnUrl = this.getPrimaryDocumentPageLink(
                this.marketingBlock.btnUrl,
                this.marketingBlock.primaryDocument
            );
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.isActive) {
            if (this.isActive) {
                setTimeout(() => {
                    this.reposition();
                });
            }
        }
    }

    /**
     * Reset position vars on resize since we'll need to recheck.
     */
    @HostListener('window:resize')
    resetPosition() {
        this.overflowing = false;
        this.offsetLeft = 0;
    }

    /**
     * Check if the nav menu is overflowing off the right of the window.  If it is, set offset left
     * to amount it needs to move left to be in screen.
     */
    reposition() {
        if (this.megaMenu) {
            const clientRect =
                this.megaMenu.nativeElement.getBoundingClientRect();
            const rightPos = clientRect.left + clientRect.width;

            if (rightPos > window.outerWidth) {
                this.overflowing = true;
                this.offsetLeft = rightPos - window.outerWidth;
            }
        }

        this.isVisible = true;
    }

    /**
     * Emit navigated event when navigation clicked so we know to close the menus.
     */
    navigationClicked() {
        this.navigated.emit(true);
    }
}
