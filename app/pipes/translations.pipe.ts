import { Pipe, PipeTransform } from '@angular/core';
import { TranslationsService } from '../services/translations.service';

/**
 * Pipe to convert keys from template into translated values if they exist.
 */
@Pipe({
    name: 'translations',
})
export class TranslationsPipe implements PipeTransform {
    constructor(private translationsService: TranslationsService) {}

    transform(value: string, key?: string): string {
        if (key && this.translationsService.translationsObject) {
            return this.translationsService.translationsObject[key]
                ? this.translationsService.translationsObject[key]
                : value;
        } else if (this.translationsService.translationsObject) {
            return this.translationsService.translationsObject[value]
                ? this.translationsService.translationsObject[value]
                : value;
        } else {
            return value;
        }
    }
}
