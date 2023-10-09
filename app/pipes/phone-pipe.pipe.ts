import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phone',
})
export class PhonePipePipe implements PipeTransform {
    // tslint:disable-next-line: no-any
    transform(value: any, args?: any): string {
        if (typeof value === 'string' && value) {
            return value
                .replace(/\s+/, '')
                .replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
        } else {
            return value;
        }
    }
}
