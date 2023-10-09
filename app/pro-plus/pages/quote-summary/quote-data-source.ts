import { Quote, QuoteListItem } from '../../model/quote-browse-response';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuoteService } from '../../services/quote-service';
import { QuoteType, FilterBy, QuoteRequest } from '../../model/quote-request';

export class QuoteDataSource implements DataSource<QuoteListItem> {
    private quoteResponses: BehaviorSubject<Quote>;
    public get quotes$() {
        return this.quoteResponses;
    }
    constructor(
        private accountId: number,
        private quoteType: QuoteType,
        private quoteService: QuoteService,
        private quotes: Quote
    ) {
        this.quoteResponses = new BehaviorSubject<Quote>(this.quotes);
    }

    //  When defining a custom data source, you need to tell it how to 'connect' to the source
    //  of data.  You're basically creating an observable that will fire anytime the user pages,
    //  sorts, or searches...
    connect(collectionViewer: CollectionViewer): Observable<QuoteListItem[]> {
        // this.loadOrders(this.accountId, 0, 10, '', '');
        return this.quoteResponses.pipe(map((h) => (h ? h.quoteList : [])));
    }

    //  When defining a custom data source, you need to tell it how to 'disconnect' to the source
    //  of data.  This doesn't really apply to us, but it could if we had something like a websocket
    //  connection where we needed to make sure to disconnect it after we used it.
    disconnect(collectionViewer: CollectionViewer): void {
        this.quoteResponses.complete();
    }

    //  We'll define a function like this to do the actual fetching.  When it gets the result, it will feed
    //  it to the observable we connected to above.  (this.orderHistories)
    async loadQuotes(
        pageNo: number,
        pageSize: number,
        filter: string,
        orderBy: string,
        filterBy: FilterBy
    ) {
        const request: QuoteRequest = {
            account: this.accountId.toString(),
            filter: filter,
            filterBy: filterBy,
            pageNo: pageNo,
            orderBy: orderBy,
            pageSize: pageSize,
            quoteType: this.quoteType,
        };
        const quotes = await this.quoteService.getQuotes(request);
        if (this.quoteType === 'draft') {
            this.quoteResponses.next(quotes.draftQuote);
        } else if (this.quoteType === 'inProcess') {
            this.quoteResponses.next(quotes.inProcessQuote);
        } else if (this.quoteType === 'received') {
            this.quoteResponses.next(quotes.receivedQuote);
        }
    }
}
