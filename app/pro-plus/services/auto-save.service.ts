import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable( {
  providedIn: 'root'
} )
export class AutoSaveService {
  private defaultVal = new BehaviorSubject<any>( {} );
  public defaultVal$ = this.defaultVal.asObservable();

  private finalVal = new BehaviorSubject<any>( {} );
  public finalVal$ = this.finalVal.asObservable;

  private hasFormDataChanged = new BehaviorSubject<boolean>( false );
  public hasFormdataChanged$ = this.hasFormDataChanged.asObservable();

  constructor() { }

  public setInitFormData( val: any ) {
    this.defaultVal.next( val );
  }

  public updateFinalFormChange( val: any ) {
    this.finalVal.next( val );
  }

  public async compareHasFormDataChanged(): Promise<any> {
    const objInitFormData = this.defaultVal.value;

    // TODO if not an array, not null, not undefined, but an object or string
    if ( objInitFormData && !objInitFormData.length ) {
      console.log( 'object......., or string' );
      // const original = String( objInitFormData );
      // const final = String( objEnd );
      // console.log( { def }, { final } );
    }

    /* Array */
    if ( objInitFormData && objInitFormData.length ) {

      /* Start */
      const initFormData = this.defaultVal.value.map( ( m: any ) => {
        return String( m.quantity )
      } )

      const updatedFormData = this.finalVal.value.map( ( m: any ) => {
        return String( m.quantity )
      } )

      const compare = new Promise( ( res, rej ) => {
        res( initFormData !== updatedFormData );
        rej( ( err: any ) => err );
      } );

      console.log( 'has form data changed...', await compare );
      // TODO evaluate
      if ( ( await compare !== undefined || await compare !== null ) ) {
        this.hasFormDataChanged.next( true )
      }
      return await compare;
    }
  }

}
