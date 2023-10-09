import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-image-card-section',
    templateUrl: './image-card-section.component.html',
    styleUrls: ['./image-card-section.component.scss'],
})
export class ImageCardSectionComponent implements OnInit {
    @Input() isSubSection!: boolean;
    @Input() title!: string;
    @Input() imageCards!: any[];

    constructor() {}

    ngOnInit() {}
}
