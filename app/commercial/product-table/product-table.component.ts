import { Component, OnInit } from '@angular/core';
import {
    CommercialItem,
    CommercialService,
} from '../services/commercial.service';

export interface PeriodicElement {
    name: string;
    url: string;
    weight: number;
    symbol: string;
    position?: number;
}

@Component({
    selector: 'app-product-table',
    templateUrl: './product-table.component.html',
    styleUrls: ['./product-table.component.scss'],
})
export class ProductTableComponent implements OnInit {
    displayedColumns: string[] = ['Product', 'Detail', 'Qty', 'Price'];

    // atlasRoofing =
    //     'https://www.beaconproplus.com/images/large/445652_default_thumb.jpg';
    // owensCorning =
    //     'https://www.beaconproplus.com/images/large/412524_default_thumb.jpg';
    // owensStorm =
    //     'https://www.beaconproplus.com/images/large/413335_default_thumb.jpg';
    // tribuildSynthetic =
    //     'https://www.beaconproplus.com/images/large/586865_default_thumb.jpg';
    // tribuiltPlasticCaps =
    //     'https://www.beaconproplus.com/images/large/603087_default_thumb.jpg';
    // tribuiltShingleStarter =
    //     'https://www.beaconproplus.com/images/large/560519_default_thumb.jpg';
    // polyglassElastoflex =
    //     'https://www.beaconproplus.com/images/large/353319_default_thumb.jpg';
    // genericCoilRoofingNails =
    //     'https://www.beaconproplus.com/images/large/12099_default_thumb.jpg';
    // tribuiltPlybase =
    //     'https://www.beaconproplus.com/images/large/643465_default_thumb.jpg';
    // tribuiltZincAnchorBox =
    //     'https://www.beaconproplus.com/images/large/555559_default_thumb.jpg';

    // imageUrls: string[] = [
    //     this.atlasRoofing,
    //     this.tribuildSynthetic,
    //     this.owensCorning,
    //     this.polyglassElastoflex,
    //     this.genericCoilRoofingNails,
    //     this.tribuiltPlybase,
    //     this.owensStorm,
    //     this.tribuiltShingleStarter,
    //     this.tribuiltPlasticCaps,
    //     this.tribuiltZincAnchorBox,
    // ];

    // ELEMENT_DATA: PeriodicElement[] = [
    //     {
    //         url: this.genericCoilRoofingNails,
    //         name: 'Roofing Nails',
    //         weight: 1.0079,
    //         symbol: '9',
    //     },
    //     {
    //         url: this.atlasRoofing,
    //         name: 'TrueDefinition Duration Shingles',
    //         weight: 4.0026,
    //         symbol: '23',
    //     },
    //     {
    //         url: this.owensCorning,
    //         name: 'TrueDefinition STORM Shingles',
    //         weight: 6.941,
    //         symbol: '22',
    //     },
    //     {
    //         url: this.tribuiltShingleStarter,
    //         name: 'Tribuilt Shingle Starter',
    //         weight: 9.0122,
    //         symbol: '12',
    //     },
    //     {
    //         url: this.tribuildSynthetic,
    //         name: 'Synthetic Roofing Underlayment',
    //         weight: 10.811,
    //         symbol: '7',
    //     },
    //     {
    //         url: this.tribuiltPlasticCaps,
    //         name: 'Plastic Cap Nails',
    //         weight: 12.0107,
    //         symbol: '76',
    //     },
    //     {
    //         url: this.owensStorm,
    //         name: 'Owens Corning StormGuard',
    //         weight: 14.0067,
    //         symbol: '44',
    //     },
    //     {
    //         url: this.polyglassElastoflex,
    //         name: 'Polyglass Elast-o-flex',
    //         weight: 15.9994,
    //         symbol: '54',
    //     },
    //     {
    //         url: this.tribuiltZincAnchorBox,
    //         name: 'Tri-Built Zinc Anchor Box',
    //         weight: 18.9984,
    //         symbol: '78',
    //     },
    //     {
    //         url: this.tribuiltPlybase,
    //         name: 'Tri-Built PlyBase',
    //         weight: 20.1797,
    //         symbol: '12',
    //     },
    // ];
    dataSource: CommercialItem[] = [];
    constructor(private commercialService: CommercialService) {}

    ngOnInit() {
        this.commercialService.orderItems$.subscribe((items) => {
            this.dataSource = items;
        });
    }
    getImageUrl(item: any) {
        const url = `https://beaconproplus.com${item.currentSKU.thumbImage}`;
        return url;
    }
}
