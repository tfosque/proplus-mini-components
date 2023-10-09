import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'totalPrice',
})
export class TotalPricePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (typeof value === 'number') {
            if (value === 0) {
                return '';
            } else {
                return value.toString();
            }
        } else if (value === '') {
            return '';
        } else if (value) {
            return value;
        } else {
            return '';
        }
    }
}
