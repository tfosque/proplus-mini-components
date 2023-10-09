import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Image } from '../../global-classes/image';
import { ModalService } from '../../services/modal.service';
import { ImageExpandedModalComponent } from '../image-expanded-modal/image-expanded-modal.component';

@Component({
    selector: 'app-image-gallery',
    templateUrl: './image-gallery.component.html',
    styleUrls: ['./image-gallery.component.scss'],
})
export class ImageGalleryComponent implements OnInit, OnChanges {
    @Input() images!: Image[];
    @Input() defaultImage!: string;
    @Input() productAdditionalOnErrorImage!: string;
    activeIndex = 0;

    constructor(private modalService: ModalService) {}

    ngOnInit() {}

    ngOnChanges() {
        this.activeIndex = 0;
    }

    /**
     * Updates the activeIndex that determines which image to show.
     * @param newActiveIndex the new active index.
     */
    setActiveIndex(newActiveIndex: number) {
        this.activeIndex = newActiveIndex;
    }

    /**
     * Open the ImageExpandedModal
     */
    openModal() {
        this.modalService.open<ImageExpandedModalComponent>(
            ImageExpandedModalComponent,
            {
                data: {
                    images: this.images,
                    initialSlideIndex: this.activeIndex,
                },
            }
        );
    }
}
