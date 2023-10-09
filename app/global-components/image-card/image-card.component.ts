import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../../global-classes/image';

@Component({
    selector: 'app-image-card',
    templateUrl: './image-card.component.html',
    styleUrls: ['./image-card.component.scss'],
})
export class ImageCardComponent implements OnInit {
    @Input() title!: string;
    @Input() imageUrl!: string;
    @Input() link!: string;
    @Input() filters!: string[];
    @Input() cateFilter!: string;

    image?: Image | null;

    constructor() {}

    ngOnInit() {
        if (this.imageUrl) {
            this.image = new Image(this.imageUrl, this.title, false);
        }
    }

    /**
     * Workaround to determine if links are external by detecting protocol.
     */
    isExternal(): boolean {
        return this.link ? this.link.includes('://') : false;
    }
}
