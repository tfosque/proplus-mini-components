import { UserService } from '../../services/user.service';
import { AllPermissions } from '../../services/UserPermissions';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, ParamMap, Router } from '@angular/router';
import { map, flatMap, filter } from 'rxjs/operators';
import {
    SavedOrdersService,
    SubmitSavedOrderRequest,
} from '../../services/saved-orders.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GetOrderApprovalDetailResponse } from '../../services/GetOrderApprovalDetailResponse';
import { TemplateItemView } from '../templates/template-detail-page/template-item-view';
import { ProductsService } from '../../services/products.service';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as xlsx from 'xlsx';
import { ExcelObject } from '../order-history-page/order-history-page.component';

import { UserNotifierService } from '../../../common-components/services/user-notifier.service';
import { SkuSelection } from '../../shared-components/sku-selector/sku-selector.component';
import {
    Approver,
    ShoppingCartService,
} from '../../services/shopping-cart-service';
import { AppError } from '../../../common-components/classes/app-error';
import { OrderHistoryService } from '../../services/order-history.service';

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
    selector: 'app-saved-order-details',
    templateUrl: './saved-order-details.component.html',
    styleUrls: ['./saved-order-details.component.scss'],
})
export class SavedOrderDetailsComponent implements OnInit {
    public savedOrder$: Observable<GetOrderApprovalDetailResponse>;
    lineItems$ = new BehaviorSubject<TemplateItemView[]>([]);

    savedOrderDetail?: GetOrderApprovalDetailResponse;
    matcher = new MyErrorStateMatcher();
    loading = true;
    displayedColumns2: string[] = ['orderSummary', 'empty'];

    accountId: string | null = null;
    displayNameControler = new FormControl('', [Validators.required]);
    orderId = '';
    editMode = false;
    lineItems: TemplateItemView[] = [];
    userPerm?: AllPermissions;
    approvers?: Approver[];
    isValid$!: Observable<boolean>;
    isOrderValid$ = new BehaviorSubject<boolean>(false);
    constructor(
        private readonly route: ActivatedRoute,
        private readonly savedOrders: SavedOrdersService,
        private readonly productService: ProductsService,
        private readonly userNotifier: UserNotifierService,
        private readonly router: Router,
        private readonly userService: UserService,
        private readonly cartService: ShoppingCartService,
        private readonly orderService: OrderHistoryService,
    ) {
        const savedOrder$ = this.route.params.pipe(
            filter((s) => this.userService.isLoggedIn),
            map((p: Params) => p['savedOrderId'] || ''),
            flatMap((id) => this.savedOrders.getOrderApprovalDetail(id)),
            map((o) => o.result)
        );

        const lineItems$ = savedOrder$.pipe(
            map((o) =>
                (o.commerceItems || []).map((i) =>
                    TemplateItemView.fromCommerceItem(this.productService, i)
                )
            )
        );

        const p: ParamMap = this.route.snapshot.paramMap;
        const orderId = p.get('savedOrderId') || '0';
        const orderStatus$ = savedOrder$.pipe(
            filter((o) => o.status === 'READY_FOR_SUBMISSION'),
            filter((p) => !this.userPermValueApprove),
            flatMap((s) => this.savedOrders.saveOrderValidate(orderId)),
            map((r) => r.success)
        );

        this.savedOrder$ = savedOrder$;
        lineItems$.subscribe(this.lineItems$);
        this.isValid$ = orderStatus$;
    }

    get pickupValidator() {
        return (
            this.savedOrderDetail &&
            this.savedOrderDetail.deliveryDate &&
            this.savedOrderDetail.deliveryTime
        );
    }

    get loadingBool() {
        return this.loading;
    }

    get validDeliveryOpt() {
        return this.savedOrderDetail && this.savedOrderDetail.deliveryOption;
    }
    get orderValidation() {
        return this.savedOrderDetail && this.savedOrderDetail.instructions;
    }

    get phoneValidation() {
        return (
            this.savedOrderDetail &&
            this.savedOrderDetail.contactInfo &&
            this.savedOrderDetail.contactInfo.phoneNumber
        );
    }

    get getEditMode() {
        return this.editMode;
    }

    get validAddress() {
        return (
            this.savedOrderDetail &&
            this.savedOrderDetail.branchAddress &&
            this.savedOrderDetail.branchAddress.address1 &&
            this.savedOrderDetail.branchAddress.address2 &&
            this.savedOrderDetail.branchAddress.city &&
            this.savedOrderDetail.branchAddress.postalCode &&
            this.savedOrderDetail.branchAddress.state
        );
    }
    get validDeliveryMethod() {
        return this.savedOrderDetail && this.savedOrderDetail.shippingMethod;
    }
    get approver() {
        return this.userPerm && this.userPerm.order.approve;
    }
    get isReadyForSubmission() {
        if (
            (this.savedOrderDetail &&
                this.savedOrderDetail.status === 'READY_FOR_SUBMISSION') ||
            (this.savedOrderDetail &&
                this.savedOrderDetail.status === 'REJECTED_ORDER' &&
                this.userPerm &&
                (this.userPerm.order.submit ||
                    this.userPerm.order.submitForApproval))
        ) {
            return true;
        } else {
            return false;
        }
    }

    get itemsTotal() {
        if (this.savedOrderDetail && this.savedOrderDetail.itemsTotal <= 0) {
            return true;
        } else {
            return false;
        }
    }

    get userPermValueApprove() {
        if (
            this.userPerm &&
            (this.userPerm.order.approve ||
                !this.userPerm.order.submitForApproval)
        ) {
            return true;
        } else {
            return false;
        }
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
            this.userPerm = await this.userService.getCurrentUserPermission();
            if (!this.userPermValueApprove) {
                const approverResponse =
                    await this.cartService.getApproverList();
                this.approvers = approverResponse.result;
            }
            this.savedOrder$.subscribe((v) => (this.savedOrderDetail = v));
            this.lineItems$.subscribe((v) => (this.lineItems = v));
            this.isValid$.subscribe((s) => this.isOrderValid$.next(s));
        } finally {
            this.loading = false;
        }
    }

    async save() {
        try {
            this.loading = true;
            const items = (this.lineItems || []).map((v) => {
                const item = {
                    id: v.lineItemId,
                    itemNumber: v.itemNumber === '0' ? null : v.itemNumber,
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
                    this.userNotifier.alertError(`Saved Order Updated`);
                }
            }
        } finally {
            this.loading = false;
            this.switchEdit();
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

    async exportOrder(pricing: boolean, type: string): Promise<void> {
      const order = this.savedOrderDetail;
      if (!order) {
          return;
      }
      if (type === 'excel') {
          const lineItems = this.lineItems;
          const csvObj: ExcelObject[] = [];
          if (lineItems && order.job && order.branchAddress) {
              if (pricing) {
                  const shippingAddress = this.formatAddress(
                      order.branchAddress
                  );
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
      }else{
        const orderId = this.orderId;
        if (!orderId) {
            throw new AppError(`orderId '${orderId}' is invalid`);
        }
        const url = await this.orderService.downloadSavedOrderAsPDF(
            orderId,
            pricing ? 'true' : 'false'
        );
        this.openDataUrl(url);
      }
    }
    openDataUrl(dataUrl: Blob) {
      if (!dataUrl) {
          return;
      }
      const downloadURL = URL.createObjectURL(dataUrl);
      let link: HTMLAnchorElement | null = document.createElement('a');
      link.href = downloadURL;
      link.download = this.orderId + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      link.remove();
      URL.revokeObjectURL(downloadURL);
  }

    switchEdit() {
        this.editMode = !this.editMode;
    }

    async finalizeOrder() {
        try {
            this.loading = true;
            await this.save();
            await this.router.navigate([
                '/proplus/saved-orders/',
                this.orderId,
                'finalize',
            ]);
        } finally {
            this.loading = false;
        }
    }

    async placeSubmitterOrderFromSavedOrder(approver: Approver) {
        try {
            this.loading = true;
            const savedOrderId = this.orderId;
            this.cartService.approverInfo = approver;
            if (savedOrderId) {
                const submitSavedOrderRequest: SubmitSavedOrderRequest = {
                    orderId: savedOrderId,
                    approverId: approver.id,
                    po: this.savedOrderDetail
                        ? this.savedOrderDetail.po || ''
                        : '',
                    jobName: this.savedOrderDetail
                        ? this.savedOrderDetail.job.jobName || ''
                        : '',
                    jobNumber: this.savedOrderDetail
                        ? this.savedOrderDetail.job.jobNumber || ''
                        : '',
                    additionalRecipients: this.savedOrderDetail
                        ? this.savedOrderDetail.additionalEmailRecipient.filter(
                              (a) => a.length > 0
                          ) || []
                        : [],
                };
                await this.savedOrders.submitSavedOrder(
                    submitSavedOrderRequest
                );
                this.loading = false;
                await this.router.navigate([
                    '/proplus/order-for-approval',
                    savedOrderId,
                    'thank-you',
                ]);
            } else {
                throw new AppError(`saved order id is missing`);
            }
        } finally {
            this.loading = false;
        }
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
