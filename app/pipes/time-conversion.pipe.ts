import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatTime',
})
export class TimeConversionPipe implements PipeTransform {
    transform(value: unknown, _args?: unknown): string {
        // tslint:disable-next-line: strict-type-predicates
        if (typeof value !== 'string' && typeof value !== 'number') {
            return '';
        }
        if (!isNaN(Number(value))) {
            const intTime = Number(value);
            if (intTime === 12) {
                return '12 PM';
            } else if (intTime < 12) {
                return `${intTime.toString()} AM`;
            } else {
                return `${(intTime - 12).toString()} PM`;
            }
        } else {
            return `${value}`;
        }
    }
}
