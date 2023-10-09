import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Pagination } from '../../../../services/saved-orders.service';
import { SearchEvent, SearchOption, SearchValue } from '../../../../../common-components/components/search-bar/search-bar.component';
import { EagleViewDataSource } from '../eagle-view-report-data-source';
import { startWith } from 'rxjs/operators';
import moment from 'moment';
import { Router } from '@angular/router';
import { CreateEVOrderRequest, EVTemplateDetail } from '../../../../model/eagle-view-smart-order';
import { EagleViewService } from '../../../../services/eagle-view.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-eagle-view-report-list',
  templateUrl: './eagle-view-report-list.component.html',
  styleUrls: ['./eagle-view-report-list.component.scss']
})
export class EagleViewReportListComponent implements OnInit {
  public searchTypes: SearchOption[] = [
    {
      name: 'Report #',
      type: 'search',
      fieldName: 'ID'
    },
    {
      name: 'Address',
      type: 'search',
      fieldName: 'Address'
    },
    {
      name: "Status",
      type: 'options',
      fieldName: 'ReportStatus',
      options: [
        {
          name: 'Created',
          value: '1'
        },
        {
          name: 'InProcess',
          value: '2'
        },
        {
          name: 'Pending',
          value: '3'
        },
        {
          name: 'Closed',
          value: '4'
        },
        {
          name: 'Completed',
          value: '5'
        }
      ]
    },
    {
      name: "Product Type",
      type: 'options',
      fieldName: 'ReportProducts',
      options: [
        {
          name: 'Premium Residential',
          value: 31
        },
        {
          name: 'Premium Commercial',
          value: 32
        },
        {
          name: 'Quick Squares',
          value: 44
        },
        {
          name: 'Quick Squares Multi-Family',
          value: 55
        },
      ]
    }
  ];

  @ViewChild(MatSort, {static:true}) sort!: MatSort;
  @ViewChild(MatPaginator, {static:true}) paginator!: MatPaginator;
  private _selectedOptionName = '';
  displayedColumns: string[] = [
    'reportId',
    'address',
    'dateCreated',
    'status',
    'productType',
    'viewReport',
    'upgradeReport',
    'smartOrder'
  ];
  displayedColumnsMobile: string[] = ['displayName', 'viewReport'];
  pageInfo?: Pagination;
  reload$ = new BehaviorSubject(0);
  reportCount: number = 0;
  search = new EventEmitter<SearchEvent>();
  public searchValue: SearchValue = '';
  isLoading = true;
  public filterChanging = false;
  hasUnfinishedSmartOrders = false;
  unfinishedSmartOrder: SmartOrderInfo = {
    reportId: '',
    evOrderId: '',
    address: '',
    city: '',
    template: null
  };
  isReminderOpen = true;

  get selectedSearchOption() {
    if (!this._selectedOptionName && this.searchTypes.length) {
        const found: SearchOption | undefined = this.searchTypes.find(
            (t) => !!t
        );
        return found ? found.name : '';
    }
    return this._selectedOptionName;
  }
  set selectedSearchOption(newOption: string) {
      this._selectedOptionName = newOption;
      this.searchValue = '';
  }

  get selectedSearch() {
    return this.searchTypes.find(
        (t) => t.name === this.selectedSearchOption
    );
  }

  get filterName() {
    return this.selectedSearch ? this.selectedSearch.name : '';
  }

  constructor(
    public readonly eagleViewSource: EagleViewDataSource,
    private readonly router: Router,
    private readonly eagleViewService: EagleViewService,
    private readonly _snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    try {
      this.sort?.sortChange.subscribe(
        () => (this.paginator ? this.paginator.pageIndex = 0 : undefined)
      );
      if (this.sort) {
        this.sort.active = 'DatePlaced';
        this.sort.direction = 'desc';
      }

      const defaultSort = this.eagleViewSource.defaultSort;
      const defaultPageEvent = this.eagleViewSource.defaultPageEvent;
      const defaultSearchEvent = this.eagleViewSource.defaultSearchEvent;

      this.search.subscribe(() => {
        this.paginator.pageIndex = 0;
        this.paginator.page.next({
          length: defaultPageEvent.length,
          pageIndex: defaultPageEvent.pageIndex,
          pageSize:
            this.paginator.pageSize || defaultPageEvent.pageSize,
        });
      });

      const sortChange$ = this.sort?.sortChange
        .asObservable()
        .pipe(startWith(defaultSort));
      const page$ = this.paginator?.page
        .asObservable()
        .pipe(startWith(defaultPageEvent));
      const search$ = this.search
        .asObservable()
        .pipe(startWith(defaultSearchEvent));

      combineLatest([
        sortChange$,
        page$,
        search$,
        this.reload$,
      ]).subscribe(
        async (r) => {
          try {
            this.isLoading = true;
            const [sort, page, search, reload] = r;
            sort.direction = this.sort.direction || 'asc';
            let filterSearch = search;
            // console.log('search: ', filterSearch);
            this.eagleViewSource.searchEagleViewReports({
              sort,
              page,
              search: filterSearch,
              reload: reload,
            });
          } finally {
          }
        },
        (err) => {
          throw err;
        }
      );

      this.eagleViewSource.pageInfo$.subscribe((p) => {
        this.pageInfo = p;
      });
      this.eagleViewSource.results$.subscribe((v) => {
        this.isLoading = false;
        if (v.result && v.result.TotalOfReports) {
          this.reportCount = v.result.TotalOfReports;
        } else {
          this.reportCount = 100;
        }
      });

      const smartOrderListResponse = await this.eagleViewService.EVOrderList();
      if (!smartOrderListResponse.success) {
        throw new Error('Error retrieving previously started EagleView smart order');
      }
      // console.log('EVOrderList response: ', smartOrderListResponse);
      const result = smartOrderListResponse.result;
      if (result && result.pagination && result.pagination.totalCount > 0 && result.evOrders) {
        const unfinishedSmartOrders = result.evOrders;
        if (unfinishedSmartOrders.length > 0) {
          this.hasUnfinishedSmartOrders = true;
          const smartOrder = unfinishedSmartOrders[0];
          this.unfinishedSmartOrder = {
            reportId: smartOrder.report?.reportId,
            evOrderId: smartOrder.evOrderId,
            address: smartOrder.report?.location?.address,
            city: smartOrder.report?.location?.city,
            template: smartOrder.template
          };
          // console.log('Previously started smart order: ', this.unfinishedSmartOrder);
        }
      }
    } finally {
      this.triggerReload();
    }
  }

  private triggerReload() {
    this.reload$.next(new Date().getTime());
  }

  doSearch(evt: Event) {
    // console.log('selected search', this.tabSearchType.selectedIndex);
    const selectedSearch = this.selectedSearch;
    const fieldName = selectedSearch ? selectedSearch.fieldName : '';
    const option = selectedSearch ? selectedSearch.name : '';
    const searchValue = this.searchValue;
    this.filterChanging = false;
    this.search.next({
      searchValue: searchValue,
      fieldName: fieldName,
      option: option,
    });
    evt.preventDefault();
    return false;
  }

  formatDate(d: string): string {
    try {
      const inputDate = moment(d);
      return inputDate.format('MM-DD-YYYY');
    } catch {
      return d;
    }
  }

  upgradeEVReport(reportId: number) {
    this.router.navigate([`/proplus/eagle-view/upgrade-report/${reportId.toString()}/EVLanding`]);
  }

  searchTypeChange() {
    this.filterChanging = true;
    this.searchValue = '';
  }

  filterChange() {
    this.filterChanging = true;
  }

  showSnack(
    message: string,
    title: string = 'Close',
    duration: number = 3000
  ) {
    const config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.duration = duration;
    this._snackBar.open(message, title, config);
  }

  async createSmartOrder(reportId: number) {
    const createEVOrderRequest: CreateEVOrderRequest = {
      reportId: reportId.toString()
    }
    const createEVOrderResponse = await this.eagleViewService.createEVOrder(createEVOrderRequest);
    if (createEVOrderResponse.success && createEVOrderResponse.result) {
      const evOrderId = createEVOrderResponse.result.evOrderId;
      this.router.navigate([`/proplus/eagle-view/template-selection/${evOrderId}`]);
    } else {
      this.showSnack('Error happens with creating the smart order from the EagleView report using the selected report', 'close');
    }
  }

  closeReminder() {
    this.isReminderOpen = false;
  }

  continueSmartOrder(evOrderId: string, template: EVTemplateDetail | null) {
    if (template) {
      this.router.navigate([`/proplus/eagle-view/smart-order/${evOrderId}`]);
    } else {
      this.router.navigate([`/proplus/eagle-view/template-selection/${evOrderId}`]);
    }
  }
}

interface SmartOrderInfo {
  reportId: string;
  evOrderId: string;
  address: string;
  city: string;
  template: EVTemplateDetail | null
}
