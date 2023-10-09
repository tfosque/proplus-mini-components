import { Component, Input, OnInit } from '@angular/core';
import { FavoritesService } from '../../services/favorites.service';
import { UserService } from '../../services/user.service';

@Component( {
  selector: 'app-img-fav-icon',
  templateUrl: './img-fav-icon.component.html',
  styleUrls: ['./img-fav-icon.component.scss']
} )
export class ImgFavIconComponent implements OnInit {
  @Input() element: any = {};
  @Input() itemNumber = '';
  @Input() width = '100%'; // REVIEW 
  // 
  @Input() size = '' // small, medium, large
  @Input() imgUrl = '';
  @Input() fallbackImage = '';
  @Input() isFavorite = false // INITIAL load state

  isFinishedLoading = false;

  isLoggedIn = false; // TODO 

  constructor(
    private readonly favService: FavoritesService,
    private userService: UserService
  ) { }
  ngOnInit(): void {
    this.userService.sessionBehavior.subscribe( s => {
      if ( s.session.user?.lastSelectedAccount.accountEnabled ) {
        this.isLoggedIn = true;
      }
    } )
    // INITIALIZE !important isFavorite icon with BE favorites response
    // this.isFavorite$.next( this.isFavorite );
  }
  async toggleFavorite( event: any ) {
    event.preventDefault();
    event.stopPropagation();

    // TOGGLE immediately for quick ui
    this.isFavorite = !this.isFavorite;
    // console.log( 'itemNum:', this.itemNumber );

    // SAVE 
    if ( this.isFavorite ) {
      console.log( 'save....' );
      this.saveFavorite();
      return;
    }
    // REMOVE 
    // console.log( 'remove....' );
    this.removeFavorite();
  }
  async saveFavorite() {
    const saveResponse: any = await this.favService.saveFavoritesPure( { itemNumber: this.itemNumber } );
    console.log( { saveResponse } );
    // error
  }
  async removeFavorite() {
    const saveResponse: any = await this.favService.updateFavoritesPure( { itemNumber: this.itemNumber } );
    console.log( { saveResponse } );
    // error
  }

  buildFallbackImage() {
    return `https://beaconproplus.com${this.fallbackImage}`;
  }
  updateImageLoaded( val: boolean ) {
    this.isFinishedLoading = true;
  }

  createId() {
    if ( this.size === 'small' ) {
      return 'favorite-container-small';
    }
    // TODO  medium
    return 'favorite-container-large';
  }

  addToSelectedFavorites( item: any ) {
    if ( !this.isFavorite ) {
      this.favService.removeFromFavorites( item );
      return;
    };
    this.favService.addToSelectedFavorites( item );
  }

}
