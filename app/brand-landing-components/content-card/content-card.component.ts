import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../../global-classes/image';
import { ContentCardData } from '../content-card-section/content-card-section.types';

@Component({
    selector: 'app-content-card',
    templateUrl: './content-card.component.html',
    styleUrls: ['./content-card.component.scss'],
})
export class ContentCardComponent implements OnInit {
    image!: Image | null;
    heading!: string;
    category!: string;
    description!: string;
    url!: string;
    isExternal!: boolean;

    @Input() result!: ContentCardData;

    constructor() {}

    ngOnInit() {
        this.image = this.result.image;
        this.heading = this.result.heading;
        this.category = this.result.category;
        this.description = this.result.description;
        this.url = this.result.url;
        this.isExternal = this.result.isExternal;
    }
}
