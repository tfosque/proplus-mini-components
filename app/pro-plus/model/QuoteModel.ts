import { Job } from './job';
import { QuoteItem, QuoteResponse, NewQuoteItem } from './quote-response';

export interface BaseQuote {
    quoteName: string;
    city: string;
    jobAccount: Job;
    phone: string;
    address1: string;
    address2: string;
    state: string;
    workType: string;
    quoteNote: string;
    addtionalQuoteItems: QuoteItem[];
    subTotal: number;
    otherCharges: number;
    tax: number;
    gst: number;
    total: number;
    standardQuoteItems: QuoteItem[];
}
export type Quote = NewQuote | DraftQuote | QuoteInProcess | ReceivedQuote;

interface NewQuote extends BaseQuote {
    quoteId: 'new';
    quoteItems: NewQuoteItem[];
    status: '';
    created: string;
    lastModified: string;
    createdBy: string;
}
interface SavedQuote extends BaseQuote {
    quoteId: string;
    quoteDetail: QuoteResponse;
    accountId: string;
    created: string;
    lastModified: string;
    createdBy: string;
    quoteItems: QuoteItem[];
}
interface DraftQuote extends SavedQuote {
    status: 'OPEN';
}
interface QuoteInProcess extends SavedQuote {
    status: 'INPROGRESS';
}

interface ReceivedQuote extends SavedQuote {
    subTotal: number;
    otherCharges: number;
    tax: number;
    gst: number;
    total: number;
    status:
        | 'ACCEPTED'
        | 'REJECT'
        | 'REVISED'
        | 'CUSTOMER_REVIEW'
        | 'SUBMITTED'
        | 'ORDERED';
}

export interface CreateQuoteItem {
    itemId: string;
    itemType: string;
    quantity: number;
    uom: string;
    color: string;
    dimensions: string;
}
