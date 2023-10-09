import { Component } from '@angular/core';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

@Component({
    selector: 'app-contact-us-config',
    templateUrl: './contact-us-config.component.html',
    styleUrls: ['./contact-us-config.component.scss'],
})
export class ContactUsConfigComponent extends BrBaseContentComponent {
    constructor() {
        super();
    }
}
