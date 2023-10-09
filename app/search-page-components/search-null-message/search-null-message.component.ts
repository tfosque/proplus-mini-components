import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

@Component({
    selector: 'app-search-null-message',
    templateUrl: './search-null-message.component.html',
    styleUrls: ['./search-null-message.component.scss'],
})
export class SearchNullMessageComponent
    extends BrBaseContentComponent
    implements OnInit {
    searchNullMessageSubHeader?: string;
    searchNullHelpText?: string;
    searchNullEmailLink?: string;
    searchNullFinderLink?: string;
    searchNullEmailLinkText?: string;
    searchNullFinderLinkText?: string;

    searchNullTipsArray?: string[];

    constructor(
    ) {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.searchNullMessageSubHeader = this.content.header;
            this.searchNullHelpText = this.content.helpText;
            this.searchNullEmailLinkText = this.content.emailText;
            this.searchNullEmailLink = this.content.emailAddress;
            this.searchNullFinderLinkText = this.content.storeText;
            this.searchNullFinderLink = '/find-a-store';

            this.searchNullTipsArray = this.content.tips;
        }
    }
}
