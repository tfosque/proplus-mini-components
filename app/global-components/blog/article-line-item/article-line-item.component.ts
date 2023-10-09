import { Component, Input, OnInit } from '@angular/core';
import { BlogEntry } from '../../../services/blog/skyword.service';

@Component({
    selector: 'app-article-line-item',
    templateUrl: './article-line-item.component.html',
    styleUrls: ['./article-line-item.component.scss'],
})
export class ArticleLineItemComponent implements OnInit {
    @Input() articleInput$?: BlogEntry;
    constructor() {}

    ngOnInit() {}
}
