/**
 * 
 * @param productDetails 
 * @returns 
 */
export function getSelectedOptions( productDetails: any ) {

  console.group( 'function:' );
  console.log( { productDetails } );

  if ( !productDetails.variations ) return;
  //
  let tableHeader = '';
  const { variations } = productDetails; // or currentSKU?

  const columns = Object.entries( variations ).map( ( m: any ) => m[0] );
  console.log( { columns } );
  //
  const items = Object.entries( variations );

  const SL = items.map( ( vItem: any ) => {
    console.log( { vItem } );

    tableHeader = vItem[0];
    const dataItem = vItem[1];

    return Object.entries( dataItem ).map( ( d: any ) => {
      console.log( { d } )
      return { sku: d[1][0], tableHeader, dataItem: d[0] }
    } )
    // const sku = vItem.itemNumber;   
  } );

  /* const SL = skuList.map( ( listItem: any ) => {
    const items = Object.entries( listItem.variations );
    return items.map( ( vItem: any ) => {
      tableHeader = vItem[0];
      const dataItem = vItem[1][0];
      const sku = listItem.itemNumber;
      return { sku, tableHeader, dataItem }
    } );
  } ) */
  // console.log( { SL } );

  const results = SL.map( ( sItem: any ) => {
    console.log( { sItem } );
    let itemObj: any = {};

    const join = columns.map( ( c: string ) => {
      tableHeader = c;
      console.log( { tableHeader }, { c } )

      return sItem.map( ( i: any ) => {
        console.log( { i } )

        if ( i.tableHeader === c ) {
          itemObj[c] = i.dataItem;
          itemObj['sku'] = i.sku;
          //
          //itemObj = { ...itemObj, color: i.dataItem, sku: i.sku, c };
          console.log( { itemObj } );
          return itemObj;
        }
        /* else if ( i.tableHeader === 'size' ) {
          itemObj = { ...itemObj, size: i.dataItem, sku: i.sku };
          console.log( { itemObj } );
          return itemObj;
        } else if ( i.tableHeader === 'width' ) {
          itemObj = { ...itemObj, width: i.dataItem, sku: i.sku };
          console.log( { itemObj } );
          return itemObj;
        } else if ( i.tableHeader === 'length' ) {
          itemObj = { ...itemObj, length: i.dataItem, sku: i.sku };
          console.log( { itemObj } );
          return itemObj;
        } */
      } );
    } );

    console.log( { join } );

    const joinResults = join.map( ( j: any ) => {
      console.log( 'j', j.filter( ( f: any ) => f !== undefined ) )
      return j.filter( ( f: any ) => f !== undefined )
    } );
    console.log( { joinResults } )

    return sItem.map( ( i: any ) => {
      if ( i.tableHeader === 'color' && columns.includes( i.tableHeader ) ) {
        itemObj = { ...itemObj, color: i.dataItem, sku: i.sku };
        console.log( { itemObj } );
        return itemObj;
      } else if ( i.tableHeader === 'size' ) {
        itemObj = { ...itemObj, size: i.dataItem, sku: i.sku };
        console.log( { itemObj } );
        return itemObj;
      } else if ( i.tableHeader === 'width' ) {
        itemObj = { ...itemObj, width: i.dataItem, sku: i.sku };
        console.log( { itemObj } );
        return itemObj;
      } else if ( i.tableHeader === 'length' ) {
        itemObj = { ...itemObj, length: i.dataItem, sku: i.sku };
        console.log( { itemObj } );
        return itemObj;
      }
    } )
  } )
  console.log( { results } );

  const dataSrc = results.map( ( f: any ) => f.slice( -1 ) );
  console.log( { dataSrc } );

  const dataSource = dataSrc.map( ( ds: any ) => ds[0] );
  console.log( { dataSource } );

  console.groupEnd();

  // update columns
  // this.columns$.next( cols );
  // this.columnData$.next( [] );

  return dataSource;
}