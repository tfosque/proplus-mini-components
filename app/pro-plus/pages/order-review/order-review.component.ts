import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { CurrencyPipe } from '@angular/common';
import { Job } from '../../model/job';
import {
    FormControl,
    Validators,
    FormGroupDirective,
    NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import {
    ShoppingCartService,
    CartOrderSummary,
    SubmitCurrentOrderRequest,
    Approver,
    CartItems,
    ItemsEntity,
} from '../../services/shopping-cart-service';
import { UserNotifierService } from '../../../common-components/services/user-notifier.service';
import { AppError } from '../../../../app/common-components/classes/app-error';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderReviewStore, createOrderReviewStore } from './order-review-store';
import { ConfirmationDialogComponent } from '../../../global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import {
    SavedOrdersService,
    ApproveSavedOrderRequest,
    SavedOrderRequest,
    SubmitSavedOrderRequest,
    UploadRelatedDocuments,
    UpdateSavedOrderReviewInfoRequest,
    SavedOrderShippingResponse,
} from '../../services/saved-orders.service';
import { BehaviorSubject } from 'rxjs';
import { ProPlusApiBase } from '../../services/pro-plus-api-base.service';
import { BasicResponse, UserService } from '../../services/user.service';
import { AllPermissions } from '../../services/UserPermissions';
import { ApproveDialogueComponent } from './approve-dialogue/approve-dialogue.component';
import { SaveOrderDialogComponent } from '../shopping-cart/save-order-dialog/save-order-dialog.component';
import { CommerceItem } from '../../services/GetOrderApprovalDetailResponse';
import { AddOrderShippingInfoRequest } from '../../services/AddOrderShippingInfoRequest';

interface MyCart {
    atgOrderId: string | null;
    summary: CartOrderSummary | null;
    subTotal: number;
    items: Item[];
}

interface Item {
    productImageUrl: string;
    itemOrProductDescription: string;
    catalogRefId: string;
    unitPrice: number;
    uom: string;
    quantity: number;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            ( control.dirty || control.touched || isSubmitted )
        );
    }
}
@Component( {
    selector: 'app-order-review',
    templateUrl: './order-review.component.html',
    styleUrls: ['./order-review.component.scss'],
} )
export class OrderReviewComponent implements OnInit {
    @ViewChild( 'tabGroup' ) tabGroup?: MatTabGroup;
    //this is to fix the chrome change bug
    @ViewChild( 'fileSelect' ) fileSelect?: ElementRef;
    loading = true;
    displayedColumns2 = ['product', 'details', 'price', 'qty', 'total'];
    userPerm?: AllPermissions;
    approvers?: Approver[];
    public orderReviewStore: OrderReviewStore = createOrderReviewStore();
    public readonly cart = new BehaviorSubject<MyCart>( {
        atgOrderId: null,
        summary: null,
        subTotal: 0,
        items: [],
    } );
    matcher = new MyErrorStateMatcher();
    poFormControl = new FormControl( '', [Validators.required] );
    jobFormControl = new FormControl( '', [Validators.required] );
    jobNameFormControl = new FormControl( '', [Validators.required] );
    firstFormGroup!: FormGroup;
    orderId: string | null = null;
    accountId: number | null = null;
    approverForOrder = false;
    uploadQuoteForm: any;
    // base64File!: string ;
    filename!: any;
    uploadedFiles: string[] = [];
    filetype!: string | undefined;
    displayName: string | null = null;

    config: MatSnackBarConfig = {
        verticalPosition: 'top',
        duration: 10000,
    };
    base64FileData: any = [];
    relatedDocuments: any = {
        blob: Blob,
        filename: [],
    };
    response: BasicResponse = {
        messages: [],
        result: [],
        success: false,
    };
    success = false;
    error: any;
    get subTotal() {
        const cart = this.cart;
        return ( cart && cart.value.subTotal ) || 0;
    }

    get tax() {
        const cart = this.cart;
        const summary = ( cart && cart.value.summary ) || null;
        if ( summary ) {
            return {
                value: this.currencyPipe.transform( summary.tax, 'USD' ),
                cssClass: 'summary-text-right-default-number',
            };
        } else {
            return {
                value: 'Tax calculated at invoicing',
                cssClass: 'summary-text-right-default',
            };
        }
    }

    get otherCharges() {
        const cart = this.cart;
        const summary = ( cart && cart.value.summary ) || null;
        if ( summary && !summary.displayOtherChargeTBD ) {
            return {
                value: this.currencyPipe.transform( summary.otherCharges, 'USD' ),
                cssClass: 'summary-text-right-default-number',
            };
        } else {
            return {
                value: 'Pending',
                cssClass: 'summary-text-right-default',
            };
        }
    }
    get userPermValueApprove() {
        if (
            this.userPerm &&
            ( this.userPerm.order.approve ||
                !this.userPerm.order.submitForApproval )
        ) {
            return true;
        } else {
            return false;
        }
    }

    get total() {
        const cart = this.cart;
        const summary = ( cart && cart.value.summary ) || null;
        if ( summary ) {
            if ( summary.totalMsg ) {
                return {
                    value: summary.totalMsg,
                    cssClass: 'summary-text-total-default-right',
                };
            } else if ( summary.total && !summary.displayOtherChargeTBD ) {
                return {
                    value: this.currencyPipe.transform( summary.total, 'USD' ),
                    cssClass: 'summary-text-total-default-right-number',
                };
            }
        }
        return {
            value: 'Will be calculated at the time of invoicing.',
            cssClass: 'summary-text-total-default-right',
        };
    }

    get isSavedOrder() {
        const queryParams = this.route.snapshot.params;
        const orderId = tryGetString( queryParams['savedOrderId'] );
        if ( typeof orderId === 'string' ) {
            return true;
        } else {
            return false;
        }
    }

    get userPermPlaceOrder() {
        if ( this.userPerm && this.userPerm.order ) {
            if (
                this.userPerm.order.submit ||
                this.userPerm.order.submitForApproval
            ) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly _formBuilder: FormBuilder,
        public saveDialog: MatDialog,
        private readonly _snackBar: MatSnackBar,
        private readonly cartService: ShoppingCartService,
        private readonly currencyPipe: CurrencyPipe,
        private readonly userNotifier: UserNotifierService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly savedOrderService: SavedOrdersService,
        private readonly api: ProPlusApiBase,
        private readonly userService: UserService
    ) {
        this.api.userSession.subscribe( ( s ) => {
            this.accountId = ( s && s.accountId ) || null;
        } );
    }

    async ngOnInit() {
        this.userPerm = await this.userService.getCurrentUserPermission();
        const approverResponse = await this.cartService.getApproverList();
        this.approvers = approverResponse.result;

        const queryParams = this.route.snapshot.params;
        const orderId = tryGetString( queryParams['savedOrderId'] );
        this.orderId = orderId;

        await this.reloadCart();
        if ( typeof orderId === 'string' ) {
            const savedOrderInfo = await this.savedOrderService
                .getSavedOrderReviewInfo( orderId )
                .toPromise();
            // console.log({ orderInfo: savedOrderInfo });
            this.orderReviewStore.dispatch.setSavedOrderReviewResponse(
                savedOrderInfo.result
            );
            this.displayName = savedOrderInfo.result.displayName;
            const o = savedOrderInfo.result;
            this.uploadedFiles =
                savedOrderInfo.result.orderRelatedDocuments || [];
            this.cart.next( {
                atgOrderId: null,
                items: o.commerceItems.map( ( i ) => {
                    return {
                        catalogRefId: i.itemNumber,
                        itemOrProductDescription: i.description,
                        productImageUrl: i.thumbImageUrl,
                        productOnErrorImageUrl: i.thumbOnErrorImageUrl,
                        quantity: i.quantity,
                        unitPrice: i.price,
                        uom: i.uom,
                    };
                } ),
                subTotal: o.subTotal,
                summary: {
                    displayTotalMsg: false,
                    itemsTotal: o.itemsTotal,
                    otherChanges: o.otherCharges,
                    tax: o.taxes,
                    total: o.subTotal,
                    totalMsg: '',
                    displayOtherChargeTBD: false,
                    displayTaxTBD: false,
                },
            } );
            const orderStatus = o.status;
            const assignApproverEmail = o.assignApproval.email;
            this.approverForOrder = await this.isApproverForOrder(
                orderStatus,
                assignApproverEmail
            );
        } else {
            this.loadCheckoutDetails();
        }
    }
    loadCheckoutDetails() {
        this.cartService.cart$.getState().subscribe( ( c ) => {
            this.cart.next( c );
        } );
        this.cartService.getCartsItems();
        this.cartService.getOrderShippingInfo();
        this.cartService.getCurrentOrderReview().subscribe( ( r ) => {
            this.orderReviewStore.dispatch.setOrderReviewResponse( r.result );
            this.orderReviewStore.dispatch.setOrderReviewResponse( r.result );
            this.uploadedFiles = r.result.orderRelatedDocuments || [];
        } );
    }

    async reloadCart() {
        try {
            this.loading = true;
            // tslint:disable-next-line: no-floating-promises
            this.cartService.reloadCart();
            this.firstFormGroup = this._formBuilder.group( {
                firstCtrl: ['', Validators.required],
            } );
            this.loading = false;
        } finally {
            this.loading = false;
        }
    }

    onSubmitForm( event: any ): void {
        console.log( 'event', event );
    }

    async onFileSelect( e: any ): Promise<void> {
        this.relatedDocuments.filename = [];
        const atgOrderId = this.orderId
            ? this.orderId
            : ( this.cart && this.cart.value.atgOrderId ) || null;
        if ( !atgOrderId ) {
            throw new AppError( `Can't upload documents, please reload page` );
        }
        const hasFile = e.target.files && e.target.files[0];
        if ( hasFile ) {
            var filesAmount = e.target.files.length;
            for ( let i = 0; i < filesAmount; i++ ) {
                const fileSize = e.target.files[i].size / 1024 / 1024; // in MiB
                if ( fileSize > 5 ) {
                    this._snackBar.open(
                        'The file is too large and cannot be uploaded. Please reduce the size of file below 5MB and try again.',
                        'Close',
                        this.config
                    );
                } else {
                    await this.uploadFile( e, i, atgOrderId );
                }
            }
            //this is to fix the chrome change bug
            this.fileSelect && ( this.fileSelect.nativeElement.value = null );
        }
    }

    private uploadFile( e: any, i: number, atgOrderId: string ): Promise<void> {
        return new Promise<void>( ( resolve, reject ) => {
            var reader = new FileReader();
            reader.addEventListener( 'error', () => {
                reject( reader.error );
            } );
            reader.onloadend = async ( event: any ) => {
                try {
                    this.relatedDocuments.filename = []; //reset
                    const base64File = event.target.result;
                    if ( !base64File ) {
                        throw new AppError( 'Cannot read the content' );
                    }
                    this.relatedDocuments.filename.push( e.target.files[i].name );
                    const request: UploadRelatedDocuments = {
                        orderId: this.orderId || atgOrderId,
                        relatedDocuments: {
                            blob: new Blob( [base64File], {
                                type: e.target.files[i].type,
                            } ),
                            filename: this.relatedDocuments.filename,
                        },
                    };
                    // upload starts
                    this.response =
                        await this.savedOrderService.uploadOrderRelatedDocuments(
                            request
                        );
                    if ( this.response && this.response.success === true ) {
                        this.uploadedFiles.push( this.response.result[0] );
                        this._snackBar.open(
                            this.response.messages[0].value,
                            'Close',
                            this.config
                        );
                        this.success = true;
                    } else {
                        this._snackBar.open(
                            this.response.messages[0].value,
                            'Close',
                            this.config
                        );
                        this.success = false;
                    }
                    resolve();
                    // upload completed
                } catch ( error ) {
                    this.error = error;
                    reject( new AppError( this.error.message ) );
                }
            };
            reader.readAsArrayBuffer( e.target.files[i] );
        } );
    }

    askUserToConfirm<T>( config: {
        title: string;
        yesButton?: string;
        noButton?: string;
        question: string;
        whenYes: () => void;
    } ) {
        const dialogRef = this.saveDialog.open( ConfirmationDialogComponent, {
            data: {
                confimation: config.yesButton || 'Yes',
                no: config.noButton || 'No',
                question: config.question,
                title: config.title,
            },
        } );
        dialogRef.afterClosed().subscribe( async ( result: boolean ) => {
            if ( result ) {
                config.whenYes();
            }
        } );
    }
    async deleteUploadFile( file: any ) {
        this.askUserToConfirm( {
            title: 'Delete Order Related Documents',
            question: 'Are you sure you want to delete this document?',
            yesButton: 'Delete',
            noButton: 'No',
            whenYes: async () => {
                try {
                    this.loading = true;
                    const atgOrderId =
                        ( this.cart && this.cart.value.atgOrderId ) || null;
                    if ( !atgOrderId ) {
                        throw new Error( 'Error deleting the saved order' );
                    }
                    const request = {
                        orderId: this.orderId || atgOrderId,
                        fileNames: [file],
                    };
                    const response =
                        await this.savedOrderService.deleteOrderRelatedDocuments(
                            request
                        );
                    if ( response.success ) {
                        this._snackBar.open(
                            `Document ${file} deleted`,
                            'Close'
                        );
                        this.loadCheckoutDetails();
                    }
                } finally {
                    this.loading = false;
                }
            },
        } );
    }
    async downloadOrderDocument( filename: string ) {
        try {
            this.loading = true;
            const atgOrderId =
                ( this.cart && this.cart.value.atgOrderId ) || null;
            if ( !atgOrderId ) {
                throw new Error( 'Error deleting the saved order' );
            }
            const request = {
                orderId: this.orderId || atgOrderId,
                documentName: filename,
            };
            const response =
                await this.savedOrderService.downloadOrderRelatedDocument(
                    request.orderId,
                    request.documentName
                );
            if ( response ) {
                this.openDataUrl( response, filename );
            }
        } finally {
            this.loading = false;
        }
    }
    openDataUrl( dataUrl: Blob, filename: string ) {
        if ( !dataUrl ) {
            return;
        }
        const dataType = dataUrl.type;
        let blob = new Blob( [dataUrl], { type: dataType } );
        const downloadURL = URL.createObjectURL( blob );
        let link: HTMLAnchorElement | null = document.createElement( 'a' );
        link.href = downloadURL;
        link.download = filename;
        document.body.appendChild( link );
        link.click();
        document.body.removeChild( link );
        link.remove();
        URL.revokeObjectURL( downloadURL );
    }
    add() {
        this.orderReviewStore.dispatch.addEmail( '' );
    }
    deleteInput( index: number ) {
        this.orderReviewStore.dispatch.deleteEmail( index );
    }

    /* TODO DONE */
    async placeOrder() {
        const cart = this.cart;
        try {
            this.loading = true;
            const { request, canPlaceOrder } = this.orderReviewStore.value;
            if ( !canPlaceOrder ) {
                return;
            }
            const orderId = this.orderId;
            if ( orderId ) {
                await this.placeSavedOrder( orderId, request );
            } else {
                await this.placeCartOrder( cart, request );
            }
        } finally {
            this.loading = false;
        }
    }

    async placeSubmitterOrder(
        approver: Approver,
        orderName: string,
        request: SavedOrderRequest
    ) {
        try {
            if ( orderName ) {
                this.loading = true;
                const saveOrderRequest: SavedOrderRequest = {
                    savedOrderName: orderName,
                    po: request.po,
                    jobName: request.jobName,
                    jobNumber: request.jobNumber,
                    additionalRecipients: request.additionalRecipients.filter(
                        ( a ) => a.length > 0
                    ),
                };
                const saveOrderResponse =
                    await this.savedOrderService.saveOrder( saveOrderRequest );
                if (
                    saveOrderResponse.success &&
                    saveOrderResponse.result &&
                    saveOrderResponse.result.savedOrderId.length > 0
                ) {
                    // saveOrderId is valid, call submitSavedOrder api
                    const savedOrderId = saveOrderResponse.result.savedOrderId;
                    const submitSavedOrderRequest: SubmitSavedOrderRequest = {
                        orderId: savedOrderId,
                        approverId: approver.id,
                        po: request.po,
                        jobName: request.jobName,
                        jobNumber: request.jobNumber,
                        additionalRecipients:
                            request.additionalRecipients.filter(
                                ( a ) => a.length > 0
                            ),
                    };
                    await this.savedOrderService.submitSavedOrder(
                        submitSavedOrderRequest
                    );
                    this.loading = false;
                    await this.router
                        .navigate( [
                            '/proplus/order-for-approval',
                            savedOrderId,
                            'thank-you',
                        ] )
                        .then( async ( x ) => {
                            await this.cartService.clearCart();
                        } );
                }
            } else {
                throw new AppError( `order name is missing` );
            }
        } catch ( err: any ) {
            this.userNotifier.alertError( err.message );
        } finally {
            this.loading = false;
        }
    }

    async placeSubmitterOrderFromSavedOrder(
        approver: Approver,
        request: SavedOrderRequest
    ) {
        try {
            this.loading = true;
            const savedOrderId = this.orderId;
            if ( savedOrderId ) {
                const submitSavedOrderRequest: SubmitSavedOrderRequest = {
                    orderId: savedOrderId,
                    approverId: approver.id,
                    po: request.po,
                    jobName: request.jobName,
                    jobNumber: request.jobNumber,
                    additionalRecipients: request.additionalRecipients.filter(
                        ( a ) => a.length > 0
                    ),
                };
                await this.savedOrderService.submitSavedOrder(
                    submitSavedOrderRequest
                );
                this.loading = false;
                await this.router
                    .navigate( [
                        '/proplus/order-for-approval',
                        savedOrderId,
                        'thank-you',
                    ] )
                    .then( async ( x ) => {
                        await this.cartService.clearCart();
                    } );
            } else {
                throw new AppError( `saved order id is missing` );
            }
        } finally {
            this.loading = false;
        }
    }

    openDialogueApprove( approver: Approver ) {
        const request = this.orderReviewStore.value;
        const submitterRequest: SavedOrderRequest = {
            savedOrderName: '',
            po: request.PO || '',
            jobName: request.jobName || '',
            jobNumber: request.jobNumber || '',
            additionalRecipients: request.additionalRecipients.map(
                ( rec ) => rec.email
            ),
        };
        this.cartService.approverInfo = approver;
        if ( !this.isSavedOrder ) {
            const dialogRef = this.saveDialog.open( ApproveDialogueComponent );
            dialogRef.afterClosed().subscribe( async ( result ) => {
                // tslint:disable-next-line: no-floating-promises
                this.placeSubmitterOrder( approver, result, submitterRequest );
            } );
        } else {
            this.placeSubmitterOrderFromSavedOrder( approver, submitterRequest );
        }
    }

    /* TODO */
    private async placeCartOrder(
        cart: BehaviorSubject<MyCart>,
        request: SubmitCurrentOrderRequest
    ) {
        const atgOrderId = ( cart && cart.value.atgOrderId ) || null;
        if ( !atgOrderId ) {
            throw new AppError( `Can't submit order, please reload page` );
        }

        
        try {
            await this.cartService.submitCurrentOrder( request );
            await this.cartService.getSubmitOrderResult( atgOrderId, '' );
            await this.router.navigateByUrl( '/proplus/thank-you' ).then( ( x ) => {
                this.cartService.clearCart();
            } );
        } catch ( err ) {
            console.error( 'getSubmitOrderResult', err );
            const errMsg:any = err;
            this._snackBar.open(
                errMsg.message,
                'Close',
                this.config
            )
        }
    }
    /* TODO [placeOrder, ] */
    private async placeSavedOrder(
        orderId: string,
        request: SubmitCurrentOrderRequest
    ) {
        const req: ApproveSavedOrderRequest = {
            apiSiteId: 'BPP',
            orderId: orderId,
            po: request.poName,
            additionalRecipients: request.additionalRecipients,
            jobNumber: request.jobNumber,
            jobName: request.jobName,
        };
        await this.savedOrderService.approveSavedOrder( req );

        // const result = await this.cartService.getSubmitOrderResult('', orderId);
        // console.log('getSubmitOrderResult', result);
        await this.router
            .navigate( ['/proplus/saved-orders', orderId, 'thank-you'] )
            .then( async ( x ) => {
                await this.cartService.clearCart();
            } );
    }

    async selectJob( job?: Job ) {
        //  Set default values up top
        this.orderReviewStore.dispatch.setSelectedJob( job || null );
        //  Don't update if it's the same job

        const orderId = this.orderId;
        const store = this.orderReviewStore.value;
        if ( orderId && store && store.displayName ) {
            // const request: SavedOrderRequest = {
            //   additionalRecipients: store.additionalRecipients.map(r => r.email),
            //   jobName: job && job.jobName || '',
            //   jobNumber: job && job.jobNumber || '',
            //   po: store.PO || '',
            //   savedOrderName: store.displayName,
            // };
            // // console.log('Select Job', request);
            // // throw new AppError('Select Job');
            // await this.savedOrderService.saveOrder(request);
        } else {
            await this.cartService.updateCurrentOrderJobNumber(
                ( job && job.jobNumber ) || ''
            );
            await this.reloadCart();
            const message =
                !job || !job.jobName || !job.jobNumber
                    ? `Job Account successfully reset`
                    : `Job Account successfully set to ${job.jobName}`;
            this.userNotifier.alertError( message );
        }
    }

    async goBack() {
        const orderId = this.orderId;
        if ( orderId ) {
            // saved order
            await this.router.navigate( [
                '/proplus/saved-orders/',
                orderId,
                'finalize',
            ] );
        } else {
            // cart order
            await this.router.navigateByUrl( 'proplus/shipping-info' );
        }
    }

    async isApproverForOrder( status: string, assignApproverEmail: string ) {
        if ( status.toLowerCase() === 'ready_for_approval' ) {
            await this.userService.getSessionInfo();
            const session = this.userService.session;
            let acctEmail = '';
            if ( session.sessionInfo && session.sessionInfo.email ) {
                acctEmail = session.sessionInfo.email;
            }
            if ( acctEmail && acctEmail === assignApproverEmail ) {
                return true;
            }
        }
        return false;
    }

    buildRequestFromSavedOrderItems( lineItems: CommerceItem[] ): CartItems {
        const accountId = this.userService.accountIdInString;
        if ( !accountId ) {
            throw new AppError( 'Invalid account' );
        }

        return {
            addItemCount: lineItems.length,
            accountId: accountId,
            items: lineItems.map( ( line ) => {
                const item: ItemsEntity = {
                    catalogRefId: line.itemNumber,
                    productId: line.productId,
                    quantity: line.quantity,
                    uom: line.uom,
                    catalogRefIdChanged: false,
                };
                return item;
            } ),
        };
    }

    buildRequestFromShippingInfo(
        shippingInfo: SavedOrderShippingResponse
    ): AddOrderShippingInfoRequest {
        const states = shippingInfo.shippingAddress.states || [];
        const selectedState = states.find( ( s ) => s.selected );
        const expressDeliveryTimes = shippingInfo.expressDeliveryTimes || [];
        const deliveryTimes = shippingInfo.deliveryTimes || [];
        const selectedTime =
            expressDeliveryTimes.find( ( t ) => t.selected ) ||
            deliveryTimes.find( ( t ) => t.selected );
        const request: AddOrderShippingInfoRequest = {
            deliveryOptionValue: shippingInfo.deliveryOptionValue || 'onHold',
            shippingMethodValue: shippingInfo.shippingMethodValue || 'Pick_up',
            specialInstruction: shippingInfo.instructions,
            deliveryDate: shippingInfo.deliveryDate,
            deliveryTime: ( selectedTime && selectedTime.value ) || undefined,
            shippingAddress: {
                firstName: shippingInfo.contactInfo.firstName,
                lastName: shippingInfo.contactInfo.lastName,
                nickName: shippingInfo.contactInfo.nickName,
                phoneNumber: shippingInfo.contactInfo.phoneNumber || '',
                address1: shippingInfo.shippingAddress.address1,
                address2: shippingInfo.shippingAddress.address2,
                address3: shippingInfo.shippingAddress.address3,
                city: shippingInfo.shippingAddress.city,
                stateValue: ( selectedState && selectedState.value ) || '',
                postalCode: shippingInfo.shippingAddress.postalCode,
                countryValue: shippingInfo.shippingAddress.country,
            },
        };
        return request;
    }

    async saveOrder( result: string, action: string ) {
        const { request } = this.orderReviewStore.value;
        const saveOrderRequest: SavedOrderRequest = {
            savedOrderName: result,
            po: request.poName,
            jobName: request.jobName,
            jobNumber: request.jobNumber,
            additionalRecipients: request.additionalRecipients.filter(
                ( a ) => a.length > 0
            ),
        };
        const response = await this.savedOrderService.saveOrder(
            saveOrderRequest
        );
        if ( response.success ) {
            if ( action === 'emptyCart' ) {
                this.cartService.reloadCart();
                this.userNotifier.alertError( `Created order  ${result}` );
            } else {
                if ( response.result && response.result.savedOrderId ) {
                    console.log( 'order review store: ', request );
                    const savedOrderId = response.result.savedOrderId;
                    const savedOrderResponse =
                        await this.savedOrderService.getOrderApprovalDetailPromise(
                            savedOrderId
                        );
                    if ( savedOrderResponse.success ) {
                        const items = savedOrderResponse.result.commerceItems;
                        if ( items ) {
                            const body =
                                this.buildRequestFromSavedOrderItems( items );
                            const addToCartResult =
                                await this.cartService.addItemsToCartFromOrder(
                                    body
                                );
                            if (
                                addToCartResult &&
                                addToCartResult.addedToCartItems
                            ) {
                                this.cartService.reloadCart();
                                // Add shipping info
                                const savedOrderShippingInfo =
                                    await this.savedOrderService
                                        .getShippingInfo( savedOrderId )
                                        .toPromise();
                                const shippingInfo =
                                    savedOrderShippingInfo.result;
                                if ( shippingInfo ) {
                                    const shippingInfoRequest =
                                        this.buildRequestFromShippingInfo(
                                            shippingInfo
                                        );
                                    await this.cartService.addOrderShippingInfo(
                                        shippingInfoRequest
                                    );
                                }
                                this.userNotifier.alertError(
                                    'Your order has been saved, click on “My Account” and “Saved Orders” to access your saved order.'
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    async openDialogSaveOrder() {
        const orderId = this.orderId;
        if ( orderId ) {
            // saved order or pending order
            const { request } = this.orderReviewStore.value;
            const saveOrderRequest: UpdateSavedOrderReviewInfoRequest = {
                orderId: orderId,
                po: request.poName,
                jobName: request.jobName,
                jobNumber: request.jobNumber,
                additionalRecipients: request.additionalRecipients.filter(
                    ( a ) => a.length > 0
                ),
            };
            const dialogRef = this.saveDialog.open( SaveOrderDialogComponent, {
                data: {
                    fromSavedOrder: true,
                },
            } );
            dialogRef.afterClosed().subscribe( async ( result ) => {
                if ( result ) {
                    await this.savedOrderService.updateSavedOrderReviewInfo(
                        saveOrderRequest
                    );
                    this.userNotifier.alertError(
                        `Saved order is saved ${this.displayName}`
                    );
                    if ( result === 'emptyCart' ) {
                        await this.router.navigate( ['/proplus/saved-orders'] );
                    }
                }
            } );
        } else {
            // regular shopping cart order
            const dialogRef = this.saveDialog.open( SaveOrderDialogComponent );
            dialogRef.afterClosed().subscribe( async ( result ) => {
                // regular shopping cart order
                if ( result && result.orderName ) {
                    await this.saveOrder( result.orderName, result.action );
                    if ( result.action === 'emptyCart' ) {
                        await this.router.navigate( ['/proplus/saved-orders'] );
                    }
                }
            } );
        }
    }
}

export interface Errors {
    error: string;
    subError: string | null;
}

function tryGetString( value: any ) {
    if ( typeof value === 'string' ) {
        return value;
    }
    return null;
}
