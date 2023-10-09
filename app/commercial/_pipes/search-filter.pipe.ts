import { Pipe, PipeTransform } from '@angular/core';

@Pipe( {
  name: 'searchFilter'
} )
export class SearchFilterPipe implements PipeTransform {
  transform( items: any[], searchTerm: string ): any[] {
    if ( !items || !searchTerm ) {
      return items;
    }
    searchTerm = searchTerm.toLowerCase();
    console.log( [searchTerm] );

    /* RETURN */
    return items.filter( item => {
      const keys = Object.keys( item );
      for ( const key of keys ) {
        const value = item[key];

        if ( value && value.toString().toLowerCase().includes( searchTerm ) ) {
          return true;
        }
      }
      return false;
    } );
  }

}
