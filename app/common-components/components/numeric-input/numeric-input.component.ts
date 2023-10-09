import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-numeric-input',
    templateUrl: './numeric-input.component.html',
    styleUrls: ['./numeric-input.component.scss'],
})
export class NumericInputComponent implements OnInit {
    private _currentValue = 0;
    public get currentValue() {
        return this._currentValue;
    }
    @Input() public set currentValue(newValue: number) {
        this._currentValue = newValue;
        this.currentValueChange.next(newValue);
    }
    @Output() currentValueChange = new EventEmitter<number>();

    @Input() min = 0;
    @Input() max = 1000000;
    @Input() size = 5;
    @Input() className = '';
    @Input() editMode = true;
    @Input() itemFromQuote = false;

    constructor() {}

    public onInput(evt: any) {
        const minValue = this.min;
        const maxValue = this.max;
        const target = evt && evt.target;
        if (!target) {
            return;
        }
        if (target && target instanceof HTMLInputElement) {
            const re = /[^0-9]/g;
            //  Allow blank entries and skip all other validation
            if (target.value === '') {
                return;
            }
            const input = target.value.replace(re, '');
            if (re.test(target.value)) {
                target.value = input;
                return;
            }
            let value = parseInt(input, 10);
            if (isNaN(value)) {
                value = this.min;
            }
            const newValue = Math.min(Math.max(minValue, value), maxValue);

            //  Updating the textbox with the fixed value
            target.value = newValue.toString();
            //  Updating the model
            this.currentValue = newValue;
        }
    }

    update(evt: FocusEvent, qtyInput: string) {
        const target = evt && evt.target;
        if (!target) {
            return undefined;
        }
        if (target && target instanceof HTMLInputElement) {
            if (qtyInput === '') {
                target.value = this.min.toString();
                return true;
            }
            const qty = parseInt(qtyInput, 10);
            if (isNaN(qty) || qty < this.min || qty > this.max) {
                target.value = this.min.toString();
            }
        }
        return undefined;
    }

    keyPress(event: KeyboardEvent, qtyInput: string) {
        console.log({ qtyInput });
        if (event.key === '.' || event.key === 'e') {
            event.preventDefault();
        }
    }

    ngOnInit() {}
}
