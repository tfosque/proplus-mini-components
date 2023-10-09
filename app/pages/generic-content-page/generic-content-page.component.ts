import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PageTypes } from '../../enums/page-types.enum';
import { BasePageComponent } from '../base-page/base-page.component';

@Component({
    selector: 'app-generic-content-page',
    templateUrl: './generic-content-page.component.html',
    styleUrls: ['./generic-content-page.component.scss'],
})
export class GenericContentPageComponent
    extends BasePageComponent
    implements OnInit, OnDestroy
{
    @Input() isPageNotFound!: boolean;

    // Determines if this is a two column layout
    isTwoColumn = false;

    get pageType(): PageTypes {
        return PageTypes.content;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    initPage() {
        super.initPage();

        const sidebarComponent = this.page?.getComponent('sidebar');

        this.isTwoColumn = !!sidebarComponent;
    }
}
