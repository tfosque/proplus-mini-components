import { Pipe, PipeTransform } from '@angular/core';

/**
 * Used to ensure that external links are prepended with a protocol
 */
@Pipe({
    name: 'protocol',
})
export class ProtocolPipe implements PipeTransform {
    transform(value: string): string {
        if (
            value &&
            !value.includes('://') &&
            !value.includes('mailto:') &&
            !value.includes('tel:')
        ) {
            return `https://${value}`;
        }
        return value;
    }
}
