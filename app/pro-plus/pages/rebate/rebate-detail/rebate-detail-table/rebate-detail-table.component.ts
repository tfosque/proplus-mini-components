import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { RebateDetailDataSource } from '../rebate-detail-data-source';
import { RebateRedeemedDetail } from '../../../../model/rebate-redeemed-detail';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';
import { RebateService } from '../../../../services/rebate.service';
import { tap } from 'rxjs/operators';
import { RebateRedeemedSummaryItem, RebateRedeemedSummaryRequest } from '../../../../model/rebate-redeemed-summary';
import * as xlsx from 'xlsx';
import { formatBrandName } from '../../rebate-landing-v2/rebate-landing-v2.component';

@Component({
  selector: 'app-rebate-detail-table',
  templateUrl: './rebate-detail-table.component.html',
  styleUrls: ['./rebate-detail-table.component.scss']
})
export class RebateDetailTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() brandName!: string;
  @Input() year!: string;
  dataSource!: RebateDetailDataSource;
  isLoading = true;
  displayedColumns: string[] = [
    'orderNumber',
    'invoiceDate',
    'category',
    'itemDescription',
    'uom',
    'quantityShipped',
    'salesAmount',
  ];
  searchTypes = [
    {
      name: 'Invoice Number',
      value: 'Invoice Number',
      type: 'search',
      fieldName: 'orderNumber',
      apiName: 'orderNumber',
    },
    {
      name: 'Invoice Date',
      value: 'Invoice Date',
      type: 'date',
      fieldName: 'InvoiceDate',
      apiName: 'invoiceDate',
    },
    {
      name: 'Category',
      value: 'Category',
      type: 'search',
      fieldName: 'Category',
      apiName: 'category',
    },
    {
      name: 'Item Description',
      value: 'Item Description',
      type: 'search',
      fieldName: 'ItemDescription',
      apiName: 'itemDesc',
    },
  ];

  rebateDetails!: RebateRedeemedDetail[];
  rebateInfo!: RebateRedeemedSummaryItem;
  searchText$ = new BehaviorSubject<string>('');
  selectedSearchValue = 'Invoice Number';
  invoiceDate = '';
  isFiltering = false;
  filterValue = '';
  selectedRowIndex = -1;
  // private _activeRebateId: string | null = null;
  filterChanging = false;
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  activeRebateId = '';

  // @Input() public get activeRebateId(): string | null {
  //   return this._activeRebateId;
  // }
  // public set activeRebateId(value: string | null) {
  //   this._activeRebateId = value;
  // }

  get isEmpty() {
    return !this.rebateDetails?.length;
  }

  get searchText() {
    return this.searchText$.value;
  }

  set searchText(newText: string) {
    this.searchText$.next(newText);
  }

  get selectedSearchType() {
    return this.searchTypes.find(
      (i) => i.value === this.selectedSearchValue
    );
  }

  get selectedSearch() {
    const t = this.getSearchTypeInfo();
    return {
      value: this.selectedSearchValue,
      type: t.type,
    };
  }

  private getSearchTypeInfo() {
    const info = this.searchTypes.find(
      (i) => i.value === this.selectedSearchValue
    );
    if (!info) {
      return {
        name: 'Invoice Number',
        value: '',
        type: 'search',
        fieldName: 'orderNumber',
        apiName: 'orderNumber',
      };
    }
    return info;
  }

  getFilterField() {
    const searchTypeInfo = this.getSearchTypeInfo();
    return searchTypeInfo.name;
  }

  get filterQuery() {
    const t = this.getSearchTypeInfo();
    if (t.type === 'search') {
      return {
        searchValue: this.searchText,
        searchKey: t.apiName,
      };
    } else if ((t.type = 'date')) {
      return {
        searchValue:
          this.invoiceDate === ''
            ? ''
            : this.formatDateForFilter(this.invoiceDate),
        searchKey: t.apiName,
      };
    }
    return { searchValue: '', searchKey: '' };
  }

  constructor(
    private readonly rebateService: RebateService,
  ) { }

  async ngOnInit() {
    try {
      this.isLoading = true;
      if (this.year) {
        await this.getActiveRebate(this.year);
        if (this.activeRebateId) {
          const request: any = {
            rebateId: this.activeRebateId,
            searchKey: null,
            searchValue: null,
            pageNum: '1',
          };
          const detailResponse = await this.rebateService.getRebateRedeemedItemDetail(request);
          if (detailResponse && detailResponse.result) {
            const details = detailResponse.result.body;
            console.log('rebate details: ', details);
            this.dataSource = new RebateDetailDataSource(
              this.rebateService,
              detailResponse.result
            );
            this.dataSource.rebateDetails$.subscribe((rd) => {
              this.rebateDetails = rd.body;
            });
            this.rebateInfo = detailResponse.result.header;
          }
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() =>
          this.loadRebateDetails(
            this.isFiltering,
            this.isFiltering
              ? this.filterQuery
              : { searchKey: '', searchValue: '' }
          )
        )
      )
      .subscribe();
  }

  async getActiveRebate(year: string) {
    try {
      const filter = `year=${year},brandName=${this.brandName}`;
      const yearSummaryRequest: RebateRedeemedSummaryRequest = {
        filter: filter
      };
      const yearSummaryResponse = await this.rebateService.getRebateRedeemedSummaryItems(yearSummaryRequest);
      if (yearSummaryResponse && yearSummaryResponse.result) {
        const yearBrandResult = yearSummaryResponse.result;
        const yearBrandIds = yearBrandResult.map(r => r.rebateId || '');
        const yearBrandRebateIds = yearBrandIds.filter(b => b !== '');

        if (yearBrandRebateIds.length) {
          this.activeRebateId = yearBrandRebateIds[0];
          console.log('rebate id: ', this.activeRebateId);
        }
      }
    } finally {

    }
  }

  formatDateForFilter(d: string): string {
    try {
      const inputDate = moment(d);
      return inputDate.format('MM-DD-YYYY');
    } catch {
      return d;
    }
  }

  private async loadRebateDetails(useFilter: boolean, filter: RebateFilter) {
    this.isLoading = true;
    try {
      if (this.activeRebateId) {
        const pageNo = this.paginator.pageIndex + 1;
        // const pageSize = this.paginator.pageSize;
        await this.dataSource.loadRebateDetails(
          pageNo.toString(),
          this.activeRebateId,
          filter.searchKey,
          filter.searchValue
        );
      }
    } finally {
      this.isLoading = false;
    }
  }

  async doSearch() {
    this.isFiltering = true;
    this.filterChanging = false;
    const rebateDetailsFilter = this.filterQuery;
    this.filterValue = rebateDetailsFilter.searchValue;
    this.paginator.pageIndex = 0;

    await this.loadRebateDetails(true, rebateDetailsFilter);
  }

  async clearFilter() {
    this.filterValue = '';
    this.filterChanging = false;
    this.selectedSearchValue = 'Invoice Number'
    this.isFiltering = false;
    this.searchText$ = new BehaviorSubject<string>('');
    this.invoiceDate = '';
    this.paginator.pageIndex = 0;
    this.applyFilter('');

    await this.loadRebateDetails(false, { searchKey: '', searchValue: '' });
  }

  applyFilter(filterValue: string) {
    this.searchText$.next(filterValue);
  }

  highlight(row: any) {
    this.selectedRowIndex = row.id;
  }

  get totalCount() {
    if (!this.dataSource) {
      return 0;
    }
    const rebateDetails$ = this.dataSource.rebateDetails$;
    if (!rebateDetails$) {
      return 0;
    }
    if (!rebateDetails$.value) {
      return 0;
    }
    if (!rebateDetails$.value.pagination) {
      return 0;
    }
    if (!rebateDetails$.value.pagination.totalCount) {
      return 0;
    }
    return rebateDetails$.value.pagination.totalCount;
  }

  searchTypeChange() {
    console.log('selection type change');
    this.searchText = '';
    this.invoiceDate = '';
    this.filterChanging = true;
    console.log('filterQuery: ', this.filterQuery);
  }

  filterChange() {
    this.filterChanging = true;
  }

  getFilterValue() {
    const t = this.getSearchTypeInfo();
    if (t.type === 'search' && this.searchText) {
      return this.searchText;
    } else if (t.type === 'date' && this.invoiceDate) {
      const formattedDate = this.formatDateForFilter(this.invoiceDate);
      return formattedDate;
    }
    return '';
  }

  flierClick() {
    if (this.rebateInfo && this.rebateInfo.PDFUrl) {
      window.open(this.rebateInfo.PDFUrl, '_blank');
    }
  }

  async exportRebateDetails(): Promise<void> {
    if (!this.rebateDetails.length) {
      return;
    }
    const csvObj: RebateRedeemedDetailField[] = [];
    for (const element of this.rebateDetails) {
      csvObj.push({
        invoiceNumber: element.orderNumber,
        invoiceDate: element.invoiceDate,
        category: element.category,
        itemDescription: element.itemDescription,
        unitOfMeasure: element.itemStockUnitOfMeasure,
        quantityShipped: element.quantityShipped,
        salesAmount: element.salesAmount
      });
    }

    const bookName = `${formatBrandName(this.brandName)}_RebateDetails_${this.year}`;
    if (csvObj) {
      const sheet = xlsx.utils.json_to_sheet(csvObj);
      const book = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(book, sheet, bookName);
      const option: xlsx.WritingOptions = {
        type: 'array',
        cellDates: false,
        bookSST: false,
        bookType: 'csv',
        sheet: '',
        compression: false,
        ignoreEC: true,
      };
      xlsx.writeFile(book, `${bookName}.csv`, option);
    }
  }
}

interface RebateFilter {
  searchKey: string;
  searchValue: string;
}

interface RebateRedeemedDetailField {
  invoiceNumber?: string;
  invoiceDate?: string;
  category?: string;
  itemDescription?: string;
  unitOfMeasure?: string;
  quantityShipped?: number;
  salesAmount?: number;
}

