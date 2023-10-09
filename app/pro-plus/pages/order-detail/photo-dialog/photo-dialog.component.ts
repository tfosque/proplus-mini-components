import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DTPhoto } from '../../../../pro-plus/model/order-detail-response';

@Component({
    selector: 'app-photo-dialog',
    templateUrl: './photo-dialog.component.html',
    styleUrls: ['./photo-dialog.component.scss'],
})
export class PhotoDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            imageUrl: string;
            array: DTPhoto[] | null;
            currentImage: number;
        }
    ) {}
    displayImage = this.data.imageUrl;

    ngOnInit() {
        // console.log(this.data.array)
    }

    goToLink(url: string) {
        window.open(url, '_blank');
    }

    leftArrowNavigation() {
        const array = this.data.array || [];
        if (this.data.currentImage > 0) {
            this.displayImage = array[this.data.currentImage--].largeUrl;
        } else {
            this.displayImage = array[array.length - 1].largeUrl;
            this.data.currentImage = array.length;
        }
    }

    rightArrowNavigation() {
        const array = this.data.array || [];
        if (this.data.currentImage <= array.length - 1) {
            this.displayImage = array[this.data.currentImage++].largeUrl;
        } else {
            this.displayImage = array[0].largeUrl;
            this.data.currentImage = 0;
        }
    }
}
