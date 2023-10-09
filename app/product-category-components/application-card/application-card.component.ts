import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../../global-classes/image';

@Component({
    selector: 'app-application-card',
    templateUrl: './application-card.component.html',
    styleUrls: ['./application-card.component.scss'],
})
export class ApplicationCardComponent implements OnInit {
    @Input() title!: string;
    @Input() imageSrc!: string;
    @Input() url!: string;
    image?: Image | null;

    constructor() {}

    ngOnInit() {
        this.image = this.imageSrc
            ? new Image(this.imageSrc, this.title, false)
            : null;
    }
}
