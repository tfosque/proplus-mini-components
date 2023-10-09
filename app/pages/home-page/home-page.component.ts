import { Component } from '@angular/core';
import { PageTypes } from '../../enums/page-types.enum';
import { BasePageComponent } from '../base-page/base-page.component';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent extends BasePageComponent {
    get pageType(): PageTypes {
        return PageTypes.home;
    }
}
