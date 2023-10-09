import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';
import { Image } from '../../global-classes/image';

@Component({
    selector: 'app-image-list',
    templateUrl: './image-list.component.html',
    styleUrls: ['./image-list.component.scss'],
})
export class ImageListComponent
    extends BrBaseContentComponent
    implements OnInit
{
    heading!: string;
    imageListArray!: {
        image: Image;
        link: {
            text: string;
            url: string;
            isExternal: boolean;
        };
    }[];

    constructor() {
        super();
    }

    ngOnInit() {
        if (this.content) {
            this.heading = this.content.heading;
            if (
                this.content.imageListArray &&
                this.content.imageListArray.length
            ) {
                this.imageListArray = this.content.imageListArray.map(
                    (curItem: any) => {
                        const link = curItem.link;

                        link.url = this.getPrimaryDocumentPageLink(
                            link.url,
                            link.primaryDocument
                        );
                        const imageUrl = this.getImageUrl(curItem.image);
                        return {
                            image:
                                curItem.image && imageUrl
                                    ? new Image(
                                          imageUrl,
                                          curItem.link
                                              ? curItem.link.text
                                              : this.content?.heading,
                                          false
                                      )
                                    : null,
                            link,
                        };
                    }
                );
            }
        }
    }
}
