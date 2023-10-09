export type QuoteRequest =
    | {
          account: string;
          quoteType?: QuoteType;
          pageSize: number;
          pageNo: number;
          orderBy?: string;
      }
    | {
          account: string;
          quoteType?: QuoteType;
          pageSize: number;
          pageNo: number;
          filterBy: FilterBy;
          filter: string;
          orderBy?: string;
      };

export type QuoteType = 'draft' | 'inProcess' | 'received';
export type FilterBy = '' | 'quoteId' | 'quoteName' | 'creationDate' | 'status';
export type Filter =
    | 'Open'
    | 'InProgress'
    | 'Revised'
    | 'Ready for Review'
    | 'Approved'
    | 'Closed';
export type OrderBy =
    | 'quoteId'
    | 'quoteName'
    | 'creationDate'
    | 'status'
    | 'createdBy';
