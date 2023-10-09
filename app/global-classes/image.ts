import {
    ProplusImageRenditionTypes,
    ProplusImageRenditionTypesOptions,
} from '../enums/proplus-image-rendition-types.enum';
import { spliceString } from '../misc-utils/utility-methods';
import { environment } from '../../environments/environment';

/**
 * Class that should be used whenever image references are used.
 */
export class Image {
    isAddedToFavorites?: boolean;
    itemNumber?: string;
    src: string;
    altText: string;
    appendProPlusUrl: boolean;

    constructor(
        src: string,
        altText: string,
        appendProPlusUrl: boolean,
        imageServiceUrl = `${environment.cacheServiceRoot}${environment.imageServiceUri}`,
        cmsImageServiceUrl = environment.brxmSiteUrl,
        isAddedToFavorites = false,
        itemNumber = ''
    ) {

        // console.log( { itemNumber } )
        // console.log( { src } )
        this.isAddedToFavorites = isAddedToFavorites;
        this.itemNumber = itemNumber;
        this.appendProPlusUrl = appendProPlusUrl;
        src = !environment.local
            ? src.replace( /^.*\/(binaries\/content\/gallery\/.*$)/, '$1' )
            : src;

        /**
         * If we are appending the pro plus url, also strip off any rendition keys that may be on the images
         * src.  This will allow us to dynamically set the rendtion.
         */
        if ( this.appendProPlusUrl ) {
            const renditionKeys = Object.keys( ProplusImageRenditionTypes ).map(
                ( k ) => k as ProplusImageRenditionTypesOptions
            );
            renditionKeys.forEach( ( curKey ) => {
                if ( src.includes( `_${ProplusImageRenditionTypes[curKey]}` ) ) {
                    src = src.replace(
                        `_${ProplusImageRenditionTypes[curKey]}`,
                        ''
                    );
                }
            } );
        }



        /* 
         Logic for Dev server only
         // Validating not using local environment or cms internal
         const isNotCMSInternal =
             !environment.local && !src.includes( '_cmsinternal' );
         // Preferred image service url by default if append pro+ url or its not cms internal
         // To reroute the src to our caching service.
         const defaultImageServiceUrl =
             ( this.appendProPlusUrl || isNotCMSInternal ) && imageServiceUrl;
         // Preferred image service url for dev server
         const CMSImageServiceUrl = environment.devServer && cmsImageServiceUrl
         // image fallback
         const imageServiceLink = CMSImageServiceUrl || defaultImageServiceUrl || '';
        */


        const imageServiceLink = this.appendProPlusUrl ? imageServiceUrl : cmsImageServiceUrl
        // console.log( { imageServiceLink } );

        this.src = `${imageServiceLink}${src}`.replace( /([^:])\/\//, '$1/' );
        this.altText = altText;
    }

    /**
     * Returns the src to the hero rendition.
     */
    heroSrc(): string {
        const extensionIndex = this.src.lastIndexOf( '.' );
        return spliceString(
            this.src,
            extensionIndex,
            `_${ProplusImageRenditionTypes.hero}`
        );
    }

    /**
     * Returns the src to the small rendition.
     */
    smallSrc(): string {
        const extensionIndex = this.src.lastIndexOf( '.' );
        return spliceString(
            this.src,
            extensionIndex,
            `_${ProplusImageRenditionTypes.small}`
        );
    }

    /**
     * Returns the src to the swatch rendition.
     */
    swatchSrc(): string {
        const extensionIndex = this.src.lastIndexOf( '.' );
        return spliceString(
            this.src,
            extensionIndex,
            `_${ProplusImageRenditionTypes.swatch}`
        );
    }

    /**
     * Returns the src to the swatch rendition.
     */
    thumbSrc(): string {
        const extensionIndex = this.src.lastIndexOf( '.' );
        return spliceString(
            this.src,
            extensionIndex,
            `_${ProplusImageRenditionTypes.thumb}`
        );
    }
}
