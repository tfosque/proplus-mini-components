import { OrderHistoryService } from '../../services/order-history.service';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { OrderHistory } from '../../model/order-history';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderHistoryResponse } from '../../model/order-history-response';
import { map } from 'rxjs/operators';

export class OrderHistoryDataSource implements DataSource<OrderHistory> {
    private readonly orderHistories = new BehaviorSubject<OrderHistoryResponse | null>(
        null
    );
    public get orders$() {
        return this.orderHistories;
    }
    constructor(private readonly orderHistory: OrderHistoryService) { }

    //  When defining a custom data source, you need to tell it how to 'connect' to the source
    //  of data.  You're basically creating an observable that will fire anytime the user pages,
    //  sorts, or searches...
    connect(collectionViewer: CollectionViewer): Observable<OrderHistory[]> {
        // this.loadOrders(this.accountId, 0, 10, '', '');

        return this.orderHistories.pipe(
            // tap(h => console.log('Orders history', h)),
            map((h) => (h && h.result ? h.result.orders : []))
            // tap(orders => console.log('Orders returned', orders))
        );
    }

    //  When defining a custom data source, you need to tell it how to 'disconnect' to the source
    //  of data.  This doesn't really apply to us, but it could if we had something like a websocket
    //  connection where we needed to make sure to disconnect it after we used it.
    disconnect(collectionViewer: CollectionViewer): void {
        this.orderHistories.complete();
    }

    //  We'll define a function like this to do the actual fetching.  When it gets the result, it will feed
    //  it to the observable we connected to above.  (this.orderHistories)
    async loadOrders(
        accountId: string,
        pageNo: number,
        pageSize: number,
        searchBy: string | null,
        searchTerm: string | null,
        searchStartDate: string | null,
        searchEndDate: string | null,
        searchEnum: string | null,
        orderBy: string | null
    ) {
        const orders = await this.orderHistory.getFullOrderHistory(
            accountId,
            (pageNo + 1).toString(),
            pageSize.toString(),
            searchBy,
            searchTerm,
            searchStartDate,
            searchEndDate,
            searchEnum,
            orderBy
        );
        this.orderHistories.next(orders);
    }
}
