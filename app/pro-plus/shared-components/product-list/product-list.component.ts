import { Component, OnInit, Input } from '@angular/core';
import { CartItemV2 } from '../../services/shopping-cart-service';
import { AvailabilityRequest, AvailabilityService } from '../../services/availability.service';
import { Location } from '@angular/common';

@Component( {
    selector: 'app-cart-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
} )
export class ProductListComponent implements OnInit {
    @Input() public cartItems?: CartItemV2[];
    @Input() public displayedColumns = [
        'product',
        'details',
        'price',
        'qty',
        'total',
        'action',
    ];
    @Input() public deleteAll!: () => void;
    @Input() public deleteOneItem!: ( element: CartItemV2 ) => void;
    itemNumberQtyList: { itemNumber: string; itemQty: number }[] = [];
    itemAvailabilityList: { itemNumber: string, value: string }[] = [];
    green: boolean = false;
    blue: boolean = false;
    grey: boolean = false;
    color: string = '';
    hasItemAvailabilityError: boolean = false;
    
    constructor(
        private readonly availabilityService: AvailabilityService,
        private readonly location: Location
    ) {
        this.color = 'green'? 'availability-green-text-cart' : 'blue'? 'availability-blue-text-cart' : 'availability-grey-text-cart';
    }

    ngOnInit() {
        if (this.cartItems && this.cartItems.length > 0) {
            this.itemNumbersQty();
        }
    }

    public getPrdImageUrl( imageUrl: string ) {
        //  TODO:  Figure out how we do this elsewhere and do the same thing
        if ( imageUrl ) {
            return `https://beaconproplus.com${imageUrl}`;
        } else {
            return '';
        }
    }
    public itemNumbersQty() {
        this.cartItems!.forEach((item) => {
            this.itemNumberQtyList.push({ 
                itemNumber: item.catalogRefId,
                itemQty: item.quantity
            });
        });
        const itemNumbers = this.itemNumberQtyList.map((item) => item.itemNumber).join(',');
        this.getAvailability(itemNumbers!);
    }
    async getAvailability(itemNumbers: string) {
        try {
            const request: AvailabilityRequest = {
                itemNumbers: itemNumbers
            };
            const response = await this.availabilityService.getAvailability(request);
            this.itemAvailabilityList = [];
            if (response.success && response.result.items.length > 0) {
                for (const item of response.result.items) {
                    const itemAvailableQty = +item.availableQty;
                    const itemAvgQty30Days = Math.floor(+item.avgQty30Days);
                    const orderQty = this.itemNumberQtyList?.find(
                        (itemNumberQty) => itemNumberQty.itemNumber === item.itemNumber
                    )?.itemQty;
                    switch (true) {
                        case itemAvailableQty > orderQty! && itemAvailableQty > itemAvgQty30Days:
                            this.itemAvailabilityList.push({ 
                                itemNumber: item.itemNumber, 
                                value: 'Available for Pick Up or Delivery',
                            });
                        break;
                        case itemAvailableQty === 0 || itemAvailableQty < orderQty! || itemAvailableQty < itemAvgQty30Days:
                            this.itemAvailabilityList.push({ 
                                itemNumber: item.itemNumber, 
                                value: 'Call for Availability',
                            });
                        break;
                        case itemAvailableQty > 0 && itemAvailableQty === orderQty!:
                            this.itemAvailabilityList.push({ 
                                itemNumber: item.itemNumber, 
                                value: 'Low Stock - Order Now',
                            });
                        break;
                        default:
                            this.itemAvailabilityList.push({
                                itemNumber: item.itemNumber,
                                value: 'Call for Availability',
                            });
                        break;
                    }
                }
            } else {
                this.itemAvailabilityList.push({ 
                    itemNumber: itemNumbers, 
                    value: 'Call for Availability',
                });
            }
        } catch (error) {
            this.hasItemAvailabilityError = true;
            console.log('Error getting item availability', error);
        } finally {
            return;
        };
    }
    public getAvailablityByItem(catalogRefId: string) {
        this.green = false;
        this.blue = false;
        this.grey = false;
        const itemAvail = this.itemAvailabilityList?.find(
            (item: {itemNumber: string}) => item.itemNumber === catalogRefId
        );
        if (itemAvail) {
            switch (true) {
                case itemAvail.value === 'Available for Pick Up or Delivery':
                    this.green = true;
                    return itemAvail.value;
                case itemAvail.value === 'Call for Availability':
                    this.blue = true;
                    return itemAvail.value;
                case itemAvail.value === 'Low Stock - Order Now':
                    this.grey = true;
                    return itemAvail.value;
                default:
                    this.blue = true;
                    return itemAvail.value;
                }
            } else {
                this.blue = true;
                return 'Call for Availability';
            }
        }
    public updateAvailability(event: number, element: CartItemV2) {
        this.itemNumberQtyList = [];
        this.itemNumbersQty();
        this.location.go(this.location.path());
    }
}
