import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import moment from 'moment';

type SearchOptionBase<T> = {
    name: string;
    fieldName: string;
} & T;

export type SearchOption = SearchOptionBase<{
    type: 'search' | 'date' | 'date-range' | 'options';
    options?: { name: string; value?: string | number }[];
}>;

export type SearchValue = null | string | Date;

export type SearchEvent = {
    option: string;
    searchValue: SearchValue;
    fieldName: string;
};

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
    private _selectedOptionName = '';
    @Input() public searchTypes: SearchOption[] = [];
    @Input() public itemName = '';
    @Input() public totalCount = 0;
    @Output() public search = new EventEmitter<SearchEvent>();
    @Output() public clear = new EventEmitter<boolean>();
    public searchValue: SearchValue = '';
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

    constructor() {}

    ngOnInit() {}

    doSearch(evt: Event) {
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
        this.clear.next(false);
        evt.preventDefault();
        return false;
    }

    getSearchValue(filter: string, filterValue: SearchValue) {
        if (
            filter === 'Created Date' ||
            filter === 'LastModified Date' ||
            filter === 'Submitted Date'
        ) {
            return this.formatDateForFilter(filterValue);
        } else {
            return filterValue;
        }
    }

    formatDateForFilter(d: SearchValue): string {
        if (!d) {
            return '';
        }
        try {
            const inputDate = moment(d);
            return inputDate.format('MM-DD-YYYY');
        } catch {
            return d.toString();
        }
    }

    async clearFilter(evt: Event) {
        this.filterChanging = false;
        this.selectedSearchOption = 'Order Name';
        this.clear.next(true);
        evt.preventDefault();
        return false;
    }

    searchTypeChange() {
        this.filterChanging = true;
        this.searchValue = '';
    }

    filterChange() {
        this.filterChanging = true;
    }
}
