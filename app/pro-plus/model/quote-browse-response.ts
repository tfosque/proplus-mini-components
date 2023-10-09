export interface QuoteBrowseResponse {
    messages: Message[];
    messageCode: number;
    success: boolean;
    draftQuote: Quote;
    inProcessQuote: Quote;
    receivedQuote: Quote;
}

export interface Quote {
    pagination: Pagination;
    quoteList: QuoteListItem[];
}

export interface Pagination {
    next: Next;
    previous: Next;
    pageSize: number;
    currentPage: number;
    totalCount: number;
    results: Result[];
}

export interface Next {
    available: boolean;
    label: string;
    page: number;
}

export interface Result {
    enable: boolean;
    page: number;
    currentPage: boolean;
    type: string;
}

export interface QuoteListItem {
    quoteId: string;
    quoteName: string;
    creationDate: string;
    status: string;
    createdBy: string;
}

export interface Message {
    type: string;
    value: string;
    code: string;
}
