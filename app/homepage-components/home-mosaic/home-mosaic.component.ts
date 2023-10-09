import { Component, OnInit } from '@angular/core';
import { Image } from '../../global-classes/image';
import { BrBaseContentComponent } from 'src/app/core/BrBaseContentComponent';

interface MosaicTile {
    tag?: string;
    title: string;
    description?: string;
    link: {
        text: string;
        url: string;
        isExternal: boolean;
    };
    image: Image;
}
@Component({
    selector: 'app-home-mosaic',
    templateUrl: './home-mosaic.component.html',
    styleUrls: ['./home-mosaic.component.scss'],
})
export class HomeMosaicComponent
    extends BrBaseContentComponent
    implements OnInit {
    imageTiles?: MosaicTile[];
    iconTiles?: MosaicTile[];

    constructor() {
        super();
    }

    ngOnInit() {
        // Map CMS content to angular content model.
        if (this.content) {
            if (this.content.imageTiles && this.content.imageTiles.length) {
                this.imageTiles = this.content.imageTiles.map(
                    (curTile: any) => {
                        const imageSrc = this.getImageUrl(curTile.image);
                        return {
                            tag: curTile.tag,
                            title: curTile.title,
                            description: curTile.description,
                            link: {
                                text: curTile.link.text,
                                url: this.getPrimaryDocumentPageLink(
                                    curTile.link.url,
                                    curTile.link.primaryDocument
                                ),
                                isExternal: curTile.link.isExternal,
                            },
                            image: curTile.image && imageSrc
                                ? new Image(
                                      imageSrc,
                                      curTile.title,
                                      false
                                  )
                                : null,
                        };
                    }
                );
            }

            if (this.content.iconTiles && this.content.iconTiles.length) {
                this.iconTiles = this.content.iconTiles.map((curTile: any) => {
                    const imageSrc = this.getImageUrl(curTile.image);
                    return {
                        tag: curTile.tag,
                        title: curTile.title,
                        link: {
                            text: curTile.link.text,
                            url: this.getPrimaryDocumentPageLink(
                                curTile.link.url,
                                curTile.link.primaryDocument
                            ),
                            isExternal: curTile.link.isExternal,
                        },
                        image: curTile.image && imageSrc
                            ? new Image(
                                  imageSrc,
                                  curTile.title,
                                  false
                              )
                            : null,
                    };
                });
            }
        }
    }
}
