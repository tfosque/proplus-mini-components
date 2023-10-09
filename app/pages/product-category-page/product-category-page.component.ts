import { Component } from '@angular/core';
import { PageTypes } from 'src/app/enums/page-types.enum';
import { BasePageComponent } from '../base-page/base-page.component';

@Component({
    selector: 'app-product-category-page',
    templateUrl: './product-category-page.component.html',
    styleUrls: ['./product-category-page.component.scss'],
})
export class ProductCategoryPageComponent extends BasePageComponent {
    showBottomSection = false;

    get pageType(): PageTypes {
        return PageTypes.category;
    }

    initPage() {
        super.initPage();

        const byApplicationCardsComponent = this.page?.getComponent(
            'by-application-cards'
        );

        this.showBottomSection = Boolean(
            byApplicationCardsComponent || this.isPreview
        );
    }
}
