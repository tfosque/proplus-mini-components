import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { RebateRedeemedDetail, RebateRedeemedDetailAll } from "../../../model/rebate-redeemed-detail";
import { BehaviorSubject, Observable } from "rxjs";
import { RebateService } from "../../../services/rebate.service";
import { map } from "rxjs/operators";

export class RebateDetailDataSource implements DataSource<RebateRedeemedDetail> {
    private rebateDetailResponses: BehaviorSubject<RebateRedeemedDetailAll>;
    public get rebateDetails$() {
        return this.rebateDetailResponses;
    }
    constructor(
        private rebateService: RebateService,
        private rebateDetailAll: RebateRedeemedDetailAll
    ) {
        this.rebateDetailResponses = new BehaviorSubject<RebateRedeemedDetailAll>(this.rebateDetailAll);
    }

    //  When defining a custom data source, you need to tell it how to 'connect' to the source
    //  of data.  You're basically creating an observable that will fire anytime the user pages,
    //  sorts, or searches...
    connect(collectionViewer: CollectionViewer): Observable<RebateRedeemedDetail[]> {
        // this.loadOrders(this.accountId, 0, 10, '', '');
        return this.rebateDetailResponses.pipe(map((h) => (h ? h.body : [])));
    }

    //  When defining a custom data source, you need to tell it how to 'disconnect' to the source
    //  of data.  This doesn't really apply to us, but it could if we had something like a websocket
    //  connection where we needed to make sure to disconnect it after we used it.
    disconnect(collectionViewer: CollectionViewer): void {
        this.rebateDetailResponses.complete();
    }

    //  We'll define a function like this to do the actual fetching.  When it gets the result, it will feed
    //  it to the observable we connected to above.  (this.orderHistories)
    async loadRebateDetails(
        pageNum: string,
        rebateId: string,
        searchKey: string,
        searchValue: string
    ) {
        const request = {
            rebateId: rebateId,
            searchKey: searchKey,
            searchValue: searchValue,
            pageNum: pageNum
        };
        const rebateDetails = await this.rebateService.getRebateRedeemedItemDetail(request);
        this.rebateDetailResponses.next(rebateDetails.result);
    }
}