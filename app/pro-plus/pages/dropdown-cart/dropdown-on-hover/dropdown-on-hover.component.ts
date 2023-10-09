import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
    ShoppingCartService,
    CartItemV2,
} from '../../../services/shopping-cart-service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteItemDialogComponent } from '../../shopping-cart/delete-item-dialog/delete-item-dialog.component';
import { DeleteItemCartRequest } from '../../../services/user.service';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { CartStore } from '../../../services/Cart';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dropdown-on-hover',
    templateUrl: './dropdown-on-hover.component.html',
    styleUrls: ['./dropdown-on-hover.component.scss'],
})
export class DropdownOnHoverComponent implements OnInit {
    @ViewChild('dropdownContent') dropdownContent: any;
    @Input() public permPlaceOrder = false;
    /* TODO: Create Type for form */
    public form: any = {};
    public cart: CartStore;
    public subtotal = 0;

    public displayCartPreview = 'none';
    /* TODO not necessary */
    @Input() ariaLabel: any;

    loading = true;

    constructor(
        private readonly cartService: ShoppingCartService,
        public deleteItemDialog: MatDialog,
        private readonly userNotifier: UserNotifierService,
        private readonly router: Router
    ) {
        this.form.searchText = '';
        this.cart = this.cartService.cart$;
        this.closeCartPreview();
    }

    async ngOnInit() {
        // tslint:disable-next-line: no-floating-promises
        this.cartService.reloadCart();
        this.cartService.cartPreview$.subscribe((nextPreview) => {
            this.displayCartPreview = nextPreview;
        });

        this.cart.getState().subscribe((r) => {
            this.subtotal = r.subTotal;
        });
    }

    public closeCartPreview() {
        this.displayCartPreview = 'none';
    }

    public openCartPreview() {
        /* dont open cart preview if window is less <= 940px */
        const windowWidth = window.document.documentElement.clientWidth;
        if (windowWidth >= 940) {
            this.displayCartPreview = 'block';
        }
    }

    async proceedToCheckOut() {
        await this.cartService.proceedToCheckout();
        await this.router.navigateByUrl('/proplus/shipping-info');
        this.closeCartPreview();
    }

    async deleteProduct(product: CartItemV2) {
        try {
            this.loading = true;
            const deleteItem: DeleteItemCartRequest = {
                commerceItemId: product.commerceItemId,
            };
            const response = await this.cartService.removeItemFromCart(
                deleteItem
            );
            await this.cartService.getCartsItems();
            if (response.success) {
                this.userNotifier.alertError(
                    `${product.itemOrProductDescription} Removed`
                );
            }
        } finally {
            this.loading = false;
        }
    }

    deleteOneItem(element: CartItemV2): void {
        const dialogRef = this.deleteItemDialog.open(DeleteItemDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await this.deleteProduct(element);
            }
        });
    }
}
