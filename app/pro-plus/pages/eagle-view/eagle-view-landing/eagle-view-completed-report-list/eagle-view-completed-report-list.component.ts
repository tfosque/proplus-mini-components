import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Pagination } from '../../../../services/saved-orders.service';
import { SearchEvent, SearchOption, SearchValue } from '../../../../../common-components/components/search-bar/search-bar.component';
import { EagleViewDataSource } from '../eagle-view-completed-report-data-source';
import { startWith } from 'rxjs/operators';
import moment from 'moment';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { CreateEVOrderRequest } from '../../../../model/eagle-view-smart-order';
import { EagleViewService } from '../../../../services/eagle-view.service';

export interface CompletedReports {
  Id: number;
}
@Component({
  selector: 'app-eagle-view-completed-report-list',
  templateUrl: './eagle-view-completed-report-list.component.html',
  styleUrls: ['./eagle-view-completed-report-list.component.scss']
})
export class EagleViewCompletedReportListComponent implements OnInit {

  public searchTypes: SearchOption[] = [
    {
      name: 'REPORT #',
      type: 'search',
      fieldName: 'ID'
    },
    {
      name: 'ADDRESS',
      type: 'search',
      fieldName: 'Address'
    }
  ];

  @ViewChild(MatSort, {static:true}) sort!: MatSort;
  @ViewChild(MatPaginator, {static:true}) paginator!: MatPaginator;
  private _selectedOptionName = '';
  displayedColumns: string[] = [
    'select',
    'reportId',
    'address',
    'dateCreated'
  ];
  displayedColumnsMobile: string[] = ['displayName'];
  pageInfo?: Pagination;
  reload$ = new BehaviorSubject(0);
  reportCount: number = 0;
  search = new EventEmitter<SearchEvent>();
  selection = new SelectionModel<CompletedReports>(false, []);
  public searchValue: SearchValue = '';
  isLoading = true;
  public filterChanging = false;

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
    private readonly _snackBar: MatSnackBar,
    private dialogRef: MatDialog,
    private readonly eagleViewService: EagleViewService,
  ) { }

  async ngOnInit() {
    try {
      this.sort.sortChange.subscribe(
        () => (this.paginator ? this.paginator.pageIndex = 0 : undefined)
      );
      this.sort.active = 'DatePlaced';
      this.sort.direction = 'desc';

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
        console.log('Paginator PageSize: ', this.paginator.pageSize)
      });

      const sortChange$ = this.sort.sortChange
        .asObservable()
        .pipe(startWith(defaultSort));
      const page$ = this.paginator.page
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

  searchTypeChange() {
    this.filterChanging = true;
    this.searchValue = '';
  }

  filterChange() {
    this.filterChanging = true;
  }

  async selectTemplate() {
    if (!this.selection.hasValue()) {
      this.showSnack('Please select a report.', 'close');
      return;
    }

    const reportId = this.selection.selected[0].Id;
    this.dialogRef.closeAll();
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
}