import { Component, Input, OnChanges } from '@angular/core';
import { NavigationStateService } from 'src/app/services/navigation-state.service';
import { PageTypes } from '../../enums/page-types.enum';

@Component({
    selector: 'app-page-component-rerouter',
    templateUrl: './page-component-rerouter.component.html',
    styleUrls: ['./page-component-rerouter.component.scss'],
})
export class PageComponentRerouterComponent implements OnChanges {
    @Input() pageName?: string;
    pageType?: PageTypes;
    // Expose for use in template
    pageTypes = PageTypes;

    constructor(protected navigationService: NavigationStateService) {}

    inPageName(value: string) {
        return this.pageName?.includes(value) ? value : null;
    }

    ngOnChanges() {
        if (this.inPageName(PageTypes.proPlusLanding)) {
            this.pageType = PageTypes.proPlusLanding;
        } else if (this.inPageName(PageTypes.home)) {
            this.pageType = PageTypes.home;
        } else if (this.inPageName(PageTypes.brandLanding)) {
            this.pageType = PageTypes.brandLanding;
        } else if (this.inPageName(PageTypes.browse)) {
            this.pageType = PageTypes.browse;
        } else if (this.inPageName(PageTypes.category)) {
            this.pageType = PageTypes.category;
        } else if (
            this.inPageName(PageTypes.content) ||
            this.inPageName(PageTypes.pageNotFound)
        ) {
            this.pageType = PageTypes.content;
        } else if (this.inPageName(PageTypes.productDetails)) {
            this.pageType = PageTypes.productDetails;
        } else if (this.inPageName(PageTypes.whereToBuy)) {
            this.pageType = PageTypes.whereToBuy;
        }
    }
}
