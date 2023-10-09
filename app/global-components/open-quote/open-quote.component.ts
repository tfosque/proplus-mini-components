import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

@Component({
    selector: 'app-open-quote',
    templateUrl: './open-quote.component.html',
    styleUrls: ['./open-quote.component.scss'],
})
export class OpenQuoteComponent
    extends BrBaseContentComponent
    implements OnInit
{
    quote?: string;
    author?: string;
    title?: string;

    constructor() {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.quote = this.content.quote;
            this.author = this.content.author;
            this.title = this.content.title;
        }
    }
}
