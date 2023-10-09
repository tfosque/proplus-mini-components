import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { SuggestiveSellingItem } from '../../../services/products.service';

@Component({
    selector: 'app-customers-also-bought',
    templateUrl: './customers-also-bought.component.html',
    styleUrls: ['./customers-also-bought.component.scss'],
})
export class CustomersAlsoBoughtComponent {
    //  TODO -  Rather than feeding it the results of the suggested selling API, let's feed it SKUs
    //          and let this component fetch and drive how it's displayed independantly of everything
    //          else...
    @Input() suggestedProducts?: Observable<SuggestiveSellingItem[]>;
    @Output() addProduct = new EventEmitter();
    @Input() btnText = 'ADD TO CART';

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly userService: UserService
    ) {}

    addProductToList(product: SuggestiveSellingItem) {
        this.addProduct.emit(product);
    }
}
