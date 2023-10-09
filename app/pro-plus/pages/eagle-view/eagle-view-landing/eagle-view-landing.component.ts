import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { EagleViewService } from "../../../services/eagle-view.service";
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EagleViewDataSource } from './eagle-view-report-data-source';
import moment from 'moment';
import { EagleViewSmartOrderDialogComponent } from '../eagle-view-landing/eagle-view-smart-order-dialog/eagle-view-smart-order-dialog.component';

@Component({
  selector: 'app-eagle-view-landing',
  templateUrl: './eagle-view-landing.component.html',
  styleUrls: ['./eagle-view-landing.component.scss']
})
export class EagleViewLandingComponent implements OnInit {
  public hasEVAccount = false;
  
  get isAccountClosed() {
    return this.userService.isLastSelectedAccountClosed;
  }

  constructor(
    private readonly userService: UserService,
    private readonly eagleViewService: EagleViewService,
    private readonly _snackBar: MatSnackBar,
    public readonly eagleViewSource: EagleViewDataSource,
    public dialog: MatDialog

  ) { }

  async ngOnInit() {
      const userInfo = await this.userService.ensureCurrentUserInfo();
      if (!userInfo) {
        throw new Error('Failed to load user info');
      }
      this.hasEVAccount = userInfo.hasPrivateEVAccount;
      if (this.hasEVAccount) {
        // customer has EV account linked
        // const response = await this.eagleViewService.getEagleViewOrderReports(1, 10, {
        //   productsToFiterBy: [31],
        //   statusesToFilterBy: [],
        //   subStatusToFilterBy: '',
        //   fieldsToFilterBy: [],
        //   textToFilterBy: '',
        //   sortBy: 'DatePlaced',
        //   sortAscending: true
        // })
        // console.log('EV reports response: ', response);
        // if (!this.sort) {
        //   console.log('no sort');
        //   return;
        // }
      }
  }

  async linkAccount() {
    const response = await this.eagleViewService.getOktaEagleViewLoginUrl();
    if (response) {
      if (response.result) {
        if (response.result.oktaLoginLink) {
          var oktaLoginUrl = response.result.oktaLoginLink;
          // if (oktaLoginUrl.indexOf("https://dev.becn.digital/proplus/eagle-view") > -1) {
          //   oktaLoginUrl = oktaLoginUrl.replace("https://dev.becn.digital/proplus/eagle-view", 
          //     "http://localhost:4200/proplus/eagle-view");
          // }
          if (oktaLoginUrl.indexOf("https://eagleview.oktapreview.com") > -1) {
            oktaLoginUrl = oktaLoginUrl.replace("https://eagleview.oktapreview.com",
              "https://signin-stage.eagleview.com");
          }
          console.log('okta EV login url: ', oktaLoginUrl);
          window.location.href = oktaLoginUrl;
        }
      }
    }
  }

  formatDate(d: string): string {
    try {
      const inputDate = moment(d);
      return inputDate.format('MM-DD-YYYY');
    } catch {
      return d;
    }
  }

  async unlinkAccount() {
    const config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    const response = await this.eagleViewService.unlinkEVAccount();
    if (response && response.success) {
      this._snackBar.open('EagleView account is unlinked', 'Close', config);
      await this.ngOnInit();
    }
  }
  openSmartOrderDialog(){
    const dialogRef = this.dialog.open(
      EagleViewSmartOrderDialogComponent, {
      height: '92%',
      panelClass: 'custom-dialog'
      }
    );
    dialogRef.afterClosed().subscribe(async (templateName: string) => {
      if (templateName) {
        console.log({templateName})
      }
    })
  }
}
