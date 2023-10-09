import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
type Option = { key?: string; value: string; enabled?: boolean };
@Component({
    selector: 'app-search-selector',
    templateUrl: './search-selector.component.html',
    styleUrls: ['./search-selector.component.scss'],
})
export class SearchSelectorComponent implements OnInit {
    myControl = new FormControl();
    public allOptions: Option[] = [];
    captionVar: string = '';

    @Input() public set options(newOptions: Option[]) {
        this.allOptions = newOptions.map((o) => {
            return {
                key: o.key || o.value,
                value: o.value,
                enabled: o.enabled === false ? false : true,
            };
        });
        // this.filteredOptions.next(this.allOptions);
    }

    @Input() public set selectedOption(newSelected: string) {
        this.myControl.setValue(newSelected);
    }
    @Input() public set caption(newCaption: string) {
        this.captionVar = newCaption;
    }
    @Output() selected = new EventEmitter<string>();

    filteredOptions!: Observable<Option[]>;

    constructor() {}

    ngOnInit() {
        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            tap((t) => {
                if (this.allOptions.some((o) => o.key === t)) {
                    this.selected.next(t);
                }
            }),
            map((value) => this.getFilteredOptions(value))
        );
    }

    private getFilteredOptions(value: string): Option[] {
        const filterValue = value.toLowerCase();

        const allOpt = this.allOptions.filter((option) =>
            option.value.toString().toLowerCase().includes(filterValue)
        );
        return allOpt;
    }
}
