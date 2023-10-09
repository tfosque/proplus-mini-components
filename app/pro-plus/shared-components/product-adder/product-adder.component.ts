import { Component, OnInit, Inject } from '@angular/core';
import { AttributeValues } from '../../../pro-plus/model/attribute-values';
// import { tap } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../../pages/templates/template-detail-page/template-detail-page.component';
import { ProductsService } from '../../services/products.service';
import { ProductImp } from '../../../global-classes/product-imp';

@Component({
    selector: 'app-product-adder',
    templateUrl: './product-adder.component.html',
    styleUrls: ['./product-adder.component.scss'],
})
export class ProductAdderComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<ProductAdderComponent>,
        public productService: ProductsService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    async ngOnInit() {
        const prod = await this.productService
            .getProduct(this.data.productId, null)
            .toPromise();
        this.data.productDetail = prod as ProductImp;
        // .pipe(tap(prod => console.log('product Details in popup: ', prod)))
        // .subscribe(prod => this.data.productDetail = prod);
        this.data.quantity = 1;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    public numKeys(attributes: AttributeValues) {
        return Object.keys(attributes).length;
    }

    public firstKey(attributes: AttributeValues) {
        return Object.keys(attributes)[0];
    }

    async selProduct(itemNum: string) {
        const prod = await this.productService
            .getProduct(undefined, itemNum)
            .toPromise();
        console.log('product details in popup changed by facet: ', prod);
        if (prod) {
            this.data.productDetail = prod;
        }
    }

    public saveData(): void {
        this.dialogRef.close({
            prodDetail: this.data.productDetail,
            quantity: this.data.quantity,
        });
    }

    public clearData() {
        return;
    }
}
