import { Component, OnInit, ViewChild } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { OrderHistoryService } from '../../services/order-history.service';
import {
    OrderDetailResponseV2,
    DTOrderDetailResponse,
    DTStatus,
    DTPhoto,
} from '../../model/order-detail-response';
import { CurrentUser } from '../../model/get-current-user-response';
import { UserService } from '../../services/user.service';
import * as moment from 'moment';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { OrderHistoryLineItemV2 } from '../../model/order-history-line-item';
import { TemplatesService } from '../../services/templates.service';
import { TemplateReference } from '../../model/template-list';
import {
    ShoppingCartService,
    CartItems,
    ItemsEntity,
} from '../../services/shopping-cart-service';
import { Location } from '@angular/common';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import * as xlsx from 'xlsx';
import { CvsObject } from '../order-history-page/order-history-page.component';
import { BranchAddress } from '../../model/branch-address';
import { OrderHistoryV2 } from '../../model/order-history';
import { AppError } from '../../../common-components/classes/app-error';
import {
    Product,
    ProductsService,
    OrderAlert,
} from '../../services/products.service';
import { CreateTemplateDialogComponent } from '../templates/template-dialog/create-template-dialog/create-template-dialog.component';
import { UserNotifierService } from '../../../../app/common-components/services/user-notifier.service';
import { DeliveryTrackingService } from '../../services/delivery-tracking.service';
import { OrderHistoryPermissions } from '../../services/UserPermissions';
import { BehaviorSubject } from 'rxjs';
import { ApiResponse } from '../../services/pro-plus-api-base.service';
import { PhotoDialogComponent } from './photo-dialog/photo-dialog.component';
import { ConfirmationDialogComponent } from '../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Branch, LocationsService } from 'src/app/services/locations.service';

@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
    isLoading = true;
    isDTStatusLoading = true;
    dataSource = new MatTableDataSource<OrderHistoryLineItemV2>();
    showOrderQty = false;
    displayedColumns: string[] = [
        'product',
        'details',
        'unit_price',
        'qty',
        'subtotal',
    ];
    displayedColumns2: string[] = ['orderSummary', 'empty'];
    public orderId = '';
    public account: CurrentUser | null = null;
    orderNote = '';
    orderDate = '';
    subtotal = 0;
    products: ProductLookup = {};
    templateSelect: TemplateReference | null = null;
    public orderDetailResponse: OrderDetailResponseV2 | null = null;
    msg: Response = {
        messageCode: 0,
        messages: [
            {
                code: '',
                type: '',
                value: '',
            },
        ],
        success: false,
    };
    accountToken: string | null = null;
    cartCheckResult?: any;
    public templateList: TemplateReference[] = [];
    alertResponse = {};
    orderHistoryPermissions: OrderHistoryPermissions;
    dtOrderDetailResponse$ = new BehaviorSubject<ApiResponse<DTOrderDetailResponse> | null>(
        null
    );
    dtStatus$ = new BehaviorSubject<DTStatus | null>(null);
    dtPhotos$ = new BehaviorSubject<DTPhoto[] | null>(null);
    branchInfo: Branch | undefined = undefined;

    get accountId() {
        if (!this.account) {
            return null;
        }
        const accountLegacyId = this.account.lastSelectedAccount
            .accountLegacyId;
        return accountLegacyId;
    }
    get orderTotal(): number {
        if (!this.orderDetailResponse || !this.orderDetailResponse.order) {
            return 0;
        }
        return this.orderDetailResponse.order.total || 0;
    }
    get orderTotalDataSource(): OrderHistoryV2[] {
        if (!this.orderDetailResponse || !this.orderDetailResponse.order) {
            return [];
        }
        return [this.orderDetailResponse.order];
    }

    get isAccountClosed() {
        return this.user.isLastSelectedAccountClosed;
    }

    constructor(
        public dialog: MatDialog,
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly orderService: OrderHistoryService,
        private readonly cartService: ShoppingCartService,
        private readonly user: UserService,
        private readonly router: Router,
        private readonly templateService: TemplatesService,
        private readonly location: Location,
        private readonly locationServices: LocationsService,
        private readonly newTemplateDialog: MatDialog,
        private readonly userNotifier: UserNotifierService,
        private readonly productsService: ProductsService,
        private readonly deliveryService: DeliveryTrackingService
    ) {
        this.orderHistoryPermissions = this.user.permissions.orderhistory;
    }
    @ViewChild(MatSort) sort!: MatSort;

    async ngOnInit() {
        try {
            const userPerm = await this.user.getCurrentUserPermission();
            if (userPerm !== undefined) {
                this.orderHistoryPermissions = userPerm.orderhistory;
            }
            const account = await this.user.getSessionInfo();
            this.account = account;
            if (!this.account) {
                await this.router.navigateByUrl('/proplus/login');
                return;
            }
            if (!this.account.lastSelectedAccount || !this.accountId) {
                throw new Error('There is no selected account for this user');
            }
            const orderDetailResponse = await this.loadOrderResponse();
            
            if(orderDetailResponse.order.shipping && orderDetailResponse.order.shipping?.shippingMethod=='O'){
                this.branchInfo = await this.locationServices.getBranchByNumber(orderDetailResponse.order.shipping.shippingBranch.toString());
            }else if(orderDetailResponse.order.sellingBranch){
                this.branchInfo = await this.locationServices.getBranchByNumber(orderDetailResponse.order.sellingBranch.toString());
            }

            this.orderDetailResponse = orderDetailResponse;
            if (!this.orderDetailResponse || !this.orderDetailResponse.order) {
                throw new Error('Order is undefined');
            }

            const order = orderDetailResponse.order;
            this.orderDate = tryParseDate(order.orderPlacedDate);
            this.orderNote = this.orderDetailResponse.order.specialInstruction
                .slice(0, -2)
                .substr(2);
            this.dataSource.sort = this.sort;
            this.dataSource.data = this.orderDetailResponse.lineItems || [];
            const templateResult = await this.templateService.getTemplatesByAccount(
                this.accountId
            );
            const templateList =
                (templateResult &&
                    templateResult.result &&
                    templateResult.result.templates) ||
                [];
            templateList.sort((a, b) => {
                if (a.templateName === b.templateName) {
                    return 0;
                } else if (a.templateName < b.templateName) {
                    return -1;
                } else {
                    return 1;
                }
            });
            // tslint:disable-next-line: no-floating-promises
            this.templateList = templateList;
            this.alertResponse = await this.deliveryService.getStatusChange(
                this.orderId
            );
            this.orderService.getDTOrderDetail(this.orderId).subscribe((dt) => {
                this.dtOrderDetailResponse$.next(dt);
                if (dt && dt.result) {
                    if (dt.result.DTStatus) {
                        this.dtStatus$.next(dt.result.DTStatus);
                        this.isDTStatusLoading = false;
                    } else {
                        this.isDTStatusLoading = false;
                    }
                    if (dt.result.DTPhotos && dt.result.DTPhotos.length > 0) {
                        this.dtPhotos$.next(dt.result.DTPhotos);
                    }
                } else {
                    this.isDTStatusLoading = false;
                }
            });
        } catch (error : any) {
            const errMessage = error.body.messages[0].value;
            const backToList = () => {
                this.router.navigate([
                    `/proplus/accounts/${this.accountId}/orders`,
                ]);
            };
            if (
                error.body.messages[0].code &&
                error.body.messages[0].code == 5006 
            ) {
                const account =
                    error.body.result && error.body.result.accountId;
                this.askUserToConfirm({
                    title: 'Switch Account',
                    question: errMessage,
                    yesButton: 'Yes',
                    noButton: 'No',
                    account,
                    whenYes: async (accountId: string) => {
                        await this.userService
                            .switchAccount(accountId || '')
                            .then(async (res) => {
                                if (res) {
                                    await this.ngOnInit();
                                }
                            });
                    },
                    whenNo: backToList,
                });
            } 
            if (
                error.body.messages[0].code &&
                error.body.messages[0].code == 5004
            ) {
                const account = this.router.url.slice(18, 24);
                this.askUserToConfirm({
                    title: 'Different Account Associated with Order',
                    question: 'Would you like to switch accounts?',
                    yesButton: 'Yes',
                    noButton: 'No',
                    account,
                    whenYes: async (accountId: string) => {
                        await this.userService
                            .switchAccount(accountId || '')
                            .then(async (res) => {
                                if (res) {
                                    await this.ngOnInit();
                                }
                            });
                    },
                    whenNo: backToList,
                });
            } else {
                this.askUserToConfirm({
                    question: errMessage,
                    yesButton: 'Yes',
                    whenYes: backToList,
                });
            }
        } finally {
            this.isLoading = false;
        }
    }
    async askUserToConfirm(config: {
        yesButton: string;
        question: string;
        whenYes: (accountId?: any) => void;
        title?: string;
        noButton?: string;
        account?: string;
        whenNo?: () => void;
    }) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                confimation: config.yesButton || 'Yes',
                no: config.noButton || '',
                question: config.question,
                title: config.title,
            },
        });
        dialogRef.afterClosed().subscribe(async (result: boolean) => {
            if (result) {
                config.whenYes(config.account || '');
            } else {
                config.whenNo && config.whenNo();
            }
        });
    }

    private async loadOrderResponse() {
        const p: ParamMap = this.route.snapshot.paramMap;
        const queryParams = this.route.snapshot.queryParams;
        this.orderId = p.get('orderId') || '0';
        this.accountToken = queryParams['accountToken'];
        const orderDetailResponse = await this.orderService.getOrderDetail(
            this.orderId,
            this.accountId ? this.accountId : '',
            this.accountToken,
            false
        );
        return orderDetailResponse;
    }

    goBack() {
        this.location.back();
    }

    toggleOrderQty(): void {
        this.showOrderQty = !this.showOrderQty;
    }
    async fillProductNamesAsync(lineItems: OrderHistoryLineItemV2[]) {
        for (const line of lineItems) {
            // tslint:disable-next-line: no-floating-promises
            this.orderService
                .getProductDetail(line.itemNumber)
                .then((element) => {
                    if (element === null) {
                        return;
                    }
                    this.products[element.itemNumber] = element;
                });
        }
    }

    get DeliveryType(): 'Pickup' | 'Delivery' | null {
        const order = this.orderDetailResponse;
        if (!order) {
            return null;
        }

        if (order.DTStatus) {
            return 'Delivery';
        }

        if (!order.order.shipping) {
            return 'Pickup';
        }

        switch (order.order.shipping.shippingMethod) {
            case 'P':
                return 'Delivery';
            case 'O':
                return 'Pickup';
        }
        return 'Pickup';
    }

    // get deliveryInfo() {
    //     // const order = this.orderDetailResponse;
    //     // if (!order || !order.DTStatus) {
    //     //     return null;
    //     // }
    //     // const status = order.DTStatus;

    //     if (!this.dtOrderDetailResponse || !this.dtOrderDetailResponse.DTStatus) {
    //         return null;
    //     }
    //     const status = this.dtOrderDetailResponse.DTStatus;
    //     return {
    //         status: status.contValue,
    //         date: status.statusEndDate,
    //         stages: status.infos.map((s) => ({
    //             stage: s.value,
    //             imageUrl: s.imageUrl,
    //             active: s.active,
    //         })),
    //     };
    // }

    getName(lineItem: OrderHistoryLineItemV2) {
        if (lineItem.skuPDPDisplayTitle) {
            return lineItem.skuPDPDisplayTitle;
        }
        const p = this.products[lineItem.itemNumber];
        if (!p) {
            return lineItem.itemOrProductDescription;
        } else {
            return p.productName || lineItem.itemOrProductDescription;
        }
    }

    public getProdUrl(lineItem: OrderHistoryLineItemV2) {
        if (lineItem && lineItem.productId && lineItem.itemNumber) {
            return ['/productDetail', lineItem.productId, lineItem.itemNumber];
        }
        if (lineItem && lineItem.productId) {
            return ['/productDetail', lineItem.productId];
        }
        return [];
    }

    //  addItemsToTemplate
    async addItemsToTemplate(selectedTemplate: TemplateReference) {
        const accountId = this.accountId;

        if (!accountId || !this.account) {
            throw new AppError('Invalid account');
        }
        if (!selectedTemplate) {
            return;
        }

        const orderDetailResponse = this.orderDetailResponse;
        if (!orderDetailResponse) {
            return;
        }

        const products = this.getLinesToAdd(orderDetailResponse);

        await this.productsService.checkProductsBeforeAdding(
            products,
            'Template',
            async (itemToAdd) => {
                if (!itemToAdd || !itemToAdd.size) {
                    this.userNotifier.alertError(
                        'All items from this order are not available in your region'
                    );
                }
                const itemSetToAdd = new Set(itemToAdd);
                const lineItems = products
                    .filter((v) => itemSetToAdd.has(v.itemNumber))
                    .map((v) => {
                        return {
                            templateItemId: v.productId,
                            itemNumber: v.itemNumber,
                            unitOfMeasure: v.unitOfMeasure,
                            quantity: v.quantity,
                        };
                    })
                    .filter((l) => l.quantity > 0);

                const response = await this.templateService.addTemplateItems(
                    selectedTemplate,
                    lineItems
                );
                if (response.success) {
                    this.userNotifier.itemsAddedToTemplate(
                        lineItems,
                        selectedTemplate
                    );
                }
            }
        );
    }

    stripTags(message: string) {
        const newMessage = message.replace(/<[^>]*>/g, '');
        return newMessage;
    }

    buildRequest(lineItems: OrderHistoryLineItemV2[]): CartItems {
        if (!this.accountId || !this.account) {
            throw new AppError('Invalid accoubnt');
        }

        return {
            addItemCount: lineItems.length,
            accountId: this.accountId,
            items: lineItems.map((line) => {
                const item: ItemsEntity = {
                    catalogRefId: line.itemNumber,
                    productId: line.productId,
                    quantity:
                        line.orderQuantity ||
                        line.shipQuantity ||
                        line.quantity,
                    uom: line.unitOfMeasure,
                    catalogRefIdChanged: false,
                };
                return item;
            }),
        };
    }

    public async addOrderToCart() {
        const orderDetailResponse = this.orderDetailResponse;
        if (!orderDetailResponse) {
            return;
        }
        const filteredItems = this.getStockItemsWithQuantity(
            orderDetailResponse
        );
        const products = this.getLinesToAdd(orderDetailResponse);
        try {
            await this.productsService.checkProductsBeforeAdding(
                products,
                'Cart',
                async (itemToAdd) => {
                    if (!itemToAdd || itemToAdd.size === 0) {
                        this.userNotifier.alertError(
                            'All items from this order are not available in your region'
                        );
                    }
                    const itemSetToAdd = new Set(itemToAdd);
                    const items = filteredItems.filter((v) =>
                        itemSetToAdd.has(v.itemNumber)
                    );
                    const body = this.buildRequest(items);
                    const cartCheckResult2 = await this.cartService.addItemsToCartFromOrder(
                        body
                    );
                    const itemsAdded =
                        (cartCheckResult2 && cartCheckResult2.addedToCartItems) ||
                        [];
                    const resultMessage = itemsAdded.length
                        ? `The following item(s) have been added to cart, ${itemsAdded.join(
                              ', '
                          )}`
                        : `Nothing was added to your cart`;
                    this.userNotifier.alertError(resultMessage);
                }
            );
        } catch (error : any) {
            this.userNotifier.alertError(error);
        }
       
    }

    private getStockItemsWithQuantity(
        orderDetailResponse: OrderDetailResponseV2
    ) {
        return (orderDetailResponse.lineItems || []).filter(
            (i) =>
                (i.itemNumber && i.orderQuantity) ||
                i.shipQuantity ||
                i.quantity > 0
        );
    }

    private getLinesToAdd(orderDetailResponse: OrderDetailResponseV2) {
        return (orderDetailResponse.lineItems || [])
            .map((i) => this.getProductToAdd(i))
            .filter((i) => i.itemNumber && i.quantity > 0);
    }

    private getProductToAdd(line: OrderHistoryLineItemV2) {
        const {
            productImageUrl,
            productId,
            itemNumber,
            unitOfMeasure,
            quantity,
            orderQuantity,
            shipQuantity,
        } = line;
        const prodUrl = this.getProdUrl(line);
        const name = this.getName(line);
        const newQuantity = orderQuantity || shipQuantity || quantity;
        return {
            name,
            productId,
            itemNumber,
            prodUrl,
            productImageUrl,
            unitOfMeasure,
            quantity: newQuantity,
        };
    }

    public async openPhotoDialog(
        imgUrl: string,
        array: DTPhoto[] | null,
        index: number
    ) {
        this.dialog.open(PhotoDialogComponent, {
            data: {
                imageUrl: imgUrl,
                array: array,
                currentImage: index,
            },
        });
    }

    public async addToCart() {
        if (!this.orderDetailResponse) {
            return;
        }
        const body = this.buildRequest(
            this.orderDetailResponse.lineItems || []
        );
        const addToCartResult = await this.cartService.addItemsToCartFromOrder(
            body
        );
        const itemsAdded =
            (addToCartResult && addToCartResult.addedToCartItems) || [];

        const resultMessage = itemsAdded.length
            ? `The following item(s) have been added to cart, ${itemsAdded.join(
                  ', '
              )}`
            : `Nothing was added to your cart`;
        this.userNotifier.alertError(resultMessage);
    }

    public async openDialogAlert() {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
                alert: this.alertResponse,
            },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                // console.log('result, ', result);
                let alertType = '';
                if (result.textAlert && result.phoneNumber) {
                    if (result.emailAlert) {
                        alertType = 'emailAndsms';
                    } else {
                        alertType = 'sms';
                    }
                } else if (result.emailAlert) {
                    alertType = 'email';
                } else {
                    alertType = 'none';
                }
                const phone = result.phoneNumber.replace(/[^0-9]/g, '');
                const alertSettings: OrderAlert = {
                    orderNumber: this.orderId,
                    alertType: alertType,
                    phoneNumber: phone,
                    emailAddress: result.emailAddress,
                    saveToProfile: result.saveToProfile,
                };
                const response = await this.productsService.updateOrderAlert(
                    alertSettings
                );
                if (response.success) {
                    const orderDetailResponse = await this.loadOrderResponse();
                    this.orderDetailResponse = orderDetailResponse;
                    if (
                        !this.orderDetailResponse ||
                        !this.orderDetailResponse.order
                    ) {
                        throw new Error('Order is undefined');
                    }
                    this.userNotifier.alertError(
                        'Alert settings updated successfully'
                    );
                    this.alertResponse = await this.deliveryService.getStatusChange(
                        this.orderId
                    );
                } else {
                    this.userNotifier.alertError(
                        'Error updating alert settings'
                    );
                }
            }
        });
    }

    async exportOrder(pricing: boolean, type: string): Promise<void> {
        const response = this.orderDetailResponse;
        if (!response) {
            return;
        }
        if (type === 'excel' || type === 'csv') {
            const { order, lineItems } = response;
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            const csvObj: CvsObject[] = [];
            if (
                lineItems &&
                order.job &&
                order.shipping &&
                order.shipping.address
            ) {
                if (pricing) {
                    const shippingAddress = this.formatAddress(
                        order.shipping.address
                    );
                    for (const element of lineItems) {
                        csvObj.push({
                            OrderPlacedDate: order.orderPlacedDate,
                            OrderNumber: order.orderId,
                            OrderStatus: this.formatStatus(
                                order.orderStatusCode
                            ),
                            CustPO: order.purchaseOrderNo,
                            JobName: order.job.jobName,
                            ShippingAddress: shippingAddress,
                            ItemDescription: element.itemOrProductDescription,
                            ItemNumber: element.itemNumber,
                            UnitPrice: this.orderHistoryPermissions.withoutPrice
                                ? undefined
                                : element.unitPrice === 0
                                ? undefined
                                : element.unitPrice,
                            UoM: element.unitOfMeasure,
                            ShippedQty: element.quantity,
                            SubTotal: this.orderHistoryPermissions.withoutPrice
                                ? undefined
                                : element.subTotal === 0
                                ? undefined
                                : element.subTotal,
                        });
                    }
                    csvObj.push({
                        OrderPlacedDate: order.orderPlacedDate,
                        OrderNumber: order.orderId,
                        OrderStatus: this.formatStatus(order.orderStatusCode),
                        CustPO: order.purchaseOrderNo,
                        JobName: order.job.jobName,
                        ShippingAddress: shippingAddress,
                        ItemDescription: 'Other charges',
                        ItemNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        ShippedQty: '',
                        SubTotal: this.orderHistoryPermissions.withoutPrice
                            ? undefined
                            : order.otherCharges || 0,
                    });
                    csvObj.push({
                        OrderPlacedDate: order.orderPlacedDate,
                        OrderNumber: order.orderId,
                        OrderStatus: this.formatStatus(order.orderStatusCode),
                        CustPO: order.purchaseOrderNo,
                        JobName: order.job.jobName,
                        ShippingAddress: shippingAddress,
                        ItemDescription: 'Order Tax',
                        ItemNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        ShippedQty: '',
                        SubTotal: this.orderHistoryPermissions.withoutPrice
                            ? undefined
                            : order.tax,
                    });
                    csvObj.push({
                        OrderPlacedDate: order.orderPlacedDate,
                        OrderNumber: order.orderId,
                        OrderStatus: this.formatStatus(order.orderStatusCode),
                        CustPO: order.purchaseOrderNo,
                        JobName: order.job.jobName,
                        ShippingAddress: shippingAddress,
                        ItemDescription: 'Order Total',
                        ItemNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        ShippedQty: '',
                        SubTotal: this.orderHistoryPermissions.withoutPrice
                            ? undefined
                            : order.total,
                    });
                } else {
                    for (const element of lineItems) {
                        const shippingAddress = this.formatAddress(
                            order.shipping.address
                        );
                        csvObj.push({
                            OrderPlacedDate: order.orderPlacedDate,
                            OrderNumber: order.orderId,
                            OrderStatus: this.formatStatus(
                                order.orderStatusCode
                            ),
                            CustPO: order.purchaseOrderNo,
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

            if (csvObj && type === 'csv') {
                const sheet = xlsx.utils.json_to_sheet(csvObj);
                const book = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(book, sheet, 'OrderSumarry');
                const option: xlsx.WritingOptions = {
                    type: 'array',
                    cellDates: false,
                    bookSST: false,
                    bookType: 'csv',
                    sheet: '',
                    compression: false,
                    ignoreEC: true,
                };
                xlsx.writeFile(book, 'OrderSumary.csv', option);
            }
            if (csvObj && type === 'excel') {
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
        } else {
            // PDF download
            const orderId = this.orderId;
            if (!orderId) {
                throw new AppError(`orderId '${orderId}' is invalid`);
            }
            if (!this.accountId) {
                throw new AppError(`accountId is invalid`);
            }
            const url = await this.orderService.downloadOrderDetailAsPDF(
                this.accountId,
                orderId,
                this.accountToken || '',
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

    formatAddress(shipAdd: BranchAddress) {
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
    formatStatus(
        orderStatus: 'P' | 'R' | 'I' | 'N' | 'C' | 'K' | 'O' | undefined
    ) {
        switch (orderStatus) {
            case 'I':
                return 'Invoiced';
            case 'R':
                return 'Delivered';
            case 'P':
                return 'Delivered';
            case 'C':
                return 'Processing';
            case 'O':
                return 'Ready Delivery / Pick up';
            case 'K':
                return 'Processing';
            case 'N':
                return 'Pending';
            default:
                return 'Status Unavailable';
        }
    }

    openDialogNewTemplate() {
        const dialogRef = this.newTemplateDialog.open(
            CreateTemplateDialogComponent,
            {}
        );

        dialogRef.afterClosed().subscribe(async (templateName: string) => {
            if (templateName) {
                await this.createTemplate(templateName);
            }
        });
    }

    async createTemplate(templateName: string) {
        // //  Todo - Use the selector
        const accountId = this.accountId;
        if (accountId === null) {
            throw new Error('No account is selected');
        }
        // const orderItems = await this.orderService.getOrderDetail(this.orderId, accountId.toString(), this.accountToken);

        const orderDetailResponse = this.orderDetailResponse;
        if (!orderDetailResponse) {
            return;
        }

        const products = this.getLinesToAdd(orderDetailResponse);
        await this.productsService.checkProductsBeforeAdding(
            products,
            'Template',
            async (itemToAdd) => {
                if (!itemToAdd || !itemToAdd.size) {
                    this.userNotifier.alertError(
                        'All items from this order are not available in your region'
                    );
                }

                const lineItems = products
                    .filter((v) => itemToAdd.has(v.itemNumber))
                    .map((v) => {
                        return {
                            templateItemId: v.productId,
                            itemNumber: v.itemNumber,
                            unitOfMeasure: v.unitOfMeasure,
                            quantity: v.quantity,
                        };
                    });
                const templateResponse = await this.templateService.createTemplate(
                    {
                        templateName: templateName,
                        account: accountId,
                        items: lineItems,
                    }
                );
                if (!templateResponse || !templateResponse.success) {
                    if (templateResponse.messages && templateResponse.messages[0]) {
                        const errorMessage = templateResponse.messages[0];
                        if (errorMessage.value && errorMessage.value.indexOf('duplicate') > -1) {
                            this.userNotifier.alertError(`Template ${templateName} already exists, please enter a different name.`);
                        } else {
                            this.userNotifier.alertError(`Error creating template - ${templateName}. ${errorMessage.value}`);
                        }
                        return;
                    } else {
                        throw new AppError(
                            `Error creating template - ${templateName}`
                        );
                    }
                }
                this.userNotifier.itemsAddedToTemplate(
                    lineItems,
                    templateResponse.result
                );
            }
        );
    }

    upgradeEVReport() {
        if (
            this.orderDetailResponse &&
            this.orderDetailResponse.EVReportId &&
            this.orderDetailResponse.EVEligibleForUpgrade
        ) {
            const eagleViewRptId = this.orderDetailResponse.EVReportId;
            this.router.navigate([`/proplus/eagle-view/upgrade-report/${eagleViewRptId}/OrderDetail`]);
        } else {
            this.userNotifier.alertError('Could not upgrade Eagleview report');
        }
    }
}
interface ProductLookup {
    [key: string]: Product;
}
interface Response {
    messages: Message[];
    messageCode: number;
    success: boolean;
}
interface Message {
    type: string;
    value: string;
    code: string;
}

function tryParseDate(orderPlacedDate: string | undefined): string {
    let parsedDate = moment(orderPlacedDate, 'MM-DD-YYYY');
    if (parsedDate.isValid()) {
        return parsedDate.format('MM/DD/YYYY');
    }
    parsedDate = moment(orderPlacedDate);
    return parsedDate.format('MM/DD/YYYY');
}
