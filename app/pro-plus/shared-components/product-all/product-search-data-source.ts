import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductListItem } from '../../model/product-item-list';
import { ItemListResponseV2 } from '../../model/item-list-response';
import {
    ProductsService,
    ProductSearchRequest,
} from '../../services/products.service';

export class ProductSearchDataSource implements DataSource<ProductListItem> {
    private readonly productSearchResponses: BehaviorSubject<ItemListResponseV2 | null>;
    public get productSearchResponses$() {
        return this.productSearchResponses;
    }
    constructor(private readonly productsService: ProductsService) {
        this.productSearchResponses =
            new BehaviorSubject<ItemListResponseV2 | null>(null);
    }
    //  When defining a custom data source, you need to tell it how to 'connect' to the source
    //  of data.  You're basically creating an observable that will fire anytime the user pages,
    //  sorts, or searches...
    connect(collectionViewer: CollectionViewer): Observable<ProductListItem[]> {
        // this.loadOrders(this.accountId, 0, 10, '', '');
        return this.productSearchResponses.pipe(
            map((h) => (h ? h.items || [] : []))
        );
    }

    //  When defining a custom data source, you need to tell it how to 'disconnect' to the source
    //  of data.  This doesn't really apply to us, but it could if we had something like a websocket
    //  connection where we needed to make sure to disconnect it after we used it.
    disconnect(collectionViewer: CollectionViewer): void {
        this.productSearchResponses.complete();
    }

    async searchProducts(request: ProductSearchRequest) {
        const fullProductSearchResult =
            await this.productsService.searchProducts(request);
        this.productSearchResponses.next(fullProductSearchResult);
    }
}
