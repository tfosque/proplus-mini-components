import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
import { ProductImp } from '../global-classes/product-imp';
// import { ProductsService } from '../pro-plus/services/products.service';
import { PageNotFoundService } from '../services/page-not-found.service';
// import { PageService } from '../services/page.service';

@Injectable( {
    providedIn: 'root',
} )
export class ProductDataResolverService implements Resolve<ProductImp> {
    constructor(
        // private readonly pageService: PageService,
        private readonly pageNotFound: PageNotFoundService,
        //  private readonly productService: ProductsService
    ) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Observable<never> {
        const localProductId = route.paramMap.get( 'productId' );
        // const localItemNumber = route.paramMap.get( 'itemNumber' );

        if ( !localProductId ) {
            this.pageNotFound.setIsPageProductNotFound( true );

            return of( null );
        }

        /*  return this.productService
             .getProduct( localProductId, localItemNumber, true )
             .pipe(
                 switchMap( ( product ) => {
                     if ( product ) {
                         this.pageNotFound.setIsPageProductNotFound( false );
 
                         
                         return of( product )
                     }
 
                     this.pageNotFound.setIsPageProductNotFound( true );
 
                     return this.pageService
                         .fakePreload( state.url, '/pagenotfound' )
                         .pipe( switchMap( () => of( null ) ) );
                 } )
             ); */
        return new Observable;
    }
}
