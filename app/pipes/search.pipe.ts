import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns an array of fields filtered by the given query.  To use follow format of
 * search : 'keys to search with' : query
 * in template.
 */
@Pipe({
    name: 'search',
})
export class SearchPipe implements PipeTransform {
    transform(value: any[], keys: string, term: string): any {
        if (!term) {
            return value;
        }

        return (value || []).filter((item: any) => {
            return keys.split(',').some((key) => {
                return (
                    item.hasOwnProperty(key) &&
                    new RegExp(term, 'gi').test(item[key])
                );
            });
        });
    }
}
