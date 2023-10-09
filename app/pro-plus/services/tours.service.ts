import { ProPlusApiBase } from './pro-plus-api-base.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

interface TourResponse {
  messages: string | null;
  result: TourDetail;
  success: boolean;
}

interface TourPost {
  type: string;
  firstRecordedTour: string;
  lastRecordedTour: string;
  optOut: boolean;
  optOutOfAllTours: boolean;
}

interface TourDetail {
  homePageTour: ItemTourDetail;
  templatesLandingTour: ItemTourDetail;
  templatesDetailTour: ItemTourDetail;
  orderHistoryLandingTour: ItemTourDetail;
  orderHistoryDetailTour: ItemTourDetail;
  optOutOfAllTours: boolean;
}

interface ItemTourDetail {
  firstRecordedTour?: string;
  lastRecordedTour?: string;
  nextScheduledTour?: string;
  optOut?: boolean;
}

interface NextScheduledTours {
  homePage: NextScheduledToursItem;
  templatesLandingTour: NextScheduledToursItem;
  templatesDetailTour: NextScheduledToursItem;
  orderHistoryLandingTour: NextScheduledToursItem;
  orderHistoryDetailTour: NextScheduledToursItem;
}

interface NextScheduledToursItem {
  time: string | undefined;
  optOut: boolean | undefined;
}

/* TASK *//* 
  [x] Clean up Types
  [x] Remove ? option flag for types
  [x] Use ProplusBaseApi Headers
  [x] Fix setTour api post call
  [x] Write logic to check for nextScheduled Tour
  [ ] Write fail api logic
  [ ] Create either a Guard for each tour url or write independent logic for each tour landing page ts file.
  [ ] Test on UAT and provide multiple scenarios
*/
@Injectable( {
  providedIn: 'root'
} )
export class ToursService {
  // Initialize tourDetail for BehaviorSubject
  private tourDetail: TourDetail = {
    homePageTour: { firstRecordedTour: '', lastRecordedTour: '', nextScheduledTour: '', optOut: false },
    templatesLandingTour: { firstRecordedTour: '', lastRecordedTour: '', nextScheduledTour: '', optOut: true },
    templatesDetailTour: { firstRecordedTour: '', lastRecordedTour: '', nextScheduledTour: '', optOut: true },
    orderHistoryLandingTour: { firstRecordedTour: '', lastRecordedTour: '', nextScheduledTour: '', optOut: false },
    orderHistoryDetailTour: { firstRecordedTour: '', lastRecordedTour: '', nextScheduledTour: '', optOut: false },
    optOutOfAllTours: false
  };
  private nextScheduledTourInit: NextScheduledTours = {
    homePage: { time: '', optOut: false },
    templatesLandingTour: { time: '', optOut: false },
    templatesDetailTour: { time: '', optOut: false },
    orderHistoryLandingTour: { time: '', optOut: false },
    orderHistoryDetailTour: { time: '', optOut: false }
  }
  private tours = new BehaviorSubject<TourDetail>( this.tourDetail );
  public tours$ = this.tours.asObservable();

  private optOutAll = new BehaviorSubject<boolean>( false );
  public optOutAll$ = this.optOutAll.asObservable();

  private usersNextScheduledTours = new BehaviorSubject<NextScheduledTours>( this.nextScheduledTourInit );
  public usersNextScheduledTours$ = this.usersNextScheduledTours.asObservable();

  /* Test with incomplete dates, past dates, future dates, wrong formatted dates */
  todayFormat = moment(new Date()).format( 'YYYY-MM-DD hh:mm:ss.sssssss' );

  constructor(
    private readonly api: ProPlusApiBase
  ) { }
  public async getTours() {
    try {
      const { body } = await this.api.getV2<TourResponse>(
        'getNewUserTour',
        {}
      );
      // console.log( { body } );
      if ( body && body.success && body.result ) {
        this.tours.next( body.result );
        setTimeout( () => {
          this.getNextScheduledTours();
        }, 1000 );

        console.log( { body } );
      }
      return body;
    } catch ( error ) {
      console.log( { error } );
      throw error;
    }
  }

  // updateNewUserTour
  public async setTour( type: string, optOut: boolean, optOutOfAllTours: boolean ) {
    // if we dont have a tour type(name) and a recorded ate // TEST null params
    if ( !type ) return;

    // else update tour
    const updateTour: TourPost = {
      type,
      firstRecordedTour: '',
      lastRecordedTour: this.todayFormat,
      optOut: false, // USER input  we need a way for user to change update this in the app
      optOutOfAllTours: false // USER input  we need a way for user to change update this in the app
    }
    try {
      const { body } = await this.api.postV2<TourResponse>(
        'updateNewUserTour', updateTour
      );
      if ( body && body.success && body.result ) {
        console.log( { body } );
      }
      return body;
    } catch ( error ) {
      console.log( { error } );
      throw error;
    }
  }
  /*  
    // BACKEND Discuss with Chen !important - if optOutOFAllTours is true what happens to other fields?
     // Do we leave values for homePage, templatesLandingTour the same?
   }; */
  private getNextScheduledTours() {
    const userHasOptedOut = this.tourDetail.optOutOfAllTours;

    if ( userHasOptedOut ) {
      this.optOutAll.next( userHasOptedOut );
      console.log( 'user has opted out of tours!' )
      return;
    };
    // otherwise evaluate tour dates
    console.log( 'user has not opted out of tours!' );
    // This is the object that the UI will listen for changes
    this.usersNextScheduledTours.next(
      {
        homePage:  {
          time: this.tours.value.homePageTour && this.tours.value.homePageTour.nextScheduledTour,
          optOut: this.tours.value.homePageTour && this.tours.value.homePageTour.optOut
        }, 
        templatesLandingTour: {
          time: this.tours.value.templatesLandingTour && this.tours.value.templatesLandingTour.nextScheduledTour,
          optOut: this.tours.value.templatesLandingTour && this.tours.value.templatesLandingTour.optOut
        },
        templatesDetailTour: {
          time: this.tours.value.templatesDetailTour && this.tours.value.templatesDetailTour.nextScheduledTour,
          optOut: this.tours.value.templatesDetailTour && this.tours.value.templatesDetailTour.optOut
        },
        orderHistoryLandingTour: {
          time: this.tours.value.orderHistoryLandingTour && this.tours.value.orderHistoryLandingTour.nextScheduledTour,
          optOut: this.tours.value.orderHistoryLandingTour && this.tours.value.orderHistoryLandingTour.optOut
        },
        orderHistoryDetailTour: {
          time: this.tours.value.orderHistoryDetailTour && this.tours.value.orderHistoryDetailTour.nextScheduledTour,
          optOut: this.tours.value.orderHistoryDetailTour && this.tours.value.orderHistoryDetailTour.optOut
        }
      } );
    console.log( 'next:', this.usersNextScheduledTours.value );
  }
}