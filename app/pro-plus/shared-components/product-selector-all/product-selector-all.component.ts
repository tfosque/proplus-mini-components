import { Component, OnInit, Inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormControl,
    AbstractControl,
} from '@angular/forms';
import { Product } from '../../../api-response-interfaces/product';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ItemListResponseV3 } from '../../../api-response-interfaces/item-list-response';
import { of } from 'rxjs';
import { ProductBrowseService } from '../../../services/product-browse.service';
import { DialogDataSelector } from '../../pages/templates/template-detail-page/template-detail-page.component';
import { Image } from '../../../global-classes/image';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-product-selector-all',
    templateUrl: './product-selector-all.component.html',
    styleUrls: ['./product-selector-all.component.scss'],
})
export class ProductSelectorAllComponent implements OnInit {
    isLinear = true;
    selectorFormGroup!: FormGroup;
    adderFormGroup!: FormGroup;
    public dataSource: Product[] = [];
    displayedColumns: string[] = ['product', 'details'];
    public searchTerm!: string;
    isLoading = false;
    selectedProductId!: string;
    selectedRowIndex = -1;

    constructor(
        private readonly _formBuilder: FormBuilder,
        private readonly productBrowseService: ProductBrowseService,
        @Inject(MAT_DIALOG_DATA)
        public data: DialogDataSelector
    ) {}

    ngOnInit() {
        this.selectorFormGroup = this._formBuilder.group({
            productSearchTerm: new FormControl(),
        });
        this.adderFormGroup = this._formBuilder.group({
            secondCtrl: new FormControl(),
        });
        this.searchTerm = this.data.searchTerm;
        this.productBrowseService
            .getItemListBySearchTerm(
                this.data.searchTerm === null ? '' : this.data.searchTerm
            )
            .subscribe((prods) => (this.dataSource = prods.items));

        const productSearchTerm = this.selectorFormGroup.get(
            'productSearchTerm'
        ) as AbstractControl;

        productSearchTerm.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isLoading = true)),
                switchMap((searchText) =>
                    searchText.length > 2
                        ? this.productBrowseService.getItemListBySearchTerm(
                              searchText
                          )
                        : of<ItemListResponseV3>().pipe(
                              finalize(() => (this.isLoading = false))
                          )
                )
            )
            .subscribe((itemList) => {
                this.dataSource = itemList.items;
            });
    }

    public selectProduct(productId: string): void {
        this.selectedProductId = productId;
        //  TODO:  We shouldn't do this...
        // console.log('stepper selected index ', this.stepper.selectedIndex);
        // this.stepper.selectedIndex = 1;
    }

    highlight(row: any) {
        this.selectedRowIndex = row.id;
    }

    public getImage(p: Product) {
        return new Image(p.productImage, p.productName, false);
    }
}
