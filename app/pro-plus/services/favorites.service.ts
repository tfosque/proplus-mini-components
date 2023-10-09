import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserNotifierService } from 'src/app/common-components/services/user-notifier.service';
import { ProPlusApiBase } from './pro-plus-api-base.service';
import { GetEVOrderCategoriesResponse } from "../model/eagle-view-smart-order";
import { GetFavoritesResponse, UpdateFavoritesRequest, UpdateFavoritesResult } from "../model/favorites";
import { UserService } from './user.service';
import { HttpResponse } from '@angular/common/http';


interface Favorite {
  products?: Product[];
}
interface Product {
  key: any;
}

@Injectable( {
  providedIn: 'root'
} )
export class FavoritesService {
  isLoading = new BehaviorSubject<boolean>( false );
  // private accountInfo = new BehaviorSubject<any>( {} );

  /*  */
  private currFavorites = new BehaviorSubject<Favorite[]>( [] );
  public currFavorites$ = this.currFavorites.asObservable();

  /*  */
  private selectedFavorites = new BehaviorSubject<any[]>( [] );
  public selectedFavorites$ = this.selectedFavorites.asObservable();

  constructor(
    private readonly api: ProPlusApiBase,
    private readonly userNotifier: UserNotifierService,
    private userService: UserService
  ) { }

  public async getEVOrderCategories(): Promise<GetEVOrderCategoriesResponse> {
    const { ok, body } = await this.api.getV2<GetEVOrderCategoriesResponse>(
      'getFavoritesCategories',
      {}
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to fetch favorites categories' );
    }
    return body;
  }

  public async getFavorites(
    accountId: string
  ): Promise<GetFavoritesResponse> {
    const { ok, body } = await this.api.getV2<GetFavoritesResponse>(
      'getFavorites',
      {
        account: accountId
      }
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to fetch favorites' );
    }
    return body;
  }

  public async updateFavorites( headerBody: UpdateFavoritesRequest ) {
    const { ok, body } = await this.api.postV2WithError<UpdateFavoritesResult>(
      'updateFavorites',
      headerBody
    );
    if ( !ok || !body ) {
      throw new Error( 'Failed to update favorites' );
    }

    if ( !body.success ) { // REVIEW Messaging
      const text = body.messages && body.messages[0].value
      const start = text?.indexOf( '[' );
      const end = text?.indexOf( ']' );
      if ( start && end ) {
        const message = text?.substring( start, end )
        console.log( { message } );
        if ( message ) {
          this.userNotifier.alertError( message );
        }
      }
    }
    return body;
  }

  async saveFavoritesPure( item: any ) {
    // createFavorite
    // 374189 wont save

    let user: any = {}
    this.userService.sessionBehavior.subscribe( s => {
      user = s.session.user;
    } )

    const selectedItems: any = [{
      itemId: item.itemId || '',
      itemNumber: item.currentSKU?.itemNumber || item.itemNumber,
      unitOfMeasure: '',
      quantity: 1
    }];

    const acct = {
      account: user.lastSelectedAccount.accountLegacyId,
      action: 'createItem',
      categorySort: true,
      items: selectedItems
    }

    // save
    try {
      const save: HttpResponse<any> = await this.api.postV2WithError( 'updateFavorites', acct );
      //
      if ( save.body.success ) {
        // console.log( 'saved...success...', { save } )
        return save;
      }
      // console.log( { save } )
      return save;
    } catch ( error ) {
      this.userNotifier.alertError( 'product was not saved to favorites...' );
      console.log( 'Failed to save favorite.', { error } );
      return error;
    }
  }

  async updateFavoritesPure( item: any ) {
    // modify Favorite
    const selectedItems: any = [{ itemId: item.itemId, itemNumber: item.currentSKU?.itemNumber || item.itemNumber, quantity: 1 }];

    let user: any = {}
    this.userService.sessionBehavior.subscribe( s => {
      user = s.session.user;
    } )

    const acct = {
      account: user.lastSelectedAccount.accountLegacyId,
      action: 'deleteItem',
      categorySort: true,
      items: selectedItems
    }
    // delete
    try {
      const save: any = await this.api.postV2WithError( 'updateFavorites', acct );

      if ( save.body.success ) {
        // console.log( 'saved..deletion..' );
        return save;
      }
      // console.log( { save } )
      return save;
    } catch ( error ) {
      this.userNotifier.alertError( 'product was not saved to favorites...' );
      console.log( 'Failed to save favorite.', { error } );
      return error;
    }
  }

  // Legacy
  addToSelectedFavorites( fav: any ): void {
    this.selectedFavorites.next( [...this.selectedFavorites.value, fav] );
  }
  removeFromFavorites( itemRemove: any ) {
    const list = this.selectedFavorites.value.filter( ( f: any ) => {
      if ( f.itemNumber === itemRemove.itemNumber ) return;
      return f;
    } )
    this.selectedFavorites.next( list );
  }

}