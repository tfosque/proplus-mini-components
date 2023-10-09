import { PoDialogComponent } from './po-dialog/po-dialog.component';
import { TemplateListResponse } from './../../model/template-list-response';
import { TemplatesService } from './../../services/templates.service';
import {
    ShoppingCartService,
    CartItems,
    ItemsEntity,
} from './../../services/shopping-cart-service';
import { UserService, AllUserInfo } from './../../services/user.service';
import {
    PerfectOrderService,
    GetPerfectOrderDetailRequest,
    PerfectOrder,
} from './../../services/perfect-order.service';
import { Component, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TemplateItemView } from '../templates/template-detail-page/template-item-view';
import { ProductsService } from '../../services/products.service';
import { TemplateCreateItem } from '../../model/update-template-request';

@Component({
    selector: 'app-perfect-order-detail',
    templateUrl: './perfect-order-detail.component.html',
    styleUrls: ['./perfect-order-detail.component.scss'],
})
export class PerfectOrderDetailComponent implements OnInit {
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
    account!: AllUserInfo;
    loading = true;
    config = new MatSnackBarConfig();
    templates!: TemplateListResponse;
    groupedProductList: {
        displayName: string;
        items: TemplateItemView[];
    }[] = [];

    public showMore: Array<{
        templateItemId: string;
        show: boolean;
    }> = [];
    subscription: any;

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly _snackBar: MatSnackBar,
        readonly perfectOrderService: PerfectOrderService,
        readonly userService: UserService,
        readonly route: ActivatedRoute,
        readonly cartService: ShoppingCartService,
        readonly templateService: TemplatesService,
        readonly productService: ProductsService,
        private readonly router: Router,
        public dialog: MatDialog
    ) {}

    async ngOnInit() {
        try {
            this.config.verticalPosition = 'top';
            this.config.duration = 10000;
            this.account = await this.userService.ensureAllUserInfo();
            const accountId = this.account.activeAccount.accountLegacyId;
            this.templates = await this.templateService.getTemplatesByAccount(
                accountId
            );
            const p: ParamMap = this.route.snapshot.paramMap;
            let brandName = p.get('brandName');
            if (brandName === 'Boral') {
                brandName = 'Boral||TRI-BUILT';
            }
            const id = p.get('perfectId');
            if (id === '1100002') {
                brandName = 'LP SmartSide ExpertFinish';
            }
            if (id && brandName) {
                const request: GetPerfectOrderDetailRequest = {
                    account: this.account.activeAccount.accountLegacyId,
                    perfectOrderId: id,
                    brandName: brandName,
                    showPricing: 'true',
                };
                const response = await this.perfectOrderService.getPerfectOrderDetail(
                    request
                );
                this.groupedProductList = this.getProductList(
                    response.perfectOrders
                );
                console.log('productList:', this.groupedProductList);
            }
            this.groupedProductList.map((v) => {
                v.items.map((m) => {
                    this.showMore.push({
                        templateItemId: m.lineItemId || '',
                        show: false,
                    });
                });
            });
        } finally {
            this.loading = false;
        }
    }

    getProductList(categories: PerfectOrder[]) {
        return categories.map((c) => {
            return {
                displayName: c.displayName,
                items: c.items.map((i) =>
                    TemplateItemView.fromItem(this.productService, i, true)
                ),
            };
        });
    }

    async addItemsToCart() {
        const itemsToAdd = this.groupedProductList.flatMap((v) => {
            return v.items
                .filter((f) => f.quantity !== 0)
                .map((item) => {
                    const items: ItemsEntity = {
                        catalogRefIdChanged: false,
                        catalogRefId: item.selectedSKU || item.itemNumber,
                        productId: item.productOrItemNumber,
                        quantity: item.quantity,
                        uom: item.unitOfMeasure || '',
                    };
                    return items;
                });
        });
        const request: CartItems = {
            accountId: this.account.activeAccount.accountLegacyId,
            specialInstructions: '',
            items: itemsToAdd,
            addItemCount: itemsToAdd.length,
            jobNumber: '',
        };
        const response = await this.cartService.addItemsToCart(request);
        if (response) {
            this._snackBar.open('Items added to Cart', 'Close', this.config);
            await this.router.navigateByUrl('/proplus/shopping-cart');
        }
    }

    public findShowMore(templateItemId: string) {
        if (templateItemId) {
            const item = this.showMore.find(
                (s) => s.templateItemId === templateItemId
            );
            if (!item) {
                return false;
            }
            return item.show;
        }
        return false;
    }

    public flipShowMore(templateItemId: string) {
        const currValue = this.findShowMore(templateItemId);
        const updateItem = this.showMore.filter(
            (s) => s.templateItemId === templateItemId
        )[0];
        const index = this.showMore.indexOf(updateItem);
        this.showMore[index].show = !currValue;
    }

    addItemsToTemplate() {
        const itemsToAdd = this.groupedProductList.flatMap((v) => {
            return v.items
                .filter((f) => f.quantity !== 0)
                .map((item) => {
                    const items: TemplateCreateItem = {
                        itemNumber: item.itemNumber,
                        unitOfMeasure: item.unitOfMeasure,
                        quantity: item.quantity,
                        matchColor: item.currentSKU || null || undefined,
                        matchMFG: null,
                    };
                    return items;
                });
        });
        if (itemsToAdd.length === 0) {
            this._snackBar.open(
                'Please select the quantity of the items to add to the Template.',
                'Close',
                this.config
            );
            return;
            // return null;
        }
        const dialogRef = this.dialog.open(PoDialogComponent);

        dialogRef.afterClosed().subscribe(async (result) => {
            if (!result) {
                return;
            }
            this.loading = true;
            const request = {
                templateName: result,
                account: this.account.activeAccount.accountLegacyId,
                action: 'createItem',
                invokeBy: 'store',
                items: itemsToAdd,
            };

            if (result) {
                try {
                    const response = await this.templateService.createTemplate(
                        request
                    );

                    if (response.result.templateId) {
                        await this.router.navigate([
                            '/proplus/accounts',
                            this.account.activeAccount.accountLegacyId,
                            'templates',
                            response.result.templateId,
                        ]);

                        this.loading = false;
                    } else {
                        this.loading = false;

                        this._snackBar.open(
                            response.messages.message,
                            'Close',
                            this.config
                        );
                        await this.router.navigate(['/proplus/perfect-order']);
                    }
                } catch (error) {
                    this._snackBar.open(error.message, 'Close', this.config);
                    this.loading = false;
                }
            }
        });
    }
}
