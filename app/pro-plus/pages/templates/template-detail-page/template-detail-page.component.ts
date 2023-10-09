import { AutoSaveService } from './../../../services/auto-save.service';
import { TemplateReference } from './../../../model/template-list';
import { SkuSelection } from './../../../shared-components/sku-selector/sku-selector.component';
import { SuggestiveSellingItem } from './../../../services/products.service';
import { QuoteService } from './../../../services/quote-service';
import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TemplatesService } from '../../../services/templates.service';
import { ProductImp } from '../../../../global-classes/product-imp';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ShoppingCartService } from '../../../services/shopping-cart-service';
import { UserService, AllUserInfo } from '../../../services/user.service';
import { TemplateViewModel, ITemplateItem } from './template-view-model';
import { AppError } from '../../../../common-components/classes/app-error';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { QuoteListItem } from '../../../model/quote-browse-response';
import { ProductsService } from '../../../services/products.service';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { states, State } from '../../../../global-classes/states';
import { BehaviorSubject } from 'rxjs';
import { MyErrorStateMatcher } from '../../user-admin-detail/user-admin-detail.component';
import { QuoteType } from '../../../model/quote-request';

export interface DialogData {
    productId: string;
    quantity: number;
    productDetail: ProductImp;
}

export interface DialogDataAll {
    accountId: string;
    productId: string;
    searchTerm: string;
    searchCategories?: string[];
}

export interface DialogDataSelector {
    searchTerm: string;
    quantity: number;
    productDetail: ProductImp;
}

export interface CreateNewQuote {
    quoteName: string;
    phoneNumber?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
}

@Component( {
    selector: 'app-template-detail-page',
    templateUrl: './template-detail-page.component.html',
    styleUrls: ['./template-detail-page.component.scss'],
} )
export class TemplateDetailPageComponent implements OnInit, OnDestroy {
    @ViewChild( 'newQuote' ) newQuote?: TemplateRef<any>;
    public model!: TemplateViewModel;
    public error: Error | null = null;
    public isLoading = true;
    public editMode = false;
    public dataSource: ITemplateItem[] = [];
    public quoteList: QuoteListItem[] | null = null;
    public suggestedProds$ = new BehaviorSubject<SuggestiveSellingItem[]>( [] );
    form!: FormGroup;
    userInfo!: AllUserInfo;
    matcher = new MyErrorStateMatcher();
    nicknameControl = new FormControl( '', [] );

    quoteFormControl = new FormControl( '', [Validators.required] );

    public myGroup = new FormGroup( {
        templateName: new FormControl(),
    } );

    public quoteName = '';
    public phoneNumber = '';
    public address1 = '';
    public address2 = '';
    public city = '';
    public state = '';

    hasFormDataChanged = new BehaviorSubject<boolean>( false );

    states: State[] = states;

    get permissionToQuote() {
        return this.userService.permissions.quote.edit;
    }

    onListDrop( event: CdkDragDrop<ITemplateItem[]> ) {
        const source = this.dataSource;
        const prevIndex = event.previousIndex;
        const currentIndex = event.currentIndex;
        moveItemInArray( source, prevIndex, currentIndex );
    }

    constructor(
        private readonly route: ActivatedRoute,
        private readonly templateService: TemplatesService,
        private readonly _snackBar: MatSnackBar,
        private readonly cartService: ShoppingCartService,
        private readonly userService: UserService,
        private readonly quoteService: QuoteService,
        private readonly productService: ProductsService,
        private readonly userNotifier: UserNotifierService,
        public dialogComp: MatDialog,
        private readonly autoSave: AutoSaveService
    ) {
        // this.suggestedProds$ = this.cartService.suggestedProducts$;
    }

    public get displayedColumns(): string[] {
        // if (this.editMode) {
        return [
            'reorder',
            'product',
            'details',
            'qty',
            'unit_price',
            'actions',
            'shop',
        ];
        // } else {
        //   return ['product', 'details', 'unit_price', 'shop'];
        // }
    }

    public get isAllSelected() {
        return this.dataSource.some( ( d ) => d.isSelected );
    }

    public get isAllMixed() {
        return (
            this.dataSource.some( ( d ) => d.isSelected ) &&
            this.dataSource.some( ( d ) => !d.isSelected )
        );
    }

    public set isAllSelected( newValue: boolean ) {
        this.dataSource.forEach( ( t ) => {
            t.isSelected = newValue;
        } );
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    public editTemplate() {
        this.editMode = true;
    }
    async cancelEditTemplate() {
        this.editMode = false;
        await this.model.resetItems();
    }

    /* Malarkey Windsor® Starter Shingles with Scotchgard™ Protector Natural Wood */
    async ngOnInit() {
        await this.waitFor( async () => {
            /* Moved suggestedProducts here for to render more closely with template items */

            const p: ParamMap = this.route.snapshot.paramMap;
            const account: string = p.get( 'accountId' ) || '';
            const templateId = p.get( 'templateId' ) || null;
            if ( !account || !templateId ) {
                throw new Error( 'Must pass templateId in URL' );
            }

            const model = await TemplateViewModel.fetchTemplate(
                templateId,
                account,
                this.templateService,
                this.cartService,
                this.userService,
                this.quoteService,
                this.productService,
                this.userNotifier
            );
            if ( !model ) {
                throw new AppError(
                    `Failed to load template ${templateId} for account ${account}`
                );
            }

            this.model = model;
            this.model.templateName = this.model.templateDetail.templateName;
            this.model.notifications.subscribe( ( message: string ) => {
                this.notify( message );
            } );

            // this.suggestedProds$ = this.templateService.templateItems$;
            this.model.templateItemsChanged.subscribe( ( lines ) => {
                this.dataSource = lines;
            } );

            //  @robert - We need to put this in a function.
            const quoteType: QuoteType = 'draft';
            const request = {
                account: account,
                quoteType,
                pageNo: 0,
                orderBy: 'creationDate desc',
                pageSize: 200,
            };
            const quotes = await this.quoteService.getQuotes( request );
            const quoteList = quotes.draftQuote.quoteList;
            quoteList
                ? quoteList.sort( ( a, b ) => {
                    if ( a.quoteName === b.quoteName ) {
                        return 0;
                    } else if ( a.quoteName > b.quoteName ) {
                        return 1;
                    } else {
                        return -1;
                    }
                } )
                : [];
            this.quoteList = quoteList;
        } );

        this.form = new FormGroup( {
            quoteNameControl: this.quoteFormControl,
        } );

        await this.populateUserInfo();
        this.autoSave.hasFormdataChanged$.subscribe( nextVal => {
            this.hasFormDataChanged.next( nextVal );
        } );
        /* AUTOSAVE inital configuration */
    }
    async ngOnDestroy() {
        /* AUTOSAVE final comparison before destroying component or leaving page */
        /*  this.autoSave.updateFinalFormChange( this.model?.templateItemsChanged.value );
         await this.autoSave.compareHasFormDataChanged();
         if ( this.hasFormDataChanged.value ) {
             console.log( 'auto-saving....' );
             this.saveAll();
         } */
    }



    async addToCart( item: SuggestiveSellingItem ) {
        await this.cartService.addSingleItemToCart(
            1,
            item.defaultItem.itemNumber,
            item.defaultItem.unitOfMeasure
        );
    }

    private async populateUserInfo() {
        const currentUserInfo = await this.userService.getSessionInfo();
        const isLoggedIn =
            ( currentUserInfo && !!currentUserInfo.profileId ) || false;

        if ( currentUserInfo && isLoggedIn ) {
            const phoneNumber = currentUserInfo.mobilePhoneNumber
                ? currentUserInfo.mobilePhoneNumber
                : currentUserInfo.contactPhoneNumber
                    ? currentUserInfo.contactPhoneNumber
                    : currentUserInfo.officePhoneNumber
                        ? currentUserInfo.officePhoneNumber
                        : '';
            this.phoneNumber = phoneNumber;
            if ( currentUserInfo.contactAddress ) {
                this.address1 = currentUserInfo.contactAddress.address1
                    ? currentUserInfo.contactAddress.address1
                    : '';
                this.address2 = currentUserInfo.contactAddress.address2
                    ? currentUserInfo.contactAddress.address2
                    : '';
                this.city = currentUserInfo.contactAddress.city
                    ? currentUserInfo.contactAddress.city
                    : '';
                this.state = currentUserInfo.contactAddress.state
                    ? currentUserInfo.contactAddress.state
                    : '';
            }
        }
    }

    async waitFor<T>( f: () => Promise<T> ): Promise<T> {
        try {
            this.isLoading = true;
            return await f();
        } finally {
            this.isLoading = false;
        }
    }

    async addProductTemplate( result: SkuSelection ) {
        await this.waitFor( () => this.model.addProduct( result ) );
    }

    /* Add a single product to a template form suggestive selling */
    // TODO: Add foundation layout, Review
    async addProductToTemplateFromSuggestiveSelling( product: any ) {
        if ( !this.model.templateName ) {
            this.model.notify( 'Template name is required' );
            return;
        }
        const {
            templateName,
            templateDetail: { accountLegacyId, templateId },
        } = this.model;
        const { itemNumber, unitOfMeasure } = product.defaultItem;

        // get template info
        const templateReference: TemplateReference = {
            templateId,
            templateName,
            accountLegacyId,
            accountName: '',
            templateItems: product,
        };

        await this.templateService.addTemplateItems( templateReference, [
            { templateItemId: '', itemNumber, unitOfMeasure, quantity: 1 },
        ] );

        await this.model.refreshTemplateItems( '' );
        this.model.notify(
            `${product.productName} has been added to template. Please check quantities`
        );
    }

    async updateTemplateItems( jobNumber?: string ) {
        return this.waitFor( () => this.model.refreshTemplateItems( jobNumber ) );
    }

    async copyQuote( quote: QuoteListItem ) {
        await this.model.copyQuote( quote );
    }
    async addItemsToCart() {
        try {
            this.isLoading = true;
            await this.model.addItemsToCart();
        } finally {
            this.isLoading = false;
        }
    }

    notify( message: string ) {
        if ( !message ) {
            return;
        }
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 10000;
        this._snackBar.open( message, 'Close', config );
    }

    public async deleteItem( item: ITemplateItem ) {
        this.userNotifier.askUserToConfirm( {
            title: 'Delete Item',
            question: 'Are you sure you want to delete this item?',
            yesButton: 'Confirm',
            noButton: 'No',
            whenYes: async () => {
                await this.waitFor( () => this.model.deleteItem( item ) );
            },
        } );
    }

    async saveAll() {
        try {
            this.isLoading = true;
            await this.model.updateTemplate();
            // this.editMode = false;
        } finally {
            this.isLoading = false;
        }
    }

    clearQuantity() {
        this.dataSource.forEach( ( i ) => ( i.quantity = 0 ) );
    }

    openDialogNewQuote() {
        if ( !this.newQuote ) {
            return;
        }
        this.dialogComp.open( this.newQuote, { id: 'newQuote', width: '360px' } );
    }

    async createQuote() {
        try {
            if ( this.form.valid ) {
                const newQuoteDialog = this.dialogComp.getDialogById(
                    'newQuote'
                );
                if ( newQuoteDialog ) {
                    newQuoteDialog.close();
                }
                this.isLoading = true;
                const createNewQuoteRequest: CreateNewQuote = {
                    quoteName: this.quoteName,
                    phoneNumber: this.formatPhoneForApi( this.phoneNumber ),
                    address1: this.address1,
                    address2: this.address2,
                    city: this.city,
                    state: this.state,
                };
                await this.model.createQuote( createNewQuoteRequest );
            } else {
                Object.keys( this.form.controls ).forEach( ( key ) =>
                    this.form.controls[key].markAsTouched()
                );
            }
        } finally {
            this.isLoading = false;
        }
    }

    formatPhone( phone: string ) {
        if ( phone ) {
            phone = phone.replace( /^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3' );
        }
        return phone;
    }

    formatPhoneForApi( phone: string ) {
        if ( phone && phone.length > 0 ) {
            phone = phone.replace( /^(\d{3})-(\d{3})-(\d{4})$/, '$1$2$3' );
        }
        return phone;
    }
}

