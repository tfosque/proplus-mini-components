import { Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { RebateService } from '../../../services/rebate.service';
import { RebateRedeemedSummaryItem, RebateRedeemedSummaryRequest } from '../../../model/rebate-redeemed-summary';
import { RebateRedeemedDetail } from '../../../model/rebate-redeemed-detail';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { RebateDetailTableComponent } from './rebate-detail-table/rebate-detail-table.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-rebate-detail',
  templateUrl: './rebate-detail.component.html',
  styleUrls: ['./rebate-detail.component.scss']
})
export class RebateDetailComponent implements OnInit {
  @ViewChildren(RebateDetailTableComponent) rebateDetailComponents!: QueryList<RebateDetailTableComponent>;
  @ViewChild('unenrollmentDialog')
  unenrollmentDialog?: TemplateRef<any>;
  @ViewChild('yearTabs', { static: false }) yearTabs!: MatTabGroup;
  brandName = '';
  brandRebateIds: string[] = [];
  yearBrandRebateIds: string[] = [];
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  rebateId = '';
  activeRebateId = '';
  activeRebateId$ = new BehaviorSubject<string>('');
  public rebateItemDetailSummary: RebateRedeemedSummaryItem = {};
  isLoading = true;
  rebateDetails!: RebateRedeemedDetail[];
  // config: MatSnackBarConfig = {
  //   verticalPosition: 'top',
  //   duration: 10000,
  // };

  get isAccountClosed() {
    return this.userService.isLastSelectedAccountClosed;
  }

  get isEmpty() {
    return !this.years.length;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly rebateService: RebateService,
    private readonly _snackBar: MatSnackBar,
    public dialogComp: MatDialog,
  ) { }

  async ngOnInit() {
    try {
      this.isLoading = true;
      if (this.userService.session && this.userService.session.userPermissions) {
        const perm = this.userService.session.userPermissions.computed;
        if (!perm) {
          this.router.navigate(['error'], {
            queryParams: {
              type: 'forbidden',
            },
          });
        } else {
          const rebatePermissions = perm.rebate;
          const { redeemedDetail } = rebatePermissions;
          if (!redeemedDetail) {
            this.router.navigate(['error'], {
              queryParams: {
                type: 'forbidden',
              },
            });
          }
        }
      }
      const p: ParamMap = this.route.snapshot.paramMap;
      const brand = p.get('brandName') || '';
      this.brandName = this.formatBrandName(brand);
      const rebateId = p.get('rebateId') || '';
      this.rebateId = rebateId;

      const rebateSummaryRequest: RebateRedeemedSummaryRequest = {
        searchBy: 'brandName',
        searchTerm: this.brandName
      }
      const summaryResponse = await this.rebateService.getRebateRedeemedSummaryItems(rebateSummaryRequest);
      console.log('rebate summary: ', summaryResponse);
      if (summaryResponse && summaryResponse.result) {
        const brandResult = summaryResponse.result;
        if (brandResult.length) {
          this.getBrandSummaryInfo(brandResult);
          // if (this.years.length) {
          //   await this.getActiveRebate(this.years[0].toString());
          // }
        }
      } else {
        // this._snackBar.open(
        //   `There are no rebate redeemed items from ${this.brandName}`,
        //   'Close',
        //   this.config
        // );
        // this.router.navigate(['/proplus/rebate/landing/v2']);
      }
    } finally {
      this.isLoading = false;
    }
  }

  getBrandSummaryInfo(brandResult: RebateRedeemedSummaryItem[]) {
    const brandIds = brandResult.map(r => r.rebateId || '');
    this.brandRebateIds = brandIds.filter(b => b !== '');
    const currentYear = new Date().getFullYear();
    const rebatesWithDates = brandResult.map(r => {
      const promoYears = this.calculatePromoDates(r.promotionDates || '');
      return {
        ...r,
        startYear: promoYears ? promoYears.startYear : '',
        endYear: promoYears ? (promoYears.endYear > currentYear ? currentYear : promoYears.endYear) : '',
        years: promoYears ?
          this.getYears(promoYears.startYear, promoYears.endYear > currentYear ? currentYear : promoYears.endYear) : []
      }
    });
    console.log('rebates with dates: ', rebatesWithDates);
    const years = rebatesWithDates.map(r => r.years).flat();
    const yearsNoDuplicates = [...new Set(years)].sort((a, b) => b - a);
    console.log('concat: ', yearsNoDuplicates);
    this.years = yearsNoDuplicates;
  }

  formatBrandName(brand: string) {
    if (brand) {
      return brand.replace(/-/g, ' ');
    }
    return brand;
  }

  calculatePromoDates(promotionDates: string) {
    if (promotionDates.indexOf('-') > -1) {
      const dates = promotionDates.split('-');
      var startYear;
      const endYear = new Date(Date.parse(dates[1])).getFullYear();
      if (dates[0].indexOf(',') !== -1) {
        startYear = new Date(Date.parse(dates[0])).getFullYear();
      } else {
        startYear = endYear;
      }

      return {
        startYear: startYear,
        endYear: endYear
      }
    }
    return null;
  }

  getYears(startYear: number, endYear: number) {
    var years = [];
    for (var i = startYear; i <= endYear; i++) {
      years.push(i);
    }
    return years;
  }

  async tabChanged(evt: MatTabChangeEvent) {
    // const activeYear = evt.tab.textLabel;
    this.rebateDetailComponents.forEach(async rd => await rd.clearFilter());
  }

  getRewardsSite() {
    let rewardsSite = '';
    switch (this.brandName) {
      case 'GAF':
        rewardsSite = 'https://ssoext.gaf.com/';
        break;
      case 'CertainTeed': 
        rewardsSite = 'https://login.certainteed.com/';
        break;
      case 'IKO':
        rewardsSite = 'https://www.ikoroofpro.com/';
        break;
      case 'Tamko':
        rewardsSite = 'https://www.tamkoedge.com/s/login/';
        break;
      case 'Owens Corning':
        rewardsSite = 'https://login.owenscorning.com/users/sign_in';
        break;
      case 'Plygem':
        rewardsSite = 'https://rewards.cornerstonebuildingbrands.com/';
        break;
      case 'LP':
        rewardsSite = 'https://www.lpremodelersedge.com/';
        break;
    }
    return rewardsSite;
  }

  unenrollRebate() {
    if (!this.unenrollmentDialog) {
        return;
    }
    const dialogRef = this.dialogComp.open(this.unenrollmentDialog, {
        id: 'unenrollmentDialog',
        width: '663px',
        autoFocus: false,
        panelClass: 'custom-modalbox'
    });
    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (result) {
        // Unenroll the rebate
        const unenrollResponse = await this.rebateService.unenrollRebate(this.rebateId);
        if (unenrollResponse && unenrollResponse.success) {
          this.showSnack(`${this.brandName} rebate unenrolled successfully`, 'close');
          await this.router.navigate(['/proplus/rebate/landing/v2']);
        } else {
          let errorMessage = `${this.brandName} Rebate unenrollment failed`;
          if (unenrollResponse && unenrollResponse.messages && unenrollResponse.messages.length) {
            if (unenrollResponse.messages[0].value) {
              errorMessage = unenrollResponse.messages[0].value;
            }
          }
          this.showSnack(errorMessage, 'close');
        }
      }
    });
  }

  showSnack(
    message: string,
    title: string = 'Close',
    duration: number = 3000
  ) {
    const config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.duration = duration;
    this._snackBar.open(message, title, config);
  }
}

