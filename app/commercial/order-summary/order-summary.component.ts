import { Component, OnInit } from '@angular/core';

import {
    CommercialService,
    ShippingInfo,
} from '../services/commercial.service';
import { DatePipe } from '@angular/common';


@Component( {
    selector: 'app-order-summary',
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
} )
export class OrderSummaryComponent implements OnInit {
    tiles: any[] = [
        { text: 'One', cols: 4, rows: 1, color: 'lightblue' },
        { text: 'Two', cols: 4, rows: 1, color: 'lightgreen' },
        { text: 'Three', cols: 4, rows: 1, color: 'lightpink' },
        { text: 'Four', cols: 4, rows: 1, color: '#DDBDF1' },
    ];
    shippingInfo!: ShippingInfo;
    itemsSelected: any[] = [];
    jobAccount: any;

    constructor(
        private commercialService: CommercialService,
        public datepipe: DatePipe
    ) {
        this.commercialService.shipping$.subscribe(
            ( shippingInfo: ShippingInfo ) => {
                this.shippingInfo = shippingInfo;
                console.log( { shippingInfo } );
            }
        );
        this.commercialService.orderItems$.subscribe( ( items: any ) => {
            this.itemsSelected = items;
            console.log( { items } );
        } );
        this.commercialService.job$.subscribe( ( jobAccount: any ) => {
            this.jobAccount = jobAccount;
            console.log( { jobAccount } );
        } );
    }



    get orderMethod() {
        if ( this.shippingInfo.shippingMethod === 'Pick_up' ) {
            return 'Pick Up';
        } else {
            return 'Ship To';
        }
    }
    get prettyDate() {
        if ( this.shippingInfo.date ) {
            return this.datepipe.transform(
                this.shippingInfo.date,
                'MM/dd/yyyy'
            );
        } else {
            return '';
        }
    }
    get orderOption() {
        if ( this.shippingInfo.shippingOnHold === 'onHold' ) {
            return 'On Hold';
        } else {
            return 'Scheduled';
        }
    }



    ngOnInit() { }
}
