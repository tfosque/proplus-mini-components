import {
    Component,
    OnInit,
    Input,
    ViewChild,
    TemplateRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuxiliaryImage } from '../../api-response-interfaces/product-sku';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component( {
    selector: 'app-video-gallery',
    templateUrl: './video-gallery.component.html',
    styleUrls: ['./video-gallery.component.scss'],
} )
export class VideoGalleryComponent implements OnInit {
    @Input() productImageVideoObj: AuxiliaryImage[] = [];
    @ViewChild( 'videoPlay' ) videoPlay?: TemplateRef<any>;
    public videos: AuxiliaryImage[] = [];

    public url: SafeResourceUrl = '';

    constructor(
        // TODO: this would be a good use of angular pipes
        public sanitizer: DomSanitizer,
        public videoDialog: MatDialog
    ) { }

    ngOnInit() {
        const list: any[] = [];
        const hasImagesOrVideos =
            this.productImageVideoObj && this.productImageVideoObj.length > 0;

        if ( hasImagesOrVideos ) {
            this.productImageVideoObj.forEach( ( item: AuxiliaryImage ) => {
                if ( item.videoUrl ) {
                    // only sanitize youtube videos
                    const evalUrl = item.videoUrl.includes( 'youtube' )
                        ? this.sanitizeUrl( item.videoUrl )
                        : item.videoUrl;
                    const vid = {
                        image:
                            item.image.length === 0
                                ? item.image
                                : this.getVideoImage( item.image ),
                        videoUrl: evalUrl,
                        type: this.getVideoType( item.videoUrl ),
                    };
                    list.push( vid );
                }
            } );
            this.videos = list;
        }
    }

    getVideoType( url: string ) {
        let type = '';
        if ( url.includes( 'youtube' ) ) {
            type = 'youtube';
        }
        if ( url.includes( '/video/' ) ) {
            type = 'mp4';
        }
        if ( url.includes( 'beaconroofingsupply' ) ) {
            type = 'https';
        }
        return type;
    }
    /**
     *
     * @param url string to pass as Url
     * !important Angular2 + needs to sanitizeUrl for iframes
     * https://www.w3resource.com/angular/security.php
     */
    sanitizeUrl( url: string ) {
        return this.sanitizer.bypassSecurityTrustResourceUrl( url );
    }

    getVideoImage( imageUrl: string ) {
        if (
            imageUrl.toLowerCase().startsWith( 'https://' ) ||
            imageUrl.toLowerCase().startsWith( 'http://' )
        ) {
            return imageUrl;
        } else {
            return `https://beaconproplus.com${imageUrl}`;
        }
    }

    videoClick( videoUrl: string ) {
        // var win = window.open();
        // if (!win) {
        //     return;
        // }
        // win.document.write(
        //     `<video width='1000' height='600' controls autoplay muted>` +
        //         `<source src='https://www.beaconproplus.com${videoUrl}' type='video/mp4' />` +
        //         `Your browser does not support the video tag.` +
        //     `</video>`
        // );
        if ( !this.videoPlay ) {
            return;
        }
        this.videoDialog.open( this.videoPlay, {
            id: 'videoPlay',
            width: '100%',
            height: 'auto',
            data: {
                source: videoUrl,
            },
        } );
    }
}
