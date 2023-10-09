import {
    Component,
    OnInit,
    Input,
    ViewChild,
    EventEmitter,
    Output,
} from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateItemView } from '../../pages/templates/template-detail-page/template-item-view';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { ITemplateItem } from '../../pages/templates/template-detail-page/template-view-model';
import { UserService } from '../../services/user.service';
import { AvailabilityRequest, AvailabilityService } from '../../services/availability.service';
import { Location } from '@angular/common';

@Component( {
    selector: 'app-product-lines',
    templateUrl: './product-lines.component.html',
    styleUrls: ['./product-lines.component.scss'],
} )
export class ProductLinesComponent implements OnInit {
    @ViewChild( 'table' ) table: MatTable<ITemplateItem> | undefined;

    // @Input() public observedItems!: Observable<TemplateItemView[]>;

    @Input() public observedItems!: Observable<any[]>;
    @Input() public displayedColumns: string[] = [
        'product',
        'details',
        'unit_price',
        'qty',
        'subtotal',
    ];
    @Input() public editMode = true;
    @Input() public onListDrop?: ( evt: CdkDragDrop<unknown> ) => void;
    @Input() public deleteItem?: ( item: unknown ) => void;
    @Input() public isAllSelected?: boolean = undefined;
    @Input() public isAllMixed?: boolean = undefined;
    @Input() public displayErrorImage?: boolean = true;
    @Output()
    public AllSelectedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    green: boolean = false;
    blue: boolean = false;
    grey: boolean = false;
    color: string = '';
    hasItemAvailabilityError: boolean = false;
    itemNumberQtyList: { itemNumber: string; itemQty: number }[] = [];
    itemAvailabilityList: { itemNumber: string, value: string }[] = [];

    public get isAllSelectedInt() {
        return this.isAllSelected;
    }
    public set isAllSelectedInt( newSetting ) {
        this.AllSelectedChange.next( newSetting );
        this.isAllSelected = newSetting;
    }

    public get hasSelections() {
        return (
            this.isAllSelected !== undefined && this.isAllMixed !== undefined
        );
    }

    public get calculatedColumns() {
        return this.displayedColumns.filter( ( c ) => {
            //  Turn off the reorder column if we can't drag and drop
            if ( c === 'reorder' && !this.onListDrop ) {
                return false;
            }
            return true;
        } );
    }

    public model = {
        ...{},
        flipShowMore( templateItemId: string ) { },
        findShowMore( templateItemId: string ) {
            return true;
        },
        // TODO (Tim): to review potential dead code
        saveSpecs( element: any ) { },
    };

    public get isDragDropEnabled() {
        return this.onListDrop;
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    public isColumnVisible( name: string ): boolean {
        return this.displayedColumns.some( ( c ) => c === name );
    }

    public deleteTheItem( item: unknown ) {
        const deleteIt = this.deleteItem;
        if ( deleteIt ) {
            deleteIt( item );
        }
    }

    constructor( 
        private readonly userService: UserService,
        private readonly availabilityService: AvailabilityService,
        private readonly location: Location
     ) {
        this.color = 'green' ? 'availability-green-text-template' : 'blue' ? 'availability-blue-text-template' : 'availability-grey-text-template';
     }

    ngOnInit() {
        this.itemNumbersQty();
    }
    setCurrentValue( event: number, element: TemplateItemView ) {
        element.quantity = event;
    }
    public handleListDrop( evt: CdkDragDrop<unknown> ) {
        if ( !this.onListDrop ) {
            return;
        }
        this.onListDrop( evt );
        if ( this.table ) {
            this.table.renderRows();
        }
    }
    public itemNumbersQty() {
        this.observedItems.subscribe( ( items: any[] ) => {
            for ( const item of items ) {
                this.itemNumberQtyList.push( {
                    itemNumber: item.currentSKU,
                    itemQty: item.quantity
                } );
            }
            const itemNumbers = this.itemNumberQtyList.map( ( item ) => item.itemNumber );
            this.getAvailability( itemNumbers.join( ',' ) );
        } )
    }

    async getAvailability( itemNumbers: string ) {
        try {
            const request: AvailabilityRequest = {
                itemNumbers: itemNumbers
            };
            const response = await this.availabilityService.getAvailability( request );
            this.itemAvailabilityList = [];
            if ( !response.success ) {
                this.hasItemAvailabilityError = true;
            };
            if ( response.success && response.result.items.length > 0 ) {
                for ( const item of response.result.items ) {
                    const itemAvailableQty = +item.availableQty;
                    const itemAvgQty30Days = Math.floor( +item.avgQty30Days );
                    const templateQty = this.itemNumberQtyList.find( ( x ) => x.itemNumber === item.itemNumber )?.itemQty;
                    switch ( true ) {
                        case itemAvailableQty > templateQty! && itemAvailableQty > itemAvgQty30Days:
                            this.itemAvailabilityList.push( {
                                itemNumber: item.itemNumber,
                                value: 'Available for Pick Up or Delivery',
                            } );
                            break;
                        case itemAvailableQty === 0 || itemAvailableQty < templateQty! || itemAvailableQty < itemAvgQty30Days:
                            this.itemAvailabilityList.push( {
                                itemNumber: item.itemNumber,
                                value: 'Call for Availability',
                            } );
                            break;
                        case itemAvailableQty > 0 && itemAvailableQty === templateQty:
                            this.itemAvailabilityList.push( {
                                itemNumber: item.itemNumber,
                                value: 'Low Stock - Order Now',
                            } );
                            break;
                        default:
                            this.itemAvailabilityList.push( {
                                itemNumber: item.itemNumber,
                                value: 'Call for Availability',
                            } );
                            break;
                    }
                }
            } else {
                this.itemAvailabilityList.push( {
                    itemNumber: itemNumbers,
                    value: 'Call for Availability',
                } );
            }
        } catch ( error ) {
            this.hasItemAvailabilityError = true;
            console.log( 'Error getting item availability', error );
        } finally {
            return;
        };
    }
    public getAvailabilityByItem( elementItem: string ) {
        this.green = false;
        this.blue = false;
        this.grey = false;
        const itemAvail = this.itemAvailabilityList?.find(
            ( item: { itemNumber: string } ) => item.itemNumber === elementItem
        );
        if ( itemAvail ) {
            switch ( true ) {
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
    public updateAvailability( event: number, element: TemplateItemView ) {
        this.itemNumberQtyList = [];
        this.itemNumbersQty();
        this.location.go( this.location.path() );
    }
}
