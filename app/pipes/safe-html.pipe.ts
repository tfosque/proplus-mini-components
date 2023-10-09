import { Pipe, PipeTransform } from '@angular/core';
import he from 'he';

@Pipe({
    name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
    // tslint:disable-next-line: no-any
    transform(value: any, args?: any): any {
        if (!value) {
            return '';
        }
        if (typeof value === 'string') {
            return he.decode(value);
        }
        return value;
    }
}
