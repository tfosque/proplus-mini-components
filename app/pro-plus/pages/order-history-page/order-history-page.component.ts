import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { OrderHistoryService } from '../../services/order-history.service';
import { UserService } from '../../services/user.service';
import { CurrentUser } from '../../model/get-current-user-response';
import moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';
import { OrderHistory } from '../../model/order-history';
import { tap } from 'rxjs/operators';
import { OrderHistoryDataSource } from './order-history-data-source';
import { merge, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { OrderDetailResponseV2 } from '../../model/order-detail-response';
import { BranchAddress } from '../../model/branch-address';
import * as xlsx from 'xlsx';
import {
    UserPreferenceService,
    searchingParams,
} from '../../services/user-preference.service';

type SortFields = 'orderId' | 'purchaseOrderNo' | 'total' | 'status' | 'source';

const sortFieldMap = {
    orderId: 'MincronOrderNumber',
    purchaseOrderNo: 'Details',
    total: 'TotalOrderAmount',
    source: 'IsPROPlusOrder',
    status: 'OrderStatus',
};

@Component({
    selector: 'app-order-history-page',
    templateUrl: './order-history-page.component.html',
    styleUrls: ['./order-history-page.component.scss'],
})
export class OrderHistoryPageComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    isLoading = true;
    accountId!: string;
    get searchText() {
        return this.searchText$.value;
    }
    set searchText(newText: string) {
        this.searchText$.next(newText);
    }
    dataSource!: OrderHistoryDataSource;
    selection = new SelectionModel<OrderHistory>(true, []);
    activeAccount?: CurrentUser;
    selectedSearchValue: string | null = 'OrderPlacedDate';
    startDate: string | null = null;
    endDate: string | null = null;
    selectedOption: string | null = null;
    searchTypes = [
        {
            name: 'Job Name',
            value: 'JobName',
            type: 'search',
            fieldName: 'JobName',
        },
        {
            name: 'Product/SKU',
            value: 'ProductOrSKU',
            type: 'search',
            fieldName: 'ItemOrProductDescription',
        },
        {
            name: 'Order Placed Date',
            value: 'OrderPlacedDate',
            type: 'date-range',
            fieldName: 'Ordered',
        },
        {
            name: 'Mincron Order #',
            value: 'MincronOrderNumber',
            type: 'search',
            fieldName: 'OrderNumber',
        },
        {
            name: 'Order Status',
            value: 'OrderStatus',
            fieldName: 'OrderStatusCode',
            type: 'options',
            options: [
                { name: 'Delivered', values: ['P', 'R'], key: 'Delivered' },
                { name: 'Invoiced', values: ['I'], key: 'Invoiced' },
                { name: 'Pending', values: ['N'], key: 'Pending' },
                { name: 'Processing', values: ['C', 'K'], key: 'Processing' },
                {
                    name: 'Ready Delivery/PickUp',
                    values: ['O'],
                    key: 'ReadyDeliveryOrPickUp',
                },
            ],
        },
        {
            name: 'Cust PO',
            value: 'CustPO',
            type: 'search',
            fieldName: 'PurchaseOrderNumber',
        },
        {
            name: 'Street',
            value: 'Street',
            type: 'search',
            fieldName: 'ShippingAddress1',
        },
        {
            name: 'PRO Plus Order',
            value: 'IsPROPlusOrder',
            fieldName: 'proPlusBought',
            type: 'proOptions',
            options: [
                { name: 'Yes', values: ['Yes'], key: 'Yes' },
                { name: 'No', values: ['No'], key: 'No' },
            ],
        },
    ];
    displayedColumns: string[] = [
        'select',
        'orderId',
        'purchaseOrderNo',
        'source',
        'total',
        'status',
    ];
    displayedColumnsMobile: string[] = ['select', 'orderId'];
    searchText$ = new BehaviorSubject<string>('');
    filterChanging = false;
    paginatorSort = '';

    get validation() {
        let bool = true;
        if (this.selectedOption !== null) {
            bool = false;
        }
        if (this.startDate !== null && this.endDate !== null) {
            bool = false;
        }
        if (this.searchText !== '') {
            bool = false;
        }
        return bool;
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
            options: t.options || [],
        };
    }
    private getSearchTypeInfo() {
        const info = this.searchTypes.find(
            (i) => i.value === this.selectedSearchValue
        );
        if (!info) {
            return {
                name: 'Job Name',
                value: 'Job Name',
                type: 'search',
                fieldName: 'JobName',
                options: undefined,
            };
        }
        return info;
    }

    get orderBy(): string | null {
        if (!this.sort) {
            return null;
        }
        let defaultSort = {
            active: 'detail',
            direction: 'desc',
        };
        const { direction } = defaultSort;
        const active = defaultSort.active as SortFields | undefined;
        if (!active) {
            return null;
        }
        const fieldName = sortFieldMap[active];
        if (!fieldName) {
            return null;
        }
        return `${fieldName} ${direction || 'asc'}`;
    }

    //TODO: get rid of this
    get filterQuery() {
        const t = this.getSearchTypeInfo();
        if (t.type === 'search' && this.searchText) {
            return `UPPER(${t.fieldName}) like UPPER('%${this.searchText}%')`;
        } else if (t.type === 'options' || t.type === 'proOptions') {
            const selectOpt = (t.options || []).find(
                (o) => o.name === this.selectedOption
            );
            const values =
                selectOpt && selectOpt.values ? selectOpt.values : [];
            const list = values.map((o) => `'${o}'`).join(', ');
            return `UPPER(${t.fieldName}) in (${list})`;
        } else if (t.type === 'date-range' && this.startDate && this.endDate) {
            const formattedStartDate = this.formatDateForFilter(this.startDate);
            const formattedEndDate = this.formatDateForFilter(this.endDate);
            return `UPPER(${t.fieldName}) > '${formattedStartDate}' and UPPER(${t.fieldName}) < '${formattedEndDate}'`;
        } else if (t.type === 'date-range' && this.startDate) {
            const formattedStartDate = this.formatDateForFilter(this.startDate);
            return `UPPER(${t.fieldName}) > '${formattedStartDate}'`;
        } else if (t.type === 'date-range' && this.endDate) {
            const formattedEndDate = this.formatDateForFilter(this.endDate);
            return `UPPER(${t.fieldName}) < '${formattedEndDate}'`;
        }
        return '';
    }

    get orderCount() {
        if (!this.dataSource) {
            return 0;
        }
        const orders$ = this.dataSource.orders$;
        if (!orders$) {
            return 0;
        }
        if (!orders$.value) {
            return 0;
        }
        if (!orders$.value.result) {
            return 0;
        }
        if (!orders$.value.result.pagination) {
            return 0;
        }
        if (!orders$.value.result.pagination.totalCount) {
            return 0;
        }
        return orders$.value.result.pagination.totalCount;
    }

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly route: ActivatedRoute,
        private readonly orderHistory: OrderHistoryService,
        private readonly userService: UserService,
        private readonly _snackBar: MatSnackBar,
        private readonly userPreferenceService: UserPreferenceService
    ) {}

    async getAccountId() {
        const accountId = this.getAccountParameter();
        return accountId || (await this.getSessionAccount());
    }

    private getAccountParameter(): string | null {
        const accountId = this.route.snapshot.paramMap.get('accountId');
        if (!accountId) {
            throw new Error('Failed to get accountId');
        }
        const accountParameter = parseInt(accountId, 10);
        return isNaN(accountParameter) ? null : accountId;
    }

    private async getSessionAccount(): Promise<string> {
        const sessionInfo = await this.userService.getSessionInfo();
        if (!sessionInfo) {
            throw new Error('Failed to get user info');
        }
        this.activeAccount = sessionInfo;
        return this.activeAccount.lastSelectedAccount.accountLegacyId;
    }

    async ngOnInit() {
        try {
            const accountId = await this.getAccountId();
            this.accountId = accountId;

            this.dataSource = new OrderHistoryDataSource(this.orderHistory);

            await this.loadOrderHistory(this.orderBy, true);
        } finally {
            this.isLoading = false;
        }
    }
    async sortSavedOrder(sort: any) {
        this.isLoading = true;
        const active = sort.active as SortFields;
        const { direction } = sort;
        const fieldName = sortFieldMap[active];
        try {
            await this.loadOrderHistory(`${fieldName} ${direction || 'asc'}`);
            this.paginatorSort = `${fieldName} ${direction || 'asc'}`;
        } finally {
            this.isLoading = false;
        }
    }

    async exportOrder(pricing: boolean, type: string) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = 10000;
        const account = await this.userService.ensureSessionInfo();
        if (this.selection.selected.length === 0) {
            this._snackBar.open(
                `Please select order(s) to download`,
                'Close',
                config
            );
        }
        const selectedOrders = this.selection.selected;
        const productPromises: Promise<OrderDetailResponseV2>[] = [];
        for (const selected of selectedOrders) {
            const promise = this.orderHistory.getOrderDetail(
                selected.orderId,
                account.lastSelectedAccount.accountLegacyId,
                selected.accountToken || null
            );
            productPromises.push(promise);
        }
        const OrderLookups = await Promise.all(productPromises);
        const csvObj: CvsObject[] = [];
        for (const order of OrderLookups) {
            if (
                order &&
                order.lineItems &&
                order.order.job &&
                order.order.shipping &&
                order.order.shipping.address
            ) {
                if (pricing) {
                    const shippingAddress = this.formatAddress(
                        order.order.shipping.address
                    );
                    for (const element of order.lineItems) {
                        csvObj.push({
                            OrderPlacedDate: order.order.orderPlacedDate,
                            OrderNumber: order.order.orderId,
                            OrderStatus: this.formatStatus(
                                order.order.orderStatusCode
                            ),
                            CustPO: order.order.purchaseOrderNo,
                            JobName: order.order.job.jobName,
                            ShippingAddress: shippingAddress,
                            ItemDescription: element.itemOrProductDescription,
                            ItemNumber: element.itemNumber,
                            UnitPrice: element.unitPrice,
                            UoM: element.unitOfMeasure,
                            ShippedQty: element.quantity,
                            SubTotal: element.subTotal,
                        });
                    }
                    csvObj.push({
                        OrderPlacedDate: order.order.orderPlacedDate,
                        OrderNumber: order.order.orderId,
                        OrderStatus: this.formatStatus(
                            order.order.orderStatusCode
                        ),
                        CustPO: order.order.purchaseOrderNo,
                        JobName: order.order.job.jobName,
                        ShippingAddress: shippingAddress,
                        ItemDescription: 'Other charges',
                        ItemNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        ShippedQty: '',
                        SubTotal: order.order.subTotal,
                    });
                    csvObj.push({
                        OrderPlacedDate: order.order.orderPlacedDate,
                        OrderNumber: order.order.orderId,
                        OrderStatus: this.formatStatus(
                            order.order.orderStatusCode
                        ),
                        CustPO: order.order.purchaseOrderNo,
                        JobName: order.order.job.jobName,
                        ShippingAddress: shippingAddress,
                        ItemDescription: 'Order Tax',
                        ItemNumber: '',
                        UnitPrice: '',
                        UoM: '',
                        ShippedQty: '',
                        SubTotal: order.order.tax,
                    });
                } else {
                    for (const element of order.lineItems) {
                        const shippingAddress = this.formatAddress(
                            order.order.shipping.address
                        );
                        csvObj.push({
                            OrderPlacedDate: order.order.orderPlacedDate,
                            OrderNumber: order.order.orderId,
                            OrderStatus: this.formatStatus(
                                order.order.orderStatusCode
                            ),
                            CustPO: order.order.purchaseOrderNo,
                            JobName: order.order.job.jobName,
                            ShippingAddress: shippingAddress,
                            ItemDescription: element.itemOrProductDescription,
                            ItemNumber: element.itemNumber,
                            UoM: element.unitOfMeasure,
                            ShippedQty: element.quantity,
                        });
                    }
                }
            }
        }

        if (csvObj && this.selection.selected.length !== 0 && type === 'csv') {
            // const jsonCsv = JSON.stringify(csvObj);
            const sheet = xlsx.utils.json_to_sheet(csvObj);
            const book = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(book, sheet, 'OrderSumarry');
            const option: xlsx.WritingOptions = {
                type: 'array',
                cellDates: false,
                bookSST: false,
                bookType: 'csv',
                sheet: '',
                compression: false,
                ignoreEC: true,
            };
            xlsx.writeFile(book, 'OrderSumary.csv', option);
        }
        if (
            csvObj &&
            this.selection.selected.length !== 0 &&
            type === 'excel'
        ) {
            const sheet = xlsx.utils.json_to_sheet(csvObj);
            const book = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(book, sheet, 'OrderSumarry');
            const option: xlsx.WritingOptions = {
                type: 'array',
                cellDates: false,
                bookSST: false,
                bookType: 'xlsx',
                sheet: '',
                compression: false,
                ignoreEC: true,
            };
            xlsx.writeFile(book, 'OrderSumary.xlsx', option);
        }
    }

    formatAddress(shipAdd: BranchAddress) {
        return [
            shipAdd.address1,
            shipAdd.address2,
            shipAdd.address3,
            [shipAdd.city, shipAdd.state].filter((i) => i).join(', '),
            shipAdd.postalCode,
        ]
            .filter((i) => i)
            .join(' ');
    }
    formatStatus(
        orderStatus: 'P' | 'R' | 'I' | 'N' | 'C' | 'K' | 'O' | undefined
    ) {
        switch (orderStatus) {
            case 'I':
                return 'Invoiced';
            case 'R':
                return 'Delivered';
            case 'P':
                return 'Delivered';
            case 'C':
                return 'Processing';
            case 'O':
                return 'Ready Delivery / Pick up';
            case 'K':
                return 'Processing';
            case 'N':
                return 'Pending';
            default:
                return 'Status Unavailable';
        }
    }

    formatDate(data: OrderHistory[]) {
        for (const items of data) {
            items.orderPlacedDate = moment(
                items.orderPlacedDate,
                'DD/MM/YYYY'
            ).format('MM/DD/YYYY');
        }
        return data;
    }
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
            row.position + 1
        }`;
    }

    getOrderPlacedDate(o: OrderHistory) {
        try {
            const parsedDate = moment(o.orderPlacedDate, 'MM-DD-YYYY');
            if (!parsedDate.isValid()) {
                return 'Failed: ' + o.orderPlacedDate;
            }
            return parsedDate.toDate();
        } catch {
            return 'Failed: ' + o.orderPlacedDate;
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

    ngAfterViewInit() {
        if (this.sort) {
            this.sort.sortChange.subscribe(
                () => (this.paginator.pageIndex = 0)
            );

            this.searchText$.subscribe();

            merge(this.sort.sortChange, this.paginator.page)
                .pipe(tap(() => this.loadOrderHistory(this.paginatorSort)))
                .subscribe();
        }
    }

    private async loadOrderHistory(
        orderByParam?: string | null,
        initializing = false
    ) {
        this.isLoading = true;
        try {
            //  Get user preferences
            const userPreference = this.userPreferenceService.getUserPreference();
            //  Only apply the search defaults if the user has not changed the search criteria
            if (initializing) {
                this.paginator.pageSize = userPreference.pageSize;
                this.selectedSearchValue = userPreference.searchParam.toString();
                this.searchText = userPreference.searchTerm;
            }

            const startD = this.startDate;
            const endD = this.endDate;
            const accountId = this.accountId;
            const pageNo = this.paginator ? this.paginator.pageIndex : 1;
            let pageSize = this.paginator ? this.paginator.pageSize : 10;
            const orderBy = orderByParam || null;
            let searchBy: string | null = this.selectedSearchValue;
            const searchTerm: string | null = this.searchText;
            const searchStartDate = startD
                ? this.formatDateForFilter(startD)
                : null;
            const searchEndDate = endD ? this.formatDateForFilter(endD) : null;
            const searchEnum = this.selectedOption;
            // set updated params
            const newParams = {
                pageSize: pageSize,
                searchParam: (searchBy as unknown) as searchingParams,
                searchTerm: searchTerm,
            };
            this.userPreferenceService.setUserPreference(newParams);

            if (
                searchBy &&
                !searchTerm &&
                !searchEnum &&
                !searchStartDate &&
                !searchEndDate
            ) {
                searchBy = null;
            }
            await this.dataSource.loadOrders(
                accountId,
                pageNo,
                pageSize,
                searchBy,
                searchTerm,
                searchStartDate,
                searchEndDate,
                searchEnum,
                orderBy
            );
        } finally {
            // did get something here?
            this.isLoading = false;
        }
    }

    applyFilter(filterValue: string) {
        this.searchText$.next(filterValue);
    }

    isAllSelected(): boolean {
        if (!this.dataSource) {
            return false;
        }
        if (
            this.dataSource.orders$.value === null ||
            !this.dataSource.orders$.value
        ) {
            return false;
        }
        if (!this.dataSource.orders$.value.result) {
            return false;
        }
        if (!this.dataSource.orders$.value.result.orders) {
            return false;
        }
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.orders$.value.result.orders.length;
        return numSelected === numRows;
    }
    masterToggle() {
        if (this.dataSource.orders$.value === null) {
            return;
        }
        if (!this.dataSource.orders$.value.result.orders) {
            return;
        }
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.orders$.value.result.orders.forEach((row) =>
                  this.selection.select(row)
              );
    }
    // async clearSearch() {
    //   this.applyFilter('');
    //   await this.doSearch();
    // }

    async doSearch() {
        this.paginator.pageIndex = 0;
        this.filterChanging = false;
        await this.loadOrderHistory();
        // console.log('Doing search', this.searchText$.value);
    }

    getFilterValue() {
        const t = this.getSearchTypeInfo();
        if (t.type === 'search' && this.searchText) {
            return this.searchText;
        } else if (t.type === 'options') {
            return this.selectedOption;
        } else if (t.type === 'date-range' && this.startDate && this.endDate) {
            const formattedStartDate = this.formatDateForFilter(this.startDate);
            const formattedEndDate = this.formatDateForFilter(this.endDate);
            return `${formattedStartDate} to ${formattedEndDate}`;
        } else if (t.type === 'date-range' && this.startDate) {
            const formattedStartDate = this.formatDateForFilter(this.startDate);
            return `from ${formattedStartDate}`;
        } else if (t.type === 'date-range' && this.endDate) {
            const formattedEndDate = this.formatDateForFilter(this.endDate);
            return `to ${formattedEndDate}`;
        }
        return '';
    }
    async clearFilter() {
        this.selectedSearchValue = 'OrderPlacedDate';
        this.selectedOption = null;
        this.startDate = null;
        this.endDate = null;
        this.searchText = '';
        this.filterChanging = false;
        this.applyFilter('');
        this.paginator.pageIndex = 0;
        await this.loadOrderHistory();
    }

    filterChange() {
        this.filterChanging = true;
    }

    searchTypeChange() {
        this.filterChanging = true;
        this.searchText = '';
        this.selectedOption = null;
        this.startDate = null;
        this.endDate = null;
    }
}

// function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
//   return obj[key];
// }

export interface CvsObject {
    OrderPlacedDate?: string;
    OrderNumber?: string;
    OrderStatus?: string;
    CustPO?: string;
    JobName?: string;
    ShippingAddress?: string;
    ItemDescription?: string;
    ItemNumber?: string;
    UnitPrice?: number | string;
    UoM?: string;
    ShippedQty?: number | string;
    SubTotal?: number;
}

export interface ExcelObject {
    OrderPlacedDate?: string;
    OrderNumber?: string;
    OrderStatus?: string;
    CustPO?: string;
    JobName?: string;
    ShippingAddress?: string;
    ItemDescription?: string;
    ItemNumber?: string;
    UnitPrice?: number | string;
    UoM?: string;
    ShippedQty?: number | string;
    SubTotal?: number;
}
