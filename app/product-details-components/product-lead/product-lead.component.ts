import {
    QuoteBrowseResponse,
    QuoteListItem,
} from './../../pro-plus/model/quote-browse-response';
import { QuoteRequest } from './../../pro-plus/model/quote-request';
import {
    QuoteService,
    CreateItemsRequest,
    CreateQuoteRequest,
} from './../../pro-plus/services/quote-service';
import { TemplatesService } from './../../pro-plus/services/templates.service';

import {
    Component,
    OnInit,
    Input,
    OnChanges,
    OnDestroy,
    TemplateRef,
    ViewChild,
    ElementRef,
    AfterViewChecked,
    ChangeDetectorRef,
} from '@angular/core';
import { Image } from '../../global-classes/image';
import { ProductImp, UnitPrice } from '../../global-classes/product-imp';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import {
    FormGroup,
    FormControl,
    Validators,
    FormGroupDirective,
    NgForm,
} from '@angular/forms';
import {
    getActiveVariations,
    IAttrOption,
    applyVariationsFilter,
} from '../../pro-plus/model/variations';
import { ShoppingCartService } from '../../pro-plus/services/shopping-cart-service';
import { UserService } from '../../pro-plus/services/user.service';
import { TemplateReference } from '../../pro-plus/model/template-list';
import { TemplateListResponse } from '../../pro-plus/model/template-list-response';
import { AppError } from '../../common-components/classes/app-error';
import { CreateTemplateDialogComponent } from '../../pro-plus/pages/templates/template-dialog/create-template-dialog/create-template-dialog.component';
import { CreateTemplateRequest } from '../../pro-plus/model/template-creation';
import { UserNotifierService } from '../../common-components/services/user-notifier.service';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { AuxiliaryImage } from '../../../app/global-classes/product-sku';
import {
    ProductDetailsResponse,
    ProductsService,
} from '../../../app/pro-plus/services/products.service';
import { Quote } from '../../../app/pro-plus/model/QuoteModel';
import { State, states } from '../../../app/global-classes/states';
import { JobResponse } from '../../../app/pro-plus/model/job-response';
import { CurrentUser } from '../../pro-plus/model/get-current-user-response';
import { SessionInfo } from './../../pro-plus/services/SessionInfo';
import { filter, take } from 'rxjs/operators';
import { AvailabilityRequest, AvailabilityService } from '../../pro-plus/services/availability.service';

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
    selector: 'app-product-lead',
    templateUrl: './product-lead.component.html',
    styleUrls: ['./product-lead.component.scss'],
})
export class ProductLeadComponent
    implements OnInit, OnChanges, OnDestroy, AfterViewChecked
{
    @ViewChild('newQuote') newQuote?: TemplateRef<any>;
    @ViewChild('colorSwatchUl') colorSwatchUl?: ElementRef;
    public productImages?: Image[];
    public params$!: Observable<Params>;
    private paramsSub!: Subscription;
    public loading = true;
    private _product!: ProductImp;
    private selectedFilters = new Map<string, string>();
    public calculatedFacetOptions: Record<string, IAttrOption[]> = {};

    // public filteredValues!: Observable<any>;

    public quantity = 1;
    public isLoggedIn = false;
    private _selectedUOM?: string;
    public selectedPriceInfo = new BehaviorSubject<UnitPrice | null>(null);
    templates!: TemplateListResponse;
    newQuoteForm!: FormGroup;

    templateList: TemplateReference[] = [];
    quotes?: QuoteBrowseResponse;
    quoteList: QuoteListItem[] = [];
    seeMore = true;
    displayShowMore = false;

    zipFormControl = new FormControl('', [Validators.required]);
    quoteFormControl = new FormControl('', [Validators.required]);
    states: State[] = states;

    matcher = new MyErrorStateMatcher();

    public quote: Quote = {
        quoteId: 'new',
        quoteItems: [],
        status: '',
        quoteName: '',
        city: '',
        jobAccount: {
            jobName: '',
            jobNumber: '',
        },
        phone: '',
        address1: '',
        address2: '',
        state: '',
        workType: '',
        quoteNote: '',
        created: '',
        createdBy: '',
        lastModified: '',
        addtionalQuoteItems: [],
        gst: 0,
        otherCharges: 0,
        subTotal: 0,
        tax: 0,
        total: 0,
        standardQuoteItems: [],
    };
    jobs?: JobResponse;
    private _currentUser: CurrentUser | null = null;
    itemAvailability?: string = '';
    green: boolean = false;
    blue: boolean = false;
    grey: boolean = false;
    color: string = '';
    hasItemAvailabilityError: boolean = false;

    @Input() public get currentUser(): CurrentUser | null {
        return this._currentUser;
    }
    public set currentUser(value: CurrentUser | null) {
        this._currentUser = value;
    }

    @Input() get product() {
        return this._product;
    }
    set product(newProduct: ProductImp) {
        this._product = newProduct;
        if (this._product.currentSKU) {
            this.selectedFilters = this._product.currentSKU.getSelection();
        }
    }

    get accountId() {
        if (this.user.accountIdInString) {
            return this.user.accountIdInString;
        } else {
            return null;
        }
    }

    get colorSwatchUlWidth(): number | null {
        if (!this.colorSwatchUl) {
            return null;
        }
        if (!this.colorSwatchUl.nativeElement) {
            return null;
        }
        if (!this.colorSwatchUl.nativeElement.offsetWidth) {
            return null;
        }
        return this.colorSwatchUl.nativeElement.offsetWidth;
    }

    get colorSwatchLiWidth(): number | null {
        if (!this.colorSwatchUl) {
            return null;
        }
        if (!this.colorSwatchUl.nativeElement) {
            return null;
        }
        if (!this.colorSwatchUl.nativeElement.children) {
            return null;
        }
        if (!this.colorSwatchUl.nativeElement.children[0]) {
            return null;
        }
        return this.colorSwatchUl.nativeElement.children[0].offsetWidth;
    }

    get isAccountClosed() {
        return this.user.isLastSelectedAccountClosed;
    }
    get permissionToQuote() {
        return this.user.permissions.quote.edit;
    }

    productVariationFormGroup?: FormGroup;
    _productImageVideoObj: AuxiliaryImage[] = [];
    // showPricing: boolean = false;
    showPricing = new BehaviorSubject<boolean>(false);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly shoppingCartService: ShoppingCartService,
        private readonly user: UserService,
        private readonly _snackBar: MatSnackBar,
        private readonly templateService: TemplatesService,
        public newTemplateDialog: MatDialog,
        private readonly userNotifier: UserNotifierService,
        private readonly productService: ProductsService,
        private readonly quoteService: QuoteService,
        private readonly changeDetector: ChangeDetectorRef,
        public dialogComp: MatDialog,
        private readonly availability: AvailabilityService
    ) {
        this.color = 'green' ? 'availability-green-text' : 'blue' ? 'availability-blue-text' : 'availability-grey-text';
    }
    
    async ngOnInit() {
        // show pricing
        this.user.sessionBehavior.subscribe((session) => {
            this.showPricing.next(session.permissions.price || false);
        });

        /* Grab product video url */
        if (this._product && this._product.currentSKU) {
            const videos = this._product.currentSKU.auxiliaryImages;
            this._productImageVideoObj = videos;
        }

        try {
            this.params$ = this.route.params;
            this.paramsSub = this.params$.subscribe((curParams) => {
                this.getProductPricing(curParams, this.user.session);
                if (!this.user.isLoggedIn) {
                    this.user.sessionBehavior
                        .pipe(
                            filter((s) => s.isLoggedIn),
                            take(1)
                        )
                        .subscribe((session) => {
                            this.getProductPricing(curParams, session);
                        });
                }
            });

            this.calculatedFacetOptions = this.calculateAllOptions();
            // this.filteredValues = this.calculatedFacetOptions as Observable;
            const userInfo = await this.user.getSessionInfo();
            this.isLoggedIn = (userInfo && !!userInfo.profileId) || false;
            if (this.isLoggedIn) {
                // this.currentUser = await this.user.getCurrentUserInfo();
                // tslint:disable-next-line: no-floating-promises
                // this.loadJobs();
                // tslint:disable-next-line: no-floating-promises
                // tslint:disable-next-line: no-floating-promises
                this.setupQuoteForm();
                this.populateUserInfoForQuote(this.currentUser);
            }
        } finally {
            this.loading = false;
        }
    }

    getProductPricing(curParams: Params, session?: SessionInfo) {
        const itemNumber = curParams.itemNumber || this.product.itemNumber;
        let uomForPricing = this.selectedUOM;
        if (
            curParams.itemNumber &&
            this.product &&
            this.product.skuList &&
            this.product.skuList.length > 0
        ) {
            const activeSku = this.product.skuList.filter(
                (s) => s.itemNumber === curParams.itemNumber
            );
            if (activeSku && activeSku.length > 0) {
                const uomForSku = activeSku.map((i) => i.currentUOM)[0];
                if (uomForSku) {
                    uomForPricing = uomForSku;
                }
            }
        }
        // tslint:disable-next-line: no-floating-promises
        this.product
            .getPriceInfo(
                itemNumber,
                uomForPricing,
                session,
                this.productService
            )
            .then((p) => {
                if (p === null) {
                    p = {
                        UOM: '',
                        orderPricing: [{ price: 0, uom: '' }],
                        price: 0,
                        priceInfo: [{ price: 0, uom: '' }],
                    };
                }
                this.selectedPriceInfo.next(p);
            });
            this.getItemAvailability( itemNumber );            
    }
    setQuantity( quantity: number ) {
        this.quantity = quantity;
        this.getItemAvailability( this.product.itemNumber );
    }
    async getItemAvailability( itemNumber: string ) {
        try {
            const request: AvailabilityRequest = {
                itemNumbers: itemNumber
            }
            const response = await this.availability.getAvailability( request );
            if ( !response.success ) {
                this.hasItemAvailabilityError = true;
            };
            if ( response.success && response.result.items.length > 0 ) {
                this.green = false;
                this.blue = false;
                this.grey = false;
                const item = response.result.items[0];
                const itemAvailableQty = +item.availableQty;
                const itemAvgQty30Days = Math.floor( +item.avgQty30Days );
                switch ( true ) {
                    case ( itemAvailableQty > this.quantity ) && ( itemAvailableQty > itemAvgQty30Days ):
                        this.itemAvailability = 'Available for Pick Up or Delivery';
                        this.green = true;
                        break;
                    case ( itemAvailableQty === 0 ) || ( itemAvailableQty < this.quantity ) || ( itemAvailableQty > this.quantity ) && ( itemAvailableQty < itemAvgQty30Days ):
                        this.itemAvailability = 'Call for Availability';
                        this.blue = true;
                        break;
                    case ( itemAvailableQty > 0 ) && ( itemAvailableQty === this.quantity ):
                        this.itemAvailability = 'Low Stock - Order Now';
                        this.grey = true;
                        break;
                    default:
                        break;
                }
            } else if ( response.success && response.result.items.length === 0 ) {
                this.itemAvailability = 'Call for Availability';
                this.blue = true;
            }
        } catch ( err ) {
            this.hasItemAvailabilityError = true;
            console.log( 'Error getting item availability', err );
        } finally {
            return;
        }
    }

    ngAfterViewChecked() {
        this.changeDetector.detectChanges();
    }

    private setupQuoteForm() {
        this.newQuoteForm = new FormGroup({
            quoteNameControl: this.quoteFormControl,
        });
    }

    private populateUserInfoForQuote(currentUser: CurrentUser | null) {
        if (currentUser) {
            this.quote.phone = currentUser.mobilePhoneNumber
                ? currentUser.mobilePhoneNumber
                : currentUser.contactPhoneNumber
                ? currentUser.contactPhoneNumber
                : currentUser.officePhoneNumber
                ? currentUser.officePhoneNumber
                : '';
            if (currentUser.contactAddress) {
                this.quote.address1 = currentUser.contactAddress.address1 || '';
                this.quote.address2 = currentUser.contactAddress.address2 || '';
                this.quote.city = currentUser.contactAddress.city || '';
                this.quote.state = currentUser.contactAddress.state || '';
            }
        }
    }

    // private async loadJobs() {
    //     const alertUser = true;
    //     this.jobs = await this.user.getUserJobs(alertUser);
    // }

    showSelected(p: string) {}

    formatPhone(phone: string) {
        if (phone) {
            phone = phone.replace(/^(\d{3})\-*(\d{3})\-*(\d{4})$/, '$1-$2-$3');
        }
        return phone;
    }

    async loadQuotes() {
        try {
            if (this.quoteList.length === 0) {
                this.loading = true;
                const accountId = this.accountId;
                if (!accountId) {
                    throw new AppError('No account is selected');
                }
                const request: QuoteRequest = {
                    account: accountId,
                    pageNo: 0,
                    pageSize: 100,
                };
                this.quotes = await this.quoteService.getQuotes(request);
                this.quoteList = this.quotes.draftQuote.quoteList;
            }
        } finally {
            this.loading = false;
        }
    }

    async addItemsToQuote(quote: QuoteListItem) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 10000;
        const itemNumber = this.product.productId;
        const accountId = this.accountId;
        if (!accountId) {
            throw new Error('Couldnt fetch items');
        }
        const request = {
            productId: itemNumber,
            accountId: accountId,
        };
        const uom = this.selectedUOM;
        const item: ProductDetailsResponse | null =
            await this.productService.getItemDetails(request);
        if (!item) {
            throw new Error('Couldnt fetch items');
        }

        const newItem: CreateItemsRequest = {
            id: quote.quoteId,
            quoteItems: [
                {
                    displayName: this.product.productName,
                    itemType: 'I' || null,
                    itemNumber: this.product.itemNumber || null,
                    quantity: this.quantity,
                    uom: uom || '',
                },
            ],
            action: 'CREATE_ITEM',
        };
        const response = await this.quoteService.manageItemsForQuote(newItem);
        if (response && response.success) {
            const message = `Item added to Quote ${quote.quoteName}`;
            this._snackBar.open(message, 'Close', config);
        }
    }

    async loadTemplates() {
        try {
            if (this.templateList.length === 0) {
                this.loading = true;
                const accountId = this.accountId;
                if (!accountId) {
                    throw new AppError('No account is selected');
                }
                this.templates =
                    await this.templateService.getTemplatesByAccount(accountId);
                const templateList = (
                    this.templates.result.templates || []
                ).filter((t) => t.accountLegacyId === accountId);
                templateList.sort((x, y) => {
                    const xVal = x.templateName || '';
                    const yVal = y.templateName || '';
                    if (xVal === yVal) {
                        return 0;
                    } else if (xVal > yVal) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                this.templateList = templateList;
            }
        } finally {
            this.loading = false;
        }
    }
    ngOnDestroy() {
        if (this.paramsSub) {
            this.paramsSub.unsubscribe();
        }
    }

    async addItemsToTemplate(template: TemplateReference) {
        const selectedTemplate = template;
        if (!selectedTemplate) {
            return;
        }

        const quantity = this.quantity;
        const uom = this.selectedUOM;
        const itemNumber = this.product.itemNumber;
        const lineItems = [
            {
                itemNumber: itemNumber,
                quantity: quantity,
                unitOfMeasure: uom,
            },
        ];

        const response = await this.templateService.addTemplateItems(
            template,
            lineItems
        );
        if (response.success) {
            this.userNotifier.itemsAddedToTemplate(lineItems, template);
        }
    }

    openDialogNewTemplate() {
        const dialogRef = this.dialogComp.open(
            CreateTemplateDialogComponent,
            {}
        );

        dialogRef.afterClosed().subscribe(async (templateName: string) => {
            if (templateName) {
                await this.createTemplate(templateName);
            }
        });
    }

    openDialogNewQuote() {
        if (!this.newQuote) {
            return;
        }
        this.dialogComp.open(this.newQuote, { id: 'newQuote', width: '360px' });
    }

    async createQuote() {
        const newQuoteDialog = this.dialogComp.getDialogById('newQuote');
        if (newQuoteDialog) {
            newQuoteDialog.close();
        }
        const quantity = this.quantity;
        const uom = this.selectedUOM;
        const itemNumber = this.product.itemNumber;
        const accountId = this.accountId;
        const currentUser = this.currentUser;
        if (!currentUser) {
            throw new AppError('Please log in');
        }
        if (!accountId) {
            throw new AppError('Cannot create a quote with no account');
        }
        if (!uom) {
            throw new AppError(
                'Cannot create a quote with no a purchasing unit'
            );
        }
        const request: CreateQuoteRequest = {
            quoteName: this.quote.quoteName,
            phoneNumber: this.formatPhoneForApi(this.quote.phone),
            address1: this.quote.address1 || '',
            address2: this.quote.address2 || '',
            city: this.quote.city,
            state: this.quote.state,
            jobName: '',
            quoteNotes: '',
            quoteItems: [
                {
                    itemId: itemNumber,
                    uom: uom || '',
                    quantity: quantity,
                    itemType: 'I',
                    displayName: this.product.productName,
                },
            ],
        };
        if (!this.currentUser || !this.currentUser.accountBranch) {
            throw new Error('Failed to get user info');
        }
        if (itemNumber === '0') {
            throw new Error('You have no stock products to add.');
        }
        const skuCheckResult =
            await this.productService.getSKUBranchOrRegionAvailability({
                skuIds: itemNumber,
                branchId: this.currentUser.accountBranch.branchNumber,
                regionId: this.currentUser.accountBranch.branchRegionId,
                marketId: this.currentUser.accountBranch.market,
            });
        if (
            skuCheckResult === null ||
            !skuCheckResult.result ||
            skuCheckResult.result.length === 0
        ) {
            throw new Error(
                'The product you select is not available in your region'
            );
        }
        const response = await this.quoteService.createQuote(request);
        if (response) {
            const message = `Item(s) added to Quote ${this.quote.quoteName}`;
            const url = [
                '/proplus/accounts/',
                accountId,
                'quotes',
                response.quoteId,
            ];
            this.userNotifier.notifyWithUrl(message, url);
        }
    }

    async createTemplate(templateName: string) {
        const accountId = this.accountId;
        if (accountId === null) {
            throw new Error('No account is selected');
        }
        const uom = this.selectedUOM;
        const lineItems = [
            {
                itemNumber: this.product.itemNumber,
                unitOfMeasure: uom,
                quantity: this.quantity,
                color: '',
                MFG: '',
            },
        ];
        const request: CreateTemplateRequest = {
            templateName: templateName,
            account: accountId,
            items: lineItems,
        };
        const templateResponse = await this.templateService.createTemplate(
            request
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
                throw new AppError(`Error creating template - ${templateName}`);
            }
        }
        this.userNotifier.itemsAddedToTemplate(
            lineItems,
            templateResponse.result
        );
    }

    ngOnChanges() {
        const currentSKU = this.product.currentSKU;
        if (!currentSKU) {
            throw new Error('currentSKU not available');
        }
        // If there are multiple images, set all images alt text to match the product title.
        const auxProductImages = currentSKU.getAuxillaryImagesOnly();
        auxProductImages.forEach(
            (curImage) => (curImage.altText = this.product.productName)
        );

        this.productImages = [
            currentSKU.itemImage.src
                ? currentSKU.itemImage
                : this.product.productImage,
            ...auxProductImages,
        ];

        this.initFormControls();
    }

    /**
     * Wrapper for native "some" array method to check for color variations.
     */
    hasColors(): boolean {
        return this.product.skuList.some((curSku) => !!curSku.getSkuColor());
    }

    /**
     * Initialize the form groups for the variation options based off product variations object.
     */
    initFormControls() {
        const variations = this.product.variations;
        const defaultFacetSelection = this._product.defaultFacetSelection;
        if (variations) {
            const newGroup: Record<string, FormControl> = {};
            const variationKeys = Object.keys(variations);
            variationKeys.forEach((facetName) => {
                const state = defaultFacetSelection.get(facetName) || '';

                newGroup[facetName] = new FormControl(
                    state,
                    Validators.required
                );
            });

            this.productVariationFormGroup = new FormGroup(newGroup);
        }
    }

    public get hasTwoOrMoreUOMs(): boolean {
        const list = this.UOMList;
        return list && list.length > 1;
    }
    public get UOMList() {
        if (!this.product) {
            return [];
        }
        return this.product.UOMList;
    }

    public get selectedUOM() {
        if (this._selectedUOM) {
            return this._selectedUOM;
        }
        if (!this.product) {
            return '';
        }
        const currentSkuUOM = this.product.currentSKU
            ? this.product.currentSKU.currentUOM
            : null;
        return currentSkuUOM || this.product.currentUOM || '';
    }

    public set selectedUOM(newUOM: string) {
        this._selectedUOM = newUOM;
    }

    async buyProduct() {
        if (this.isLoggedIn) {
            try {
                this.loading = true;
                const quantity = this.quantity;
                const uom = this.selectedUOM;
                const itemNumber = this.product.itemNumber;
                const response =
                    await this.shoppingCartService.addSingleItemToCart(
                        quantity,
                        itemNumber,
                        uom
                    );
                if (response.success) {
                    this.shoppingCartService.handleCartPreview('block');
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    });
                    const config = new MatSnackBarConfig();
                    config.verticalPosition = 'top';
                    config.duration = 10000;
                    this._snackBar.open('Item added to cart', 'Close', config);
                }
            } finally {
                this.loading = false;
            }
        } else {
            this.user.loginWithProduct(this.router.url);
            await this.router.navigate(['/proplus/login']);
        }
    }

    getFacetId(index: number) {
        return index === 0 ? 'first-child' : '';
    }

    async setFilter(name: string, value: string) {
        const variations = this.product.variations || {};
        const { newFilters, facetOptions, selectedSKU } = applyVariationsFilter(
            variations,
            this.selectedFilters,
            this.calculatedFacetOptions,
            name,
            value
        );

        if (selectedSKU) {
            await this.navigateToSku(selectedSKU);
        }

        this.selectedFilters = newFilters;

        const variationFormGroup = this.productVariationFormGroup;
        if (!variationFormGroup) {
            return;
        }
        Object.entries(variationFormGroup.controls).forEach(
            ([facetName, control]) => {
                if (this.selectedFilters.has(facetName)) {
                    control.setValue(this.selectedFilters.get(facetName));
                } else {
                    control.setValue('');
                }
            }
        );

        this.calculatedFacetOptions = facetOptions;
    }
    isOptionEnabled(name: string, value: string) {
        const options = this.calculatedFacetOptions[name];
        if (!options) {
            return false;
        }
        const foundOption = options.find((o) => o.value === value);
        if (!foundOption) {
            return false;
        }
        return foundOption.enabled;
    }

    calculateAllOptions(): Record<string, IAttrOption[]> {
        if (!this.product.variations) {
            return {};
        }

        const { facetOptions } = getActiveVariations(
            this.selectedFilters,
            this.product.variations
        );
        return facetOptions;
    }

    public async navigateToSku(sku: string) {
        if (!sku) {
            return;
        }

        await this.router.navigate([
            'productDetail',
            this.product.productId,
            sku,
        ]);
    }

    /**
     * Takes in an array of product numbers and a control name.  Checks if there is a value in the
     * array that can be intersected with the other form groups.  If there is not, returns true.
     * If ther is, returns null.  Null return is needed because of how angular treats attr.disabled.
     * @param curValue an array of product numbers from the current form control.
     * @param controlName Name of the current form control.
     */
    checkIfInvalidOption(curValue: string, controlName: string) {
        const options = this.calculatedFacetOptions[controlName];
        if (!options) {
            return false;
        }
        const foundOption = options.find((o) => o.value === curValue);
        if (!foundOption) {
            return false;
        }
        return foundOption.enabled;
    }

    /**
     * Given an array of item numbers returns the Image from the first matched sku in the product sku list.
     * @param itemNumberArray arry of itemNumbers from a given color option.
     */
    getColorImage(itemNumberArray: string[]): Image {
        const foundSku = this.product.skuList.find((curSku) =>
            itemNumberArray.includes(curSku.itemNumber)
        );
        if (!foundSku) {
            throw new Error('Product Lead - getColorImage failed');
        }
        return foundSku.itemImage;
    }

    hasSingleSelectOption(
        key: string,
        options: Array<IAttrOption> | object | string | null
    ) {
        const productVariationFormGroup = this.productVariationFormGroup;
        if (!productVariationFormGroup) {
            return false;
        }
        if (!productVariationFormGroup.controls) {
            return false;
        }
        if (!productVariationFormGroup.controls[key]) {
            return false;
        }

        if (Array.isArray(options)) {
            return options.length === 1;
        }
        if (!options || typeof options !== 'object') {
            return false;
        }
        return Object.keys(options).length === 1;
    }

    hasMultipleSelectOption(
        key: string,
        options: Array<IAttrOption> | object | string | null
    ) {
        const productVariationFormGroup = this.productVariationFormGroup;
        if (!productVariationFormGroup) {
            return false;
        }
        if (!productVariationFormGroup.controls) {
            return false;
        }
        if (!productVariationFormGroup.controls[key]) {
            return false;
        }

        if (Array.isArray(options)) {
            return options.length > 1;
        }
        if (!options || typeof options !== 'object') {
            return false;
        }
        return Object.keys(options).length > 1;
    }

    productView(p: ProductImp) {
        return getProductView(p);
    }

    log() {
        // tslint:disable-next-line: no-console
        console.log(arguments);
    }

    formatPhoneForApi(phone: string) {
        if (phone && phone.length > 0) {
            phone = phone.replace(/^(\d{3})-(\d{3})-(\d{4})$/, '$1$2$3');
        }
        return phone;
    }
    public excludeEmptyPrices(itemPriceList: { uom: string; price: number }[]) {
        return itemPriceList.filter((p) => p.price !== 0);
    }

    seeMoreColors(seeMore: boolean) {
        this.seeMore = !seeMore;
        if (!seeMore) {
            window.scroll(0, 0);
        }
    }

    getColorThumbnails() {
        const colorColumns = this.getColorColumns();
        const threshhold = 3 * colorColumns;
        this.displayShowMore =
            this.product.thumbnails.length > threshhold ? true : false;
        if (this.seeMore) {
            if (this.product.thumbnails.length > threshhold) {
                return this.product.thumbnails.slice(0, threshhold);
            } else {
                return this.product.thumbnails;
            }
        } else {
            return this.product.thumbnails;
        }
    }

    getColorColumns() {
        const ulWidth = this.colorSwatchUlWidth;
        const liWidth = this.colorSwatchLiWidth;
        if (ulWidth === null) {
            return 1;
        }
        if (liWidth === null) {
            return 8;
        }
        const result = Math.max(1, Math.floor(ulWidth / liWidth));
        return result;
    }
}

function getProductView(product: ProductImp) {
    const { productId, productName, shortDesc, longDesc, skuList } = product;
    const newItem = { productId, productName, shortDesc, longDesc, skuList };
    return newItem;
}
