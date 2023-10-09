import {
    QuoteService,
    CreateItemsRequest,
    CreateQuoteItem,
    CreateQuoteRequest,
} from './../../../services/quote-service';
import { QuoteListItem } from './../../../model/quote-browse-response';
import { AttributeValues } from '../../../model/attribute-values';
import { TemplatesService } from '../../../services/templates.service';
import { JobResponse } from '../../../model/job-response';
import { Product } from '../../../../api-response-interfaces/product';
import {
    ShoppingCartService,
    ItemsEntity,
    CartItems,
} from '../../../services/shopping-cart-service';
import { SkuSelection } from '../../../shared-components/sku-selector/sku-selector.component';
import { AccountsResponse } from '../../../model/accounts-response';
import { AccountDetails } from '../../../model/account-with-branch';
import { CopyRequest } from '../template-browse-page/template-browse-page.component';
import { CreateNewQuote } from '../template-detail-page/template-detail-page.component';
import { UserService, AllUserInfo } from '../../../services/user.service';
import {
    UpdateTemplateRequest,
    TemplateUpdateItem,
} from '../../../model/update-template-request';
import { BehaviorSubject } from 'rxjs';
import { Variations, IAttrOption } from '../../../model/variations';
import { AppError } from '../../../../common-components/classes/app-error';
import { TemplateItemView } from './template-item-view';
import { ProductsService } from '../../../services/products.service';
import { ImageUrl } from '../../../model/image-url';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { Quote } from '../../../model/QuoteModel';
import { VendorColor } from '../../../model/template-item';

export class TemplateViewModel {
    public jobNumber?: string;
    userInfo!: AllUserInfo;
    jobNumberSelected = '';
    private _templateName = '';
    public get templateName() {
        return this._templateName;
    }
    public set templateName(templateName: string) {
        this._templateName = templateName;
    }
    private get templateItems() {
        return this.templateDetail.templateItems;
    }

    public showMore: Array<{
        templateItemId: string;
        show: boolean;
    }> = [];

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

    public readonly notifications = new BehaviorSubject('');
    public readonly templateItemsChanged = new BehaviorSubject<ITemplateItem[]>(
        []
    );

    // Fetches a template or throws an exception
    public static async fetchTemplate(
        templateId: string,
        account: string,
        templateService: TemplatesService,
        cartService: ShoppingCartService,
        userService: UserService,
        quoteService: QuoteService,
        productService: ProductsService,
        userNotifier: UserNotifierService
    ) {
        const alertUser = false;
        const r = {
            accounts: await userService.ensureGetAccounts(),
            jobs: (await userService.getUserJobs(alertUser, account)) || [],
            templateDetailResponse: await templateService.getTemplateDetail(
                templateId,
                account
            ),
        };
        const { accounts, jobs, templateDetailResponse } = r;
        if (!templateDetailResponse) {
            return null;
        }

        const details = templateDetailResponse.result;

        const templateDetails = {
            ...details,
            templateItems: details.templateItems.map((l) =>
                TemplateItemView.fromTemplateItem(productService, l)
            ),
        };

        const unmodifiedLineItems = details.templateItems
            .map((i) => ({ ...i }))
            .map((l) => TemplateItemView.fromTemplateItem(productService, l));

        const model = new TemplateViewModel(
            templateId,
            account,
            templateDetails,
            accounts,
            jobs,
            templateService,
            cartService,
            quoteService,
            productService,
            userNotifier,
            unmodifiedLineItems
        );

        await model.refreshTemplateItems();

        return model;
    }

    private constructor(
        public templateId: string,
        public account: string,
        public templateDetail: ITemplateDetail,
        public readonly accounts: AccountsResponse,
        public readonly jobAccount: JobResponse,
        private readonly templateService: TemplatesService,
        private readonly cartService: ShoppingCartService,
        private readonly quoteService: QuoteService,
        private readonly productService: ProductsService,
        private readonly userNotifier: UserNotifierService,
        public unmodifiedLineItems: ITemplateItem[]
    ) {}

    // Notifies the user something occurred
    notify(message: string) {
        this.notifications.next(message);
    }

    public getComparison() {
        return Array.from(this.getModifiedItems());
    }

    get hasModifiedItems() {
        if (
            this._templateName &&
            this._templateName !== this.templateDetail.templateName
        ) {
            return true;
        }
        if (this.hasChangesLines()) {
            return true;
        }
        return Array.from(this.getModifiedItems()).length > 0;
    }

    public hasChangesLines() {
        const unmodified = this.unmodifiedLineItems || [];
        const current = this.templateDetail.templateItems || [];
        if (unmodified.length !== current.length) {
            return true;
        }
        for (let i = 0; i < current.length; i++) {
            if (!isLineTheSame(current[i], unmodified[i])) {
                return true;
            }
        }
        return false;
    }

    private *getModifiedItems() {
        const unmodified = new Map(
            this.unmodifiedLineItems.map(
                (i) => [i.lineItemId, i] as [string, ITemplateItem]
            )
        );
        const items = new Map(
            this.templateDetail.templateItems.map(
                (i) => [i.lineItemId, i] as [string, ITemplateItem]
            )
        );
        for (const key of items.keys()) {
            const un = unmodified.get(key);
            const i = items.get(key);

            if (!i) {
                continue;
            }
            if (un) {
                const isSame = isLineTheSame(un, i);
                if (!isSame) {
                    yield i;
                }
            }
        }
    }

    get accountId() {
        if (!this.templateDetail) {
            return '0';
        }
        return this.account;
    }

    async resetItems() {
        this.templateDetail.templateItems = this.unmodifiedLineItems;
        await this.refreshTemplateItems();
    }

    async copyAccount(account: AccountDetails) {
        const request: CopyRequest = {
            account: account.accountLegacyId,
            templateId: this.templateId,
        };
        const response = await this.templateService.copyTemplate(request);
        if (response.success) {
            this.notify(
                `Copy template ${request.templateId} to account ${account.accountName}`
            );
        }
    }
    async copyQuote(quote: QuoteListItem) {
        const filteredItems = this.getItemsToAdd();
        const products = filteredItems.map((i) => this.getProduct(i));
        await this.productService.checkProductsBeforeAdding(
            products,
            'Quote',
            async (itemToAdd) => {
                if (!itemToAdd) {
                    this.userNotifier.alertError(
                        'All items from this template are not available for quote'
                    );
                }
                const itemSetToAdd = new Set(itemToAdd);
                const quoteItems = filteredItems
                    .filter((v) => itemSetToAdd.has(v.currentSKU))
                    .map((v) => {
                        const item: CreateQuoteItem = {
                            itemNumber: v.currentSKU,
                            itemType: 'I',
                            uom: v.unitOfMeasure,
                            quantity: v.quantity,
                            displayName: v.itemOrProductDescription,
                        };
                        return item;
                    });

                const request: CreateItemsRequest = {
                    id: quote.quoteId,
                    quoteItems: quoteItems,
                    action: 'CREATE_ITEM',
                };

                const response = await this.quoteService.updateItems(request);

                if (response && response.success) {
                    const message = 'Copy to quote Successful';
                    const url = [
                        '/proplus/accounts/',
                        this.accountId,
                        'quotes',
                        quote.quoteId,
                    ];
                    this.userNotifier.notifyWithUrl(message, url);
                }
            }
        );
    }

    private getItemsToAdd() {
        const templateDetails = this.templateDetail;
        return ((templateDetails && templateDetails.templateItems) || [])
            .filter((d) => d.itemNumber && d.isSelected && d.quantity > 0)
            .map((v) => {
                if (v.variations) {
                    let item: ITemplateItem = v;
                    item.itemNumber = v.currentSKU;
                    if (v.vendorColors) {
                        if (v.vendorColors.length > 0) {
                            const selectedColor = v.facetSelectors
                                .filter((fs) => fs.name === 'color')
                                .map((fs) => fs.value)
                                .find((fs) => true);
                            const selectedMFG = v.facetSelectors
                                .filter((fs) => fs.name === 'MFG')
                                .map((fs) => fs.value)
                                .find((fs) => true);
                            if (selectedColor && selectedMFG) {
                                const vendorColorId = v.vendorColors
                                    .filter(
                                        (vc) =>
                                            vc.color === selectedColor &&
                                            vc.MFG === selectedMFG
                                    )
                                    .map((vc) => vc.id)
                                    .find((vc) => true);
                                if (vendorColorId) {
                                    item.vendorColorId = vendorColorId;
                                }
                            }
                        }
                    }
                    return item;
                } else {
                    return v;
                }
            });
    }

    async createQuote(quote: CreateNewQuote) {
        const accountId = this.accountId;
        const filteredItems = this.getItemsToAdd();
        const products = (filteredItems || []).map((i) => this.getProduct(i));
        await this.productService.checkProductsBeforeAdding(
            products,
            'Quote',
            async (itemToAdd) => {
                if (!itemToAdd) {
                    this.userNotifier.alertError(
                        'All items from this template are not available for quote'
                    );
                }
                const itemSetToAdd = new Set(itemToAdd);
                const quoteItems = filteredItems
                    .filter((v) => itemSetToAdd.has(v.currentSKU))
                    .map((v) => {
                        const item = {
                            itemId: v.currentSKU,
                            itemType: 'I',
                            uom: v.unitOfMeasure,
                            quantity: v.quantity,
                            displayName: v.itemOrProductDescription || '',
                        };
                        return item;
                    });
                const request: CreateQuoteRequest = {
                    quoteName: quote.quoteName,
                    phoneNumber: quote.phoneNumber,
                    address1: quote.address1 || '',
                    address2: quote.address2 || '',
                    city: quote.city,
                    state: quote.state,
                    jobName: '',
                    quoteNotes: '',
                    quoteItems: quoteItems,
                };
                const response = await this.quoteService.createQuote(request);
                if (response) {
                    const message = `Item(s) added to Quote ${quote.quoteName}`;
                    const url = [
                        '/proplus/accounts/',
                        accountId,
                        'quotes',
                        response.quoteId,
                    ];
                    this.userNotifier.notifyWithUrl(message, url);
                }
            }
        );
    }

    async addProduct(result: SkuSelection) {
        if (!result) {
            return;
        }
        const {
            quantity,
            sku: { itemNumber },
        } = result;
        if (!itemNumber) {
            return;
        }
        const unitOfMeasure = result.uom;
        //Implements autosave before adding an item
        if (this.templateItems.length > 0) {
            await this.updateTemplate(false);
        }
        await this.addItem({ itemNumber, quantity, unitOfMeasure });
    }

    async refreshTemplateItems(
        jobNumber?: string,
        newlyAddedItemNumber?: string
    ) {
        if (jobNumber) {
            this.jobNumberSelected = jobNumber;
        } else {
            this.jobNumberSelected = '';
        }
        let selectedItems = this.templateItems
            .filter((i) => i.isSelected)
            .map((i) => i.itemNumber);
        if (newlyAddedItemNumber) {
            selectedItems.push(newlyAddedItemNumber);
        }
        const templateDetailResponse =
            await this.templateService.getTemplateDetail(
                this.templateId,
                this.account,
                jobNumber || undefined
            );
        if (!templateDetailResponse) {
            throw new AppError(
                `Failed to load template ${this.templateId} for account ${this.account}`
            );
        }
        const { success, messages, result } = templateDetailResponse;
        if (!success) {
            throw messages;
        }

        this.unmodifiedLineItems = result.templateItems
            .map((i) => ({ ...i }))
            .map((i) =>
                TemplateItemView.fromTemplateItem(
                    this.productService,
                    i,
                    selectedItems.some(
                        (itemNumber) => itemNumber === i.itemNumber
                    )
                )
            );
        this.templateDetail = {
            ...result,
            templateItems: result.templateItems.map((i) =>
                TemplateItemView.fromTemplateItem(
                    this.productService,
                    i,
                    selectedItems.some(
                        (itemNumber) => itemNumber === i.itemNumber
                    )
                )
            ),
        };
        this.templateItemsChanged.next(this.templateItems);
        for (const item of this.templateItems) {
            this.showMore.push({
                templateItemId: item.lineItemId || '',
                show: false,
            });
        }
    }

    async saveSpecs(item: TemplateItemView) {
        if (!item.selectedSKU) {
            throw new AppError('Must select a SKU');
        }
        // console.log('saveSpecs', item);
        const request: UpdateTemplateRequest = {
            action: 'updateItem',
            templateId: this.templateId,
            account: this.accountId,
            templateName: this.templateName,
            items: [
                {
                    templateItemId: item.lineItemId,
                    itemNumber: item.selectedSKU,
                    unitOfMeasure: item.unitOfMeasure,
                    quantity: item.quantity,
                    itemNumberChanged: true,
                },
            ],
        };

        const { success, messages } =
            await this.templateService.updateTemplateItems(request);
        if (!success) {
            throw messages;
        }

        await this.refreshTemplateItems();
    }
    //  TODO:  We should really have a type for this
    async addItem(result: {
        itemNumber: string;
        quantity: number;
        unitOfMeasure: string;
    }) {
        if (!this.templateName) {
            this.notify('Template name is required');
            return;
        }
        const response = await this.templateService.updateTemplate({
            action: 'createItem',
            templateId: this.templateId,
            account: this.account,
            templateName: this.templateName,
            items: [
                {
                    itemNumber: result.itemNumber,
                    quantity: result.quantity,
                    unitOfMeasure: result.unitOfMeasure,
                },
            ],
        });
        if (response && response.success) {
            await this.refreshTemplateItems(undefined, result.itemNumber);
        }
    }

    public async addItemsToCart() {
        const filteredTemplateItems = this.getItemsToAdd();
        console.log('template detail', this.jobAccount);
        this.cartService.updateCurrentOrderJobNumber(this.jobNumberSelected);
        const products = filteredTemplateItems.map((i) => this.getProduct(i));
        await this.productService.checkProductsBeforeAdding(
            products,
            'Cart',
            async (itemToAdd) => {
                if (!itemToAdd) {
                    this.userNotifier.alertError(
                        'All items from this template are not available for quote'
                    );
                }
                const items = filteredTemplateItems.filter((v) =>
                    itemToAdd.has(v.itemNumber)
                );
                const body = this.buildRequest(items);
                const cartCheckResult2 =
                    await this.cartService.addItemsToCartFromOrder(body);
                const itemList =
                    (cartCheckResult2 && cartCheckResult2.addedToCartItems) ||
                    [];
                const resultMessage = itemList.length
                    ? `The following item(s) have been added to cart, ${itemList.join(
                          ', '
                      )}`
                    : `Nothing was added to your cart`;
                this.userNotifier.alertError(resultMessage);
            }
        );
    }

    private getProduct(line: ITemplateItem) {
        const {
            imageUrl,
            productOrItemNumber,
            itemOrProductDescription,
            currentSKU,
            unitOfMeasure,
            quantity,
        } = line;
        const prodUrl = this.getProdUrl(line);
        const productImageUrl = imageUrl ? imageUrl.thumbnail : '';
        return {
            name: itemOrProductDescription || '',
            productId: productOrItemNumber || '0',
            itemNumber: currentSKU,
            prodUrl: prodUrl,
            productImageUrl: productImageUrl || '',
            unitOfMeasure: unitOfMeasure,
            quantity: quantity,
        };
    }

    public getProdUrl(lineItem: ITemplateItem) {
        if (lineItem && lineItem.productOrItemNumber && lineItem.currentSKU) {
            return [
                '/productDetail',
                lineItem.productOrItemNumber,
                lineItem.currentSKU,
            ];
        }
        if (lineItem && lineItem.productOrItemNumber) {
            return ['/productDetail', lineItem.productOrItemNumber];
        }
        return [];
    }

    async updateTemplate(showMessage: boolean = true) {
        if (!this.templateDetail) {
            return;
        }
        if (!this.templateName) {
            this.notify('Template name is required');
            return;
        }
        let itemsToSave = this.templateDetail.templateItems;
        if (!itemsToSave || !itemsToSave.length) {
            itemsToSave = this.templateDetail.templateItems;
        } else {
            this.templateItems.forEach((i) => {
                if (i.variations) {
                    i.itemNumber = i.currentSKU;
                }
            });
        }
        const request: UpdateTemplateRequest = {
            invokeBy: 'store',
            ignoreInvalidItems: true,
            templateId: this.templateDetail.templateId,
            account: this.account,
            templateName: this.templateName,
            action: 'updateItem',
            items: itemsToSave.map((v) => {
                if (v.variations) {
                    let item: TemplateUpdateItem = {
                        templateItemId: v.lineItemId,
                        itemNumber: v.currentSKU,
                        unitOfMeasure: v.unitOfMeasure,
                        quantity: v.quantity || 0,
                        nickName: v.nickName || null,
                        // color: v.variations.color || null,
                        // MFG: v.variations.MFG || null
                    };
                    if (v.vendorColors) {
                        if (v.vendorColors.length > 0) {
                            const selectedColor = v.facetSelectors
                                .filter((fs) => fs.name === 'color')
                                .map((fs) => fs.value)
                                .find((fs) => true);
                            const selectedMFG = v.facetSelectors
                                .filter((fs) => fs.name === 'MFG')
                                .map((fs) => fs.value)
                                .find((fs) => true);
                            if (selectedColor && selectedMFG) {
                                const vendorColorId = v.vendorColors
                                    .filter(
                                        (vc) =>
                                            vc.color === selectedColor &&
                                            vc.MFG === selectedMFG
                                    )
                                    .map((vc) => vc.id)
                                    .find((vc) => true);
                                if (vendorColorId) {
                                    item.vendorColorId = vendorColorId;
                                }
                            }
                        }
                    }
                    return item;
                } else {
                    const item: TemplateUpdateItem = {
                        templateItemId: v.lineItemId,
                        itemNumber: v.itemNumber,
                        unitOfMeasure: v.unitOfMeasure,
                        quantity: v.quantity,
                        nickName: v.nickName || null,
                        color: null,
                        MFG: null,
                    };
                    return item;
                }
            }),
        };
        const response = await this.templateService.updateTemplateItems(
            request
        );
        if (response.success) {
            await this.refreshTemplateItems();
            if (showMessage) {
                this.notify('Template updated successfully');
            }
        } else {
            this.notify('Error while updating the template');
        }
    }
    buildRequest(lineItems: ITemplateItem[]): CartItems {
        if (!lineItems) {
            throw new Error('INVALID ITEMS');
        }
        if (!this.accountId || !this.account) {
            throw new AppError('Invalid accoubnt');
        }

        const filteredItems = lineItems.filter((d) => d.isSelected);
        return {
            addItemCount: filteredItems.length,
            accountId: this.accountId,
            items: filteredItems.map((line) => {
                const item: ItemsEntity = {
                    catalogRefId: line.itemNumber || '0',
                    productId: line.productOrItemNumber || '',
                    quantity: line.quantity,
                    uom: line.unitOfMeasure || '',
                    catalogRefIdChanged: false,
                };
                return item;
            }),
        };
    }
    public firstKey(attributes: AttributeValues) {
        return Object.keys(attributes)[0];
    }
    public findShowMore(templateItemId: string): boolean {
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
    public displayFn(prod?: Product): string | undefined {
        return prod ? prod.productName : undefined;
    }
    public async deleteItem(t: ITemplateItem) {
        if (!this.templateName) {
            this.notify('Template name is required');
            return;
        }
        const { lineItemId } = t;
        const tempName = this.templateName;
        //implements autosave before deleting an item
        if (this.templateItems.length > 0) {
            await this.updateTemplate(false);
        }
        const deleteTemplateResponse =
            await this.templateService.updateTemplate({
                action: 'deleteItem',
                account: this.account,
                templateId: this.templateId,
                templateName: tempName,
                items: [{ templateItemId: lineItemId }],
            });
        if (deleteTemplateResponse && deleteTemplateResponse.success) {
            await this.refreshTemplateItems();
            this.notify(`Removed item ${t.itemOrProductDescription}`);
        }
    }
}

export interface ITemplateDetail {
    templateId: string;
    templateName: string;
    templateItems: ITemplateItem[];
    accountLegacyId: string;
}

export interface ITemplateItem {
    lineItemId: string;
    quantity: number;
    itemNumber: string;
    unitOfMeasure: string;
    variations: Variations;
    readonly currentSKU: string;
    itemOrProductDescription?: string;
    selectedFilters: Map<string, string>;
    facetSelectors: { name: string; value: string }[];
    activeVariations: Record<string, IAttrOption[]>;
    isSelected: boolean;
    nickName: string;
    productOrItemNumber?: string;
    imageUrl?: ImageUrl | null;
    imageOnErrorUrl?: string | null;
    vendorColors?: VendorColor[] | null;
    vendorColorId?: string | null;
    setFilter(attr: string, value: string): void;
}

export interface Filter {
    attr: string;
    value: string;
}
function isLineTheSame(un: ITemplateItem, i: ITemplateItem) {
    if (i.vendorColors) {
        if (i.vendorColors.length > 0) {
            const selectedColor = i.facetSelectors
                .filter((fs) => fs.name === 'color')
                .map((fs) => fs.value)
                .find((fs) => true);
            const selectedMFG = i.facetSelectors
                .filter((fs) => fs.name === 'MFG')
                .map((fs) => fs.value)
                .find((fs) => true);
            if (selectedColor && selectedMFG) {
                const vendorColorId = i.vendorColors
                    .filter(
                        (vc) =>
                            vc.color === selectedColor && vc.MFG === selectedMFG
                    )
                    .map((vc) => vc.id)
                    .find((vc) => true);
                if (vendorColorId) {
                    i.vendorColorId = vendorColorId;
                }
            }
        }
    }
    return (
        un.lineItemId === i.lineItemId &&
        un.currentSKU === i.currentSKU &&
        un.unitOfMeasure === i.unitOfMeasure &&
        un.quantity === i.quantity &&
        un.nickName === i.nickName &&
        un.vendorColorId === i.vendorColorId
    );
}
