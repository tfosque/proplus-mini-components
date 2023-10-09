import { Pipe, PipeTransform } from '@angular/core';
import { ProplusUrls } from '../enums/proplus-urls.enum';
import { DevUrls } from '../enums/dev-urls.enum';
import { UatUrls } from '../enums/uat-urls.enum';
import { ProdUrls } from '../enums/prod-urls.enum';

@Pipe({
    name: 'errorImage',
})

export class ErrorImagePipe implements PipeTransform {
    transform(value: any, defaultImage?: string): string {
        if (typeof value === 'string' && value) {
            if (value.startsWith(ProplusUrls.root) || value.startsWith(DevUrls.root) ||
            value.startsWith(UatUrls.root) || value.startsWith(ProdUrls.root)) {
                return value;
            } else {
                return `${ProplusUrls.root}${value}`;
            }
        } else if (defaultImage) {
            return defaultImage;
        } else {
            return value;
        }
    }
}