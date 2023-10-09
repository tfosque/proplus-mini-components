import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BasePageComponent } from '../base-page/base-page.component';
import { PageTypes } from 'src/app/enums/page-types.enum';

@Component({
    selector: 'app-contast-us-page',
    templateUrl: './contact-us-page.component.html',
    styleUrls: ['./contact-us-page.component.scss'],
})
export class ContactUsPageComponent
    extends BasePageComponent
    implements OnInit, OnDestroy
{
    routerSub!: Subscription;

    contactUsConfigValues: any;
    get pageType(): PageTypes {
        return PageTypes.content;
    }

    initPage() {
        super.initPage();

        const contactConfigComp = this.page?.getComponent(
            'contact-us-config',
            'contact-us-config'
        );

        if (contactConfigComp) {
            const contactConfigContentRef =
                contactConfigComp.getModels()?.document;
            const contactUsConfigDocument = this.page?.getContent(
                contactConfigContentRef
            );
            this.contactUsConfigValues = contactUsConfigDocument?.getData();
        }
    }
}
