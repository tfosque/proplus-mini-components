import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductsService } from 'src/app/pro-plus/services/products.service';

@Component( {
  selector: 'app-details-options-table',
  templateUrl: './details-options-table.component.html',
  styleUrls: ['./details-options-table.component.scss']
} )
export class DetailsOptionsTableComponent implements OnInit {

  @Input() dataSource: any[] = [];
  @Input() productDetails$: any = {}
  columns$ = new BehaviorSubject<string[]>( [] );
  // columnData$ = new BehaviorSubject<any[]>( [] );
  hideOptions = false;
  nextSku = '';
  hasMultipleSkus = false;

  constructor(
    private readonly productsService: ProductsService
  ) { }

  ngOnInit(): void {
    const { skuListTableData: { dataSource, columns } } = this.productDetails$;
    this.columns$.next( columns );

    // change sku to item number;
    /*  const newDataSrc = dataSource.map( ( m: any ) => {
       m['item number'] = m['sku'];
       delete m['sku'];
       return m;
     } )
     console.log( { newDataSrc } ) */
    this.dataSource = dataSource;
    //
    if ( this.dataSource.length <= 1 ) {
      this.hasMultipleSkus = false
      return;
    };
    this.hasMultipleSkus = true;
  }
  async changeSelectedProduct( element: any ) {
    if ( !this.hasMultipleSkus ) return;

    const itemNumber = element.sku;

    if ( !itemNumber ) {
      alert( 'Error' );
      return;
    };

    this.nextSku = element[0];
    this.productsService.getProductDetails( itemNumber );
  }
}
