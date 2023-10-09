import { Component, OnDestroy } from '@angular/core';
import { PageTypes } from 'src/app/enums/page-types.enum';
import { BasePageComponent } from '../base-page/base-page.component';

@Component({
    selector: 'app-storm-plus',
    templateUrl: './storm-plus.component.html',
    styleUrls: ['./storm-plus.component.scss'],
})
export class StormPlusComponent extends BasePageComponent implements OnDestroy {
    get pageType(): PageTypes {
        return PageTypes.content;
    }
}
