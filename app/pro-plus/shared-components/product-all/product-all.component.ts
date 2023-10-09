import {
    Component,
    OnInit,
    Inject,
    ViewChild,
    ElementRef,
    AfterViewInit,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataAll } from '../../pages/templates/template-detail-page/template-detail-page.component';
import { ProductSearchRequest, ProductsService } from '../../services/products.service';
import { ProductListItem } from '../../model/product-item-list';
import { Image } from '../../../global-classes/image';
import { BehaviorSubject, from } from 'rxjs';
import {
    debounceTime,
    switchMap,
    tap,
    finalize,
    distinctUntilChanged,
    filter,
    map,
} from 'rxjs/operators';
import { ItemListResponseV2 } from '../../model/item-list-response';
import { SkuSelection } from '../sku-selector/sku-selector.component';

@Component({
    selector: 'app-product-all',
    templateUrl: './product-all.component.html',
    styleUrls: ['./product-all.component.scss'],
})
export class ProductAllComponent implements OnInit, AfterViewInit {
    @ViewChild('productSearchDiv')
    productSearchDiv?: ElementRef;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    imageWidth = 200;
    isLoading = true;
    //  Represents the combination of all text changes, scrolling, etc.
    private readonly searchRequests$: BehaviorSubject<ItemRequest | null>;
    private readonly columnChange$ = new BehaviorSubject<number>(1);
    public foundItems: ProductListItem[] = [];
    public viewedItems: ProductListItem[][] = [];
    selectedProduct: ProductListItem | null = null;
    public fullProductSearchResult!: ItemListResponseV2;
    selectedSku: SkuSelection = null;

    public get calculatedWindowWidth() {
        //  TODO - Make this conditional on size
        return '100%';
    }

    public get accountId() {
        return this.data.accountId;
    }

    public get searchCategories() {
        return this.data.searchCategories;
    }

    get productSearchWidth(): number | null {
        if (!this.productSearchDiv) {
            return null;
        }
        if (!this.productSearchDiv.nativeElement) {
            return null;
        }
        if (!this.productSearchDiv.nativeElement.offsetWidth) {
            return null;
        }
        return this.productSearchDiv.nativeElement.offsetWidth;
    }

    public get productColumns() {
        const width = this.productSearchWidth;
        if (width === null) {
            return 1;
        }
        const result = Math.max(1, Math.floor(width / this.imageWidth));
        this.columnChange$.next(result);
        return result;
    }

    public get pageSize() {
        return Math.max(20, this.productColumns * 3);
    }

    get displayMode() {
        if (this.selectedProduct) {
            return 'Product Detail';
        }
        return 'Search Results';
    }

    constructor(
        public readonly dialogRef: MatDialogRef<ProductAllComponent>,
        private readonly productsService: ProductsService,
        @Inject(MAT_DIALOG_DATA) public data: DialogDataAll
    ) {
        this.searchRequests$ = new BehaviorSubject<ItemRequest | null>(null);
    }

    get searchText() {
        if (!this.searchRequests$) {
            return '';
        }
        if (!this.searchRequests$.value) {
            return '';
        }
        return this.searchRequests$.value.filter;
    }

    set searchText(newText: string) {
        this.isLoading = true;
        this.foundItems = [];
        this.viewedItems = [];
        this.searchRequests$.next({
            filter: newText,
            facets: undefined,
        });
    }

    public get items() {
        if (this.foundItems) {
            return this.foundItems;
        }
        if (!this.fullProductSearchResult) {
            return [];
        }
        return this.fullProductSearchResult.items || [];
    }

    async ngOnInit() {
        const pageNo = this.paginator ? this.paginator.pageIndex + 1 : 1;
        const pageSize = this.paginator
            ? this.paginator.pageSize
                ? this.paginator.pageSize
                : 20
            : 20;
        //  Watching the user typing
        this.searchRequests$
            .pipe(
                filter((r) => r !== null),
                map((r) => r as ItemRequest),
                distinctUntilChanged((x, y) => {
                    return x.filter === y.filter;
                }),
                //  If 600ms have gone by, emit the last search request
                //  This effectively throttles the user input and prevents
                //  from overloading the API
                debounceTime(600),
                tap((r) => {
                    this.isLoading = true;
                }),
                //  Ensures responses to previous requests don't interfere with the
                //  response from the most recent search.
                switchMap((request) => {
                    let requestBody: ProductSearchRequest = {
                        accountId: this.data.accountId.toString(),
                        pageNo: pageNo,
                        pageSize: pageSize,
                        filter: request.filter,
                        hoverSearch: false,
                        showHoverAttrs: false,
                        showSkuList: true,
                        facets: request.facets
                    };
                    if (this.searchCategories) {
                        requestBody.cateFilter = this.searchCategories.join('+');
                        if (this.searchCategories[0] !== 'miscellaneous') {
                            requestBody.matchMode = 'any';
                        }
                    }
                    return from(
                        this.productsService.searchProducts(requestBody)
                    ).pipe(
                        tap((result) => {
                            if (!result) {
                                return;
                            }
                            this.fullProductSearchResult = result;
                        }),
                        finalize(() => {
                            this.isLoading = false;
                        })
                    );
                })
            )
            .subscribe((searchText) => {
                this.paginator.pageIndex = 0;
            });

        this.searchRequests$.next({
            filter: this.searchText,
            facets: undefined,
        });
    }

    ngAfterViewInit() {
        this.paginator.page
            .pipe(
                tap(() =>
                    this.loadItems({
                        pageNo: this.paginator.pageIndex + 1,
                        pageSize: this.paginator.pageSize,
                        filter: this.searchText,
                    })
                )
            )
            .subscribe();
    }

    async loadItems(itemListRequest: {
        pageNo: number;
        pageSize: number;
        filter: string;
    }) {
        let requestBody: ProductSearchRequest = {
            accountId: this.data.accountId.toString(),
            pageNo: itemListRequest.pageNo,
            pageSize: itemListRequest.pageSize,
            filter: itemListRequest.filter,
            hoverSearch: false,
            showHoverAttrs: false,
            showSkuList: true,
            facets: undefined,
        };
        if (this.searchCategories) {
            requestBody.cateFilter = this.searchCategories.join('+');
            if (this.searchCategories[0] !== 'miscellaneous') {
                requestBody.matchMode = 'any';
            }
        }
        const response = await this.productsService.searchProducts(requestBody);
        if (!response) {
            return;
        }
        this.fullProductSearchResult = response;
    }

    setFoundItems(newFoundItems: ProductListItem[]) {
        this.foundItems = newFoundItems;
        this.viewedItems = groupIntoSize(this.foundItems, this.productColumns);
    }

    appendItems(newItems: ProductListItem[]) {
        const columnCount = this.productColumns;
        const viewedItems = this.viewedItems;
        this.foundItems = (this.foundItems || []).concat(newItems);
        for (const item of newItems) {
            const length = viewedItems.length;
            const hasRecords = length && viewedItems[length - 1];
            const lastRowHasRoom =
                hasRecords && viewedItems[length - 1].length < columnCount - 1;
            if (hasRecords && lastRowHasRoom) {
                viewedItems[length - 1].push(item);
            } else {
                viewedItems.push([item]);
            }
        }
    }

    setFacet(facetId: string | undefined) {
        const r = this.searchRequests$.value;
        if (r === null) {
            return;
        }
        this.searchRequests$.next({ ...r, facets: facetId });
    }

    async scrollIndexChanged(index: number) {
        const columnCount = this.productColumns;
        const pageLength = this.pageSize / columnCount;
        const length = this.foundItems.length / columnCount;
        const min = pageLength / 2;
        const threshold = length - min;
        const newPage = Math.ceil(length / pageLength + 1);
        const r = this.searchRequests$.value;
        if (r === null) {
            return;
        }
        const newRequest = { ...r, pageNo: newPage };
        if (index > threshold) {
            this.searchRequests$.next(newRequest);
        }
    }

    public get categories() {
        if (!this.fullProductSearchResult) {
            return [];
        }
        if (!this.fullProductSearchResult.facets) {
            return [];
        }
        if (!this.fullProductSearchResult.facets['Categories']) {
            return [];
        }
        return this.fullProductSearchResult.facets['Categories'];
    }

    public getProductImage(p: ProductListItem): Image | null {
        if (!p || !p.productImage || !p.productName) {
            return null;
        }
        return new Image(p.productImage, p.productName, true);
    }
    public getExactSkuProductImage(p: ProductListItem): Image | null {
        if (!p || !p.productImage || !p.productName || !p.skuList) {
            return null;
        }
        if(p.skuList[0].itemImage) {
            p.productImage = p.skuList[0].itemImage;
        }
        return new Image(p.productImage, p.productName, true);
    }

    public selectProduct(product: ProductListItem | null) {
        this.selectedProduct = product;
    }

    public clearProduct() {
        this.selectedProduct = null;
    }

    public setSkuSelected(sku: SkuSelection) {
        this.selectedSku = sku;
    }

    public selectSku() {
        this.dialogRef.close(this.selectedSku);
    }
}

function groupIntoSize<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    let currentGroup = [];
    for (const element of items) {
        currentGroup.push(element);
        if (currentGroup.length >= size) {
            result.push(currentGroup);
            currentGroup = [];
        }
    }
    if (currentGroup.length) {
        result.push(currentGroup);
    }
    return result;
}

interface ItemRequest {
    filter: string;
    facets?: string;
}
