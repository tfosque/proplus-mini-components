import { UserService } from '../../../services/user.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, ParamMap, Router } from '@angular/router';
import { map, flatMap, filter } from 'rxjs/operators';
import {
    SavedOrdersService,
    SavedOrderShippingResponse,
    RejectSavedOrderRequest,
} from '../../../services/saved-orders.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GetOrderApprovalDetailResponse } from '../../../services/GetOrderApprovalDetailResponse';
import { TemplateItemView } from '../../templates/template-detail-page/template-item-view';
import { ProductsService } from '../../../services/products.service';
import {
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as xlsx from 'xlsx';
import { ExcelObject } from '../../order-history-page/order-history-page.component';
import { SevereError } from '../../../../common-components/classes/app-error';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { SkuSelection } from '../../../shared-components/sku-selector/sku-selector.component';
import { ConfirmationDialogComponent } from '../../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched || isSubmitted)
        );
    }
}

@Component({
    selector: 'app-pending-order-details',
    templateUrl: './pending-order-details.component.html',
    styleUrls: ['./pending-order-details.component.scss'],
})
export class PendingOrderDetailsComponent implements OnInit {
    @ViewChild('rejectPendingOrder')
    rejectPendingOrder?: TemplateRef<any>;
    formReject!: FormGroup;
    public savedOrder$: Observable<GetOrderApprovalDetailResponse>;
    public lineItems$ = new BehaviorSubject<TemplateItemView[]>([]);

    shippingInfo$: Observable<SavedOrderShippingResponse>;

    savedOrderDetail?: GetOrderApprovalDetailResponse;
    matcher = new MyErrorStateMatcher();
    loading = true;
    displayedColumns2: string[] = ['orderSummary', 'empty'];

    shippingInfo: SavedOrderShippingResponse | null = null;
    accountId: string | null = null;
    orderForm!: FormGroup;
    displayNameFormControl = new FormControl('', [Validators.required]);
    orderId = '';
    editMode = false;
    lineItems: TemplateItemView[] = [];
    uploadedFiles: string[] = [];
    public rejectReason = '';
    rejectReasonFormControl = new FormControl('', [Validators.required]);
    constructor(
        private readonly route: ActivatedRoute,
        public saveDialog: MatDialog,
        private readonly savedOrders: SavedOrdersService,
        private readonly productService: ProductsService,
        private readonly userNotifier: UserNotifierService,
        private readonly router: Router,
        private readonly userService: UserService,
        private readonly _snackBar: MatSnackBar,
        public dialogComp: MatDialog
    ) {
        const savedOrder$ = this.route.params.pipe(
            filter((s) => this.userService.isLoggedIn),
            map((p: Params) => p['savedOrderId'] || ''),
            flatMap((id) => this.savedOrders.getOrderApprovalDetail(id)),
            map((o) => o.result)
        );

        const shippingOrderInfo$ = this.route.params.pipe(
            filter((s) => this.userService.isLoggedIn),
            map((p: Params) => p['savedOrderId'] || ''),
            flatMap((id) => this.savedOrders.getShippingInfo(id)),
            map((o) => o.result)
        );

        const lineItems$ = savedOrder$.pipe(
            map((o) =>
                (o.commerceItems || []).map((i) =>
                    TemplateItemView.fromCommerceItem(this.productService, i)
                )
            )
        );

        this.savedOrder$ = savedOrder$;
        lineItems$.subscribe(this.lineItems$);
        this.shippingInfo$ = shippingOrderInfo$;
    }

    get pickupValidator() {
        return (
            this.shippingInfo &&
            this.shippingInfo.deliveryDate &&
            this.shippingInfo.deliveryTime
        );
    }

    get loadingBool() {
        return this.loading;
    }

    get validDeliveryOpt() {
        return this.shippingInfo && this.shippingInfo.deliveryOption;
    }
    get orderValidation() {
        return this.shippingInfo && this.shippingInfo.instructions;
    }

    get phoneValidation() {
        return (
            this.shippingInfo &&
            this.shippingInfo.contactInfo &&
            this.shippingInfo.contactInfo.phoneNumber
        );
    }

    get getEditMode() {
        return this.editMode;
    }

    get validAddress() {
        return (
            this.shippingInfo &&
            this.shippingInfo.branchAddress &&
            this.shippingInfo.branchAddress.address1 &&
            this.shippingInfo.branchAddress.address2 &&
            this.shippingInfo.branchAddress.city &&
            this.shippingInfo.branchAddress.postalCode &&
            this.shippingInfo.branchAddress.state
        );
    }
    get validDeliveryMethod() {
        return this.shippingInfo && this.shippingInfo.shippingMethod;
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    async ngOnInit() {
        try {
            this.loading = true;
            this.accountId = this.userService.accountIdInString;
            const p: ParamMap = this.route.snapshot.paramMap;
            this.orderId = p.get('savedOrderId') || '0';
            this.shippingInfo$.subscribe((v) => (this.shippingInfo = v));
            this.savedOrder$.subscribe((v) => (this.savedOrderDetail = v));
            this.lineItems$.subscribe((v) => (this.lineItems = v));
            const savedOrderInfo = await this.savedOrders
                .getSavedOrderReviewInfo(this.orderId)
                .toPromise();
            console.log(this.savedOrder$);
            this.uploadedFiles =
                savedOrderInfo.result.orderRelatedDocuments || [];
            this.formReject = new FormGroup({
                rejectReasonControl: this.rejectReasonFormControl,
            });
            this.orderForm = new FormGroup({
                displayNameControl: this.displayNameFormControl,
            });

            //Verify that you have permissions
            const isApprove = this.userService.permissions.order.approve;
            if (!isApprove) {
                throw new SevereError('forbidden');
            }
        } finally {
            this.loading = false;
        }
    }

    async save() {
        if (this.orderForm.valid) {
            try {
                this.loading = true;
                const items = (this.lineItems || []).map((v) => {
                    const item = {
                        id: v.lineItemId,
                        itemNumber: v.itemNumber,
                        quantity: v.quantity,
                        uom: v.unitOfMeasure,
                    };
                    return item;
                });

                const savedOrderDetail = this.savedOrderDetail;
                if (savedOrderDetail) {
                    const request: UpdateItemRequest = {
                        savedOrderId: savedOrderDetail.id,
                        savedOrderName: savedOrderDetail.displayName,
                        action: 'updateItem',
                        items: items || [],
                    };
                    const response =
                        await this.savedOrders.updateSaveOrderItems(request);
                    if (response.success) {
                        const savedOrder$ = this.route.params.pipe(
                            map((p: Params) => p['savedOrderId'] || ''),
                            flatMap((id) =>
                                this.savedOrders.getOrderApprovalDetail(id)
                            ),
                            map((o) => o.result)
                        );
                        this.savedOrder$ = savedOrder$;
                        this.userNotifier.alertError(`Saved Order Updated`);
                    }
                }
            } finally {
                this.loading = false;
                this.switchEdit();
            }
        } else {
            Object.keys(this.orderForm.controls).forEach((key) =>
                this.orderForm.controls[key].markAsTouched()
            );
        }
    }

    async autoSave() {
        try {
            const items = (this.lineItems || []).map((v) => {
                const item = {
                    id: v.lineItemId,
                    itemNumber: v.itemNumber,
                    quantity: v.quantity,
                    uom: v.unitOfMeasure,
                };
                return item;
            });

            const savedOrderDetail = this.savedOrderDetail;
            if (savedOrderDetail) {
                const request: UpdateItemRequest = {
                    savedOrderId: savedOrderDetail.id,
                    savedOrderName: savedOrderDetail.displayName,
                    action: 'updateItem',
                    items: items || [],
                };
                const response = await this.savedOrders.updateSaveOrderItems(
                    request
                );
                if (response.success) {
                    const savedOrder$ = this.route.params.pipe(
                        map((p: Params) => p['savedOrderId'] || ''),
                        flatMap((id) =>
                            this.savedOrders.getOrderApprovalDetail(id)
                        ),
                        map((o) => o.result)
                    );
                    this.savedOrder$ = savedOrder$;
                }
            }
        } finally {
        }
    }

    async addProduct(event: SkuSelection) {
        try {
            if (!event) {
                return;
            }
            this.loading = true;
            await this.autoSave();
            const savedOrderDetail = this.savedOrderDetail;
            const items = [
                {
                    id: event.productId,
                    itemNumber: event.sku.itemNumber,
                    quantity: event.quantity,
                    uom: event.uom,
                },
            ];
            if (savedOrderDetail) {
                const request: UpdateItemRequest = {
                    savedOrderId: savedOrderDetail.id,
                    savedOrderName: savedOrderDetail.displayName,
                    action: 'createItem',
                    items: items,
                };
                const response = await this.savedOrders.updateSaveOrderItems(
                    request
                );
                if (response.success) {
                    const lineItems$ = this.savedOrder$.pipe(
                        map((o) =>
                            (o.commerceItems || []).map((i) =>
                                TemplateItemView.fromCommerceItem(
                                    this.productService,
                                    i
                                )
                            )
                        )
                    );
                    lineItems$.subscribe(this.lineItems$);
                    this.userNotifier.alertError(`Item successfully added`);
                }
            }
        } finally {
            this.loading = false;
        }
    }

    async deleteItem(item: TemplateItemView) {
        try {
            this.loading = true;
            await this.autoSave();
            const items = [
                {
                    id: item.lineItemId,
                    itemNumber:
                        item.itemNumber === '0' ? null : item.itemNumber,
                    quantity: item.quantity,
                    uom: item.unitOfMeasure,
                },
            ];
            if (this.savedOrderDetail) {
                const request: UpdateItemRequest = {
                    savedOrderId: this.savedOrderDetail.id,
                    savedOrderName: this.savedOrderDetail.displayName,
                    action: 'deleteItem',
                    items: items,
                };
                const response = await this.savedOrders.updateSaveOrderItems(
                    request
                );
                if (response.success) {
                    const lineItems$ = this.savedOrder$.pipe(
                        map((o) =>
                            (o.commerceItems || []).map((i) =>
                                TemplateItemView.fromCommerceItem(
                                    this.productService,
                                    i
                                )
                            )
                        )
                    );
                    lineItems$.subscribe(this.lineItems$);
                    this.userNotifier.alertError(`Item successfully deleted`);
                }
            }
        } finally {
            this.loading = false;
        }
    }

    formatAddress(shipAdd: any) {
        return [
            shipAdd.address1,
            shipAdd.address2,
            shipAdd.address3,
            [shipAdd.city, shipAdd.state].filter((i) => i).join(', '),
            shipAdd.postalCode,
        ]
            .filter((i) => i)
            .join(' ');
    }

    async exportOrder(pricing: boolean): Promise<void> {
        if (!this.savedOrderDetail || !this.lineItems) {
            return;
        }
        const order = this.savedOrderDetail;
        const lineItems = this.lineItems;
        const csvObj: ExcelObject[] = [];
        if (lineItems && order.job && order.branchAddress) {
            if (pricing) {
                const shippingAddress = this.formatAddress(order.branchAddress);
                for (const element of lineItems) {
                    csvObj.push({
                        OrderPlacedDate: order.creationDate,
                        OrderNumber: order.id,
                        OrderStatus: order.status,
                        JobName: order.job.jobName,
                        ShippingAddress: shippingAddress,
                        ItemDescription: element.itemOrProductDescription,
                        ItemNumber: element.itemNumber,
                        UnitPrice: element.unitPrice || 0,
                        UoM: element.unitOfMeasure,
                        ShippedQty: element.quantity,
                        SubTotal: element.subtotal || 0,
                    });
                }
                csvObj.push({
                    OrderPlacedDate: order.creationDate,
                    OrderNumber: order.id,
                    OrderStatus: order.status,
                    JobName: order.job.jobName,
                    ShippingAddress: shippingAddress,
                    ItemDescription: 'Other charges',
                    ItemNumber: '',
                    UnitPrice: '',
                    UoM: '',
                    ShippedQty: '',
                    SubTotal: order.otherCharges || 0,
                });
                csvObj.push({
                    OrderPlacedDate: order.creationDate,
                    OrderNumber: order.id,
                    OrderStatus: order.status,
                    JobName: order.job.jobName,
                    ShippingAddress: shippingAddress,
                    ItemDescription: 'Order Tax',
                    ItemNumber: '',
                    UnitPrice: '',
                    UoM: '',
                    ShippedQty: '',
                    SubTotal: order.taxes,
                });
                csvObj.push({
                    OrderPlacedDate: order.creationDate,
                    OrderNumber: order.id,
                    OrderStatus: order.status,
                    JobName: order.job.jobName,
                    ShippingAddress: shippingAddress,
                    ItemDescription: 'Order Total',
                    ItemNumber: '',
                    UnitPrice: '',
                    UoM: '',
                    ShippedQty: '',
                    SubTotal: order.itemsTotal,
                });
            } else {
                for (const element of lineItems) {
                    const shippingAddress = this.formatAddress(
                        order.branchAddress
                    );
                    csvObj.push({
                        OrderPlacedDate: order.creationDate,
                        OrderNumber: order.id,
                        OrderStatus: order.status,
                        JobName: order.job.jobName,
                        ShippingAddress: shippingAddress,
                        ItemDescription: element.itemOrProductDescription,
                        ItemNumber: element.itemNumber,
                        UoM: element.unitOfMeasure,
                        ShippedQty: element.quantity,
                    });
                }
            }
        }
        if (csvObj) {
            const sheet = xlsx.utils.json_to_sheet(csvObj);
            const book = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(book, sheet, 'OrderSumarry');
            const option: xlsx.WritingOptions = {
                type: 'array',
                cellDates: false,
                bookSST: false,
                bookType: 'xlsx',
                sheet: '',
                compression: false,
                ignoreEC: true,
            };
            xlsx.writeFile(book, 'OrderSumary.xlsx', option);
        }
    }

    switchEdit() {
        this.editMode = !this.editMode;
    }

    async finalizeOrder() {
        try {
            this.loading = true;
            await this.router.navigate([
                '/proplus/saved-orders/',
                this.orderId,
                'finalize',
            ]);
        } finally {
            this.loading = false;
        }
    }

    openRejectDialog() {
        if (!this.rejectPendingOrder) {
            return;
        }
        this.dialogComp.open(this.rejectPendingOrder, {
            id: 'rejectOrder',
            width: '460px',
        });
    }

    async rejectOrder() {
        try {
            if (this.formReject.valid) {
                const rejectDialog =
                    this.dialogComp.getDialogById('rejectOrder');
                if (rejectDialog) {
                    rejectDialog.close();
                }
                this.loading = true;
                const rejectRequest: RejectSavedOrderRequest = {
                    rejectReason: this.rejectReason,
                    orders: [
                        {
                            id: this.orderId,
                        },
                    ],
                };
                await this.savedOrders.rejectSavedOrder(rejectRequest);
                await this.router.navigate(['/proplus/pending-orders']);
                this.userNotifier.alertError(
                    'The order is rejected successfully'
                );
            } else {
                Object.keys(this.formReject.controls).forEach((key) =>
                    this.formReject.controls[key].markAsTouched()
                );
            }
        } finally {
            this.loading = false;
        }
    }

    orderNameChange(orderName: any) {
        console.log('new order name: ', orderName);
        if (this.savedOrderDetail) {
            this.savedOrderDetail.displayName = orderName;
        }
    }

    askUserToConfirm<T>(config: {
        title: string;
        yesButton?: string;
        noButton?: string;
        question: string;
        whenYes: () => void;
    }) {
        const dialogRef = this.saveDialog.open(ConfirmationDialogComponent, {
            data: {
                confimation: config.yesButton || 'Yes',
                no: config.noButton || 'No',
                question: config.question,
                title: config.title,
            },
        });
        dialogRef.afterClosed().subscribe(async (result: boolean) => {
            if (result) {
                config.whenYes();
            }
        });
    }

    async deleteUploadFile(file: any) {
        this.askUserToConfirm({
            title: 'Delete Order Related Documents',
            question: 'Are you sure you want to delete this document?',
            yesButton: 'Delete',
            noButton: 'No',
            whenYes: async () => {
                try {
                    this.loading = true;
                    const request = {
                        orderId: this.orderId,
                        fileNames: [file],
                    };
                    const response =
                        await this.savedOrders.deleteOrderRelatedDocuments(
                            request
                        );
                    if (response.success) {
                        this._snackBar.open(
                            `Document ${file} deleted`,
                            'Close'
                        );
                    }
                } finally {
                    this.loading = false;
                }
            },
        });
    }

    async downloadOrderDocument(filename: string) {
        try {
            this.loading = true;
            const request = {
                orderId: this.orderId,
                documentName: filename,
            };
            const response =
                await this.savedOrders.downloadOrderRelatedDocument(
                    request.orderId,
                    request.documentName
                );
            if (response) {
                this.openDataUrl(response, filename);
            }
        } finally {
            this.loading = false;
        }
    }

    openDataUrl(dataUrl: Blob, filename: string) {
        if (!dataUrl) {
            return;
        }
        const dataType = dataUrl.type;
        let blob = new Blob([dataUrl], { type: dataType });
        const downloadURL = URL.createObjectURL(blob);
        let link: HTMLAnchorElement | null = document.createElement('a');
        link.href = downloadURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.remove();
        URL.revokeObjectURL(downloadURL);
    }
}

export interface UpdateItemRequest {
    savedOrderId: string;
    savedOrderName: string;
    action: string;
    items: Item[];
}

interface Item {
    id: string;
    quantity: number;
    itemNumber: string | null;
    uom: string;
    color?: string;
    MFG?: string;
}

export interface UpdateItemResponse {
    savedOrderId: string;
    savedOrderName: string;
    items: ItemSavedOrder[];
}

interface ItemSavedOrder {
    id: string;
    imageUrl: string;
    thumbImageUrl: string;
    pdpUrl?: string;
    description?: string;
    itemNumber: string;
    price: number;
    quantity: number;
    uom: string;
    subTotal?: number;
    deleteStatus?: boolean;
    vendorColorId?: string;
    productId: string;
    itemGrayOutLevel?: string;
}
