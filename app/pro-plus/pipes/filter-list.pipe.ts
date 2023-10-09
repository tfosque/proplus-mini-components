import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterList',
})
export class FilterListPipe implements PipeTransform {
    transform(items: any[], searchText: string, field: string): any[] {
        if (!items) {
            return [];
        }
        if (!searchText) {
            return items;
        }
        if (!field) {
            return items;
        }

        return items.filter((item) => {
            return Object.keys(item).some((key) => {
                // console.log({searchText});
                // console.log('item:', item.itemOrProductDescription);
                // console.log('field:', item[`${field}`])
                return String(item[`${field}`])
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
            });
        });
    }
}
