import { Component, ElementRef, Input, Optional } from '@angular/core';
import { NavigableContainerTypes } from '../../enums/navigable-container-types.enum';
import { ContentSectionTypes } from '../../enums/content-section-types.enum';
import { InPageNavItem } from '../../global-classes/in-page-nav-item';
import { ProductImp } from '../../global-classes/product-imp';
import { Image } from '../../global-classes/image';
import { BrBaseComponent } from '../../core/BrBaseComponent';
import { BrPageComponent } from '@bloomreach/ng-sdk';

@Component({
    selector: 'app-navigable-content-container',
    templateUrl: './navigable-content-container.component.html',
    styleUrls: ['./navigable-content-container.component.scss'],
})
export class NavigableContentContainerComponent extends BrBaseComponent {
    // Determines what type of container this is.  Predefined or dynamic.
    @Input() containerType!: NavigableContainerTypes;
    @Input() product?: ProductImp;
    @Input() navItems!: InPageNavItem[];
    @Input() brandLogo?: Image;

    // Expose to template
    NavigableContainerTypes = NavigableContainerTypes;
    ContentSectionTypes = ContentSectionTypes;

    isPreviewMode?: boolean;

    constructor(private $el: ElementRef, @Optional() page?: BrPageComponent) {
        super(page);
    }

    /**
     * Takes in an object with properties of the new active item and sets that item to be active.
     * @param _newActiveNavItem an object representing the new active section.
     */
    setActiveNavItem(
        _newActiveNavItem: {
            activeNavId: string;
            navigationHeight: number;
        } = { activeNavId: '', navigationHeight: 0 }
    ) {
        const { activeNavId, navigationHeight: offset } = _newActiveNavItem;
        const activeEl = this.$el.nativeElement.querySelector(
            `#${activeNavId}`
        );
        activeEl.style.scrollMarginTop = `${offset}px`;
        activeEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
        });
    }
}
