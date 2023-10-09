import { Component, Input, OnInit } from '@angular/core';
import {
    CommercialItem,
    CommercialItemsRequest,
    CommercialService,
} from '../../services/commercial.service';
// import { MatPaginator } from '@angular/material/paginator';

export interface PeriodicElement {
    code: number;
    desc: string;
    color: string;
    unit: string;
    qty: number;
    add: boolean;
}

@Component( {
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
} )
export class TableComponent implements OnInit {
    @Input() btns: string[] = [];
    @Input() data!: CommercialItemsRequest;

    selectedItemList: CommercialItem[] = [];

    displayedColumns: string[] = [
        'code',
        'desc',
        'color',
        'unit',
        'qty',
        'add',
    ];
    itemDataResponse: any;
    facetGroups: FacetGroup[] | null = null;
    get itemCont() {
        if ( this.itemDataResponse ) {
            return this.itemDataResponse.totalNumRecs;
        } else {
            return 0;
        }
    }
    dataSource: CommercialItem[] = [];
    constructor( private commercialService: CommercialService ) { }

    async ngOnInit() {
        this.dataSource = await this.getItemsWithPrice( this.data );
    }
    get facetGroupList() {
        return this.facetGroups;
    }

    async getItemsWithPrice(
        req: CommercialItemsRequest
    ): Promise<CommercialItem[]> {
        const itemsWithoutPricing =
            await this.commercialService.getCategoryComercialItems( req );
        this.itemDataResponse = itemsWithoutPricing;
        let itemNumberList: any[] = [];

        itemsWithoutPricing.items?.forEach( ( item: any ) => {
            // TODO what sku we want to show first or this would be solve
            // by sku selector on table?
            itemNumberList.push( item?.skuList[0].itemNumber );
        } );

        const pricingResponse: any = await this.commercialService.getCommercialItemPricing( itemNumberList.toString() );
        console.log( { pricingResponse } )

        let pricingArray;
        if ( pricingResponse && pricingResponse.result ) {
            pricingArray = Object.entries(
                pricingResponse?.result?.orderPricing
            );
        }
        // pricingResponse.orderPricing
        let itemNumberPricingList: any[] = [];
        pricingArray?.forEach( ( pricing: any ) => {
            const itemNumberPricing = {
                itemNumber: Object.values( pricing )[0],
                price: Object.values( pricing[1] )[0],
                uom: Object.keys( pricing[1] )[0],
            };
            itemNumberPricingList.push( itemNumberPricing );
        } );

        let itemsWithPricing: CommercialItem[] = [];
        itemsWithoutPricing.items?.forEach( ( item: any ) => {
            itemNumberPricingList?.forEach( ( itemNumberPricing ) => {
                if (
                    itemNumberPricing.itemNumber === item.skuList[0].itemNumber
                ) {
                    const itemWithPricing = {
                        ...item,
                        itemNumber: itemNumberPricing.itemNumber,
                        price: itemNumberPricing.price,
                        uom: itemNumberPricing.uom,
                        qty: 0,
                        isSelected: false,
                    };
                    itemsWithPricing.push( itemWithPricing );
                }
            } );

            // const itemNumber = item.skuList[0].itemNumber;
            // const pricing = pricingArray.find(
            //     (pricing: any) => pricing.itemNumber === itemNumber
            // );
        } );
        this.groomFacets();
        return itemsWithPricing;
    }
    groomFacets() {
        let f: FacetGroup[] = [];
        let facetArray;
        if ( this.itemDataResponse.facets ) {
            facetArray = Object.entries( this.itemDataResponse?.facets );
            facetArray.forEach( ( facet: any ) => {
                const facetEntries: FacetGroup = {
                    facetName: facet[0],
                    valuesCount: facet[1].length,
                    facetValues: facet[1],
                    facetCountShowMore: 1,
                };

                f.push( facetEntries );
            } );
            f = f.filter( ( facet ) => facet.facetName !== 'Brand' );
            f = f.filter( ( facet ) => facet.facetName !== 'Categories' );
            f = f.filter( ( facet ) => facet.facetName !== 'Dimension' );

            this.facetGroups = f;
        }
    }

    async facetSelected( req: any ) {
        console.log( req );

        this.dataSource = await this.getItemsWithPrice( req );
    }

    manageSelectedItems( item: CommercialItem ) {
        if ( !item.isSelected ) {
            item.isSelected = true;
            this.selectedItemList.push( item );
            this.commercialService.setOrderItems( item );
        } else {
            item.isSelected = false;
            this.selectedItemList = this.selectedItemList.filter(
                ( selectedItem ) => selectedItem.itemNumber !== item.itemNumber
            );
            this.commercialService.removeOrderItem( item );
        }
    }
}

export interface FacetGroup {
    facetName: string;
    valuesCount: number;
    facetCountShowMore: number;
    facetValues: [
        {
            facetId: string;
            facetName: string;
            recordCount: number;
            selected: boolean;
        }
    ];
}
