import { Pipe, PipeTransform } from '@angular/core';
import { ProplusUrls } from '../enums/proplus-urls.enum';

@Pipe({
    name: 'productImage',
})

export class ProductImagePipe implements PipeTransform {
    transform(value: any, args?: any): string {
        if (typeof value === 'string' && value) {
            if (value.toLowerCase().startsWith('https://')) {
                return value;
            } else {
                return `${ProplusUrls.root}${value}`;
            }
        } else {
            return value;
        }
    }
}
