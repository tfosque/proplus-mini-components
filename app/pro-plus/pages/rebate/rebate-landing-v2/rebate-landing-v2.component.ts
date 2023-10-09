import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { RebateService } from '../../../services/rebate.service';
import { RebateLanding } from '../../../model/rebate-landing';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { RebateUpdateDialogComponent } from './rebate-update-dialog/rebate-update-dialog.component';
import { SubmittedRebateFormRequest } from '../../../model/rebate-submitted-form';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { UpdateRebateFormResponse } from '../../../model/update-rebate-form';

@Component( {
  selector: 'app-rebate-landing-v2',
  templateUrl: './rebate-landing-v2.component.html',
  styleUrls: ['./rebate-landing-v2.component.scss']
} )
export class RebateLandingV2Component implements OnInit {
  public dataSourceMyRebates: RebateLanding[] = [];
  public dataSourceAvailableRebates: RebateLanding[] = [];
  isloading = true;
  public rebatePermissions = {
    form: false,
    landing: false,
    redeemedDetail: false,
    redeemedSummary: false,
    submit: false,
  };

  get firstName() {
    return this.userService.firstName;
  }

  get isAccountClosed() {
    return this.userService.isLastSelectedAccountClosed;
  }

  get accountId() {
    if ( this.userService.accountIdInString ) {
      return this.userService.accountIdInString;
    } else {
      return null;
    }
  }

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly rebateService: RebateService,
    public updateFormDialog: MatDialog,
    private readonly userNotifier: UserNotifierService,
  ) { }

  async ngOnInit() {
    if ( this.userService.session && this.userService.session.userPermissions ) {
      const perm = this.userService.session.userPermissions.computed;
      //await this.user.getCurrentUserPermission();
      console.log( perm );
      if ( !perm ) {
        await this.router.navigate( ['error'], {
          queryParams: {
            type: 'forbidden',
          },
        } );
      } else {
        this.rebatePermissions = perm.rebate;
        const { landing } = this.rebatePermissions;
        if ( !landing ) {
          await this.router.navigate( ['error'], {
            queryParams: {
              type: 'forbidden',
            },
          } );
        }
      }

      try {
        const response = await this.rebateService.getRebateLandingData();
        if ( response ) {
          if ( response.result ) {
            this.dataSourceMyRebates = response.result.filter( r => r.action?.toLocaleLowerCase() === 'view promotion' );
            console.log( 'My rebates: ', this.dataSourceMyRebates );
            this.dataSourceAvailableRebates = response.result.filter( r => r.action?.toLocaleLowerCase() === 'sign up' ||
              r.action?.toLocaleLowerCase() === 'view form' );
            console.log( 'Available rebates: ', this.dataSourceAvailableRebates );
          }
        }
      } finally {
        this.isloading = false;
      }
    }
  }

  tryParseDate( orderPlacedDate: string | undefined ): string {
    let parsedDate = moment( orderPlacedDate, 'MM-DD-YYYY' );
    if ( parsedDate.isValid() ) {
      return parsedDate.format( 'l' );
    }
    parsedDate = moment( orderPlacedDate );
    return parsedDate.format( 'l' );
  }

  async openDialog( submittedRebateInfoId: string ) {
    // Retrieve the submitted rebate form data
    const request: SubmittedRebateFormRequest = {
      accountId: this.accountId || '',
      submittedRebateInfoId: submittedRebateInfoId
    };
    const rebateFormResponse = await this.rebateService.getSubmittedRebateForm(
      request
    );
    console.log( 'getSubmittedRebateForm response: ', rebateFormResponse );

    if ( rebateFormResponse ) {
      if ( rebateFormResponse.result && rebateFormResponse.result.rebateForm ) {
        const dialogRef = this.updateFormDialog.open( RebateUpdateDialogComponent, {
          width: '500px',
          // height: '700px',
          data: {
            rebateForm: rebateFormResponse.result.rebateForm,
            rebateInfoId: rebateFormResponse.result.rebateInfoId
          },
        } );

        dialogRef.afterClosed().subscribe( async ( response: UpdateRebateFormResponse ) => {
          if ( response ) {
            this.userNotifier.alertError( `Rebate form ${rebateFormResponse.result.rebateForm.rebateName} updated successfully` );
            await this.ngOnInit();
          }
        } );
      } else {
        this.userNotifier.alertError(
          `Error retrieving rebate form information`
        );
      }
    } else {
      this.userNotifier.alertError(
        `Error retrieving rebate form information`
      );
    }



  }

  async viewRebateForm( rebateId: string ) {
    await this.router.navigate( [`/proplus/rebate/form/${rebateId}`] );
  }

  async viewRebateDetails( brand: string, rebateId: string ) {
    const brandForUrl = formatBrandName( brand );
    await this.router.navigate( [`/proplus/rebate/detail/${brandForUrl}/${rebateId}`] );
  }

  getRebateDetailLink( brand: string, rebateId: string ) {
    const brandForUrl = formatBrandName( brand );
    return `/proplus/rebate/detail/${brandForUrl}/${rebateId}`;
  }
}

export function formatBrandName( brandName: string ) {
  if ( brandName ) {
    return brandName.replace( /\s+/g, '-' );
  }
  return brandName;
}
