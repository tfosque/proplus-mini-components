import { Image } from './image';
import { ProductSkuResponse } from '../api-response-interfaces/product-sku';

export interface AuxiliaryImage {
    image: string;
    videoUrl?: string;
    type?: string;
}
export class ProductSku {
    public static fromSkuResponse(
        itemImage: Image,
        curSku: ProductSkuResponse
    ) {
        return new ProductSku(
            curSku.currentUOM,
            curSku.itemNumber,
            itemImage,
            curSku.variations || {},
            curSku.auxiliaryImages,
            curSku.skuShortDesc,
            curSku.uomlist || [],
            curSku.manufactureNumber,
            curSku.productNumber,
            curSku.unitPrice
        );
    }

    private constructor(
        public currentUOM: string | null,
        public itemNumber: string,
        public itemImage: Image,
        public variations: Record<string, string[]>,
        public auxiliaryImages: AuxiliaryImage[],
        public skuShortDesc: string,
        public uomlist: string[],
        public manufactureNumber: string | undefined,
        public productNumber: string | undefined,
        public unitPrice: number
    ) {}

    /**
     * Returns the color of the current sku if it exists.
     */
    getSkuColor(): string | null {
        if (this.variations && this.variations.color) {
            return this.variations.color[0];
        }

        return null;
    }

    /**
     * Returns an array of all the images in the auxillaryImages array that do not have a video attribute
     */
    getAuxillaryImagesOnly() {
        if (this.auxiliaryImages && this.auxiliaryImages.length) {
            const images = this.auxiliaryImages.filter(
                (curAuxItem) => !curAuxItem.videoUrl
            );

            return images.map(
                (curImage) => new Image(curImage.image, '', true)
            );
        }

        return [];
    }

    /**
     * Returns an array of all the images in the auxillaryImages array that have a video attribute
     */
    getAuxillaryVideosOnly() {
        if (this.auxiliaryImages && this.auxiliaryImages.length) {
            return this.auxiliaryImages.filter(
                (curAuxItem) => curAuxItem.videoUrl
            );
        }

        return [];
    }

    getSelection(): Map<string, string> {
        return new Map<string, string>(
            Object.entries(this.variations).flatMap(([name, values]) => {
                if (name && values && values.length) {
                    return [[name, values[0]] as [string, string]];
                }
                return [];
            })
        );
    }
}
