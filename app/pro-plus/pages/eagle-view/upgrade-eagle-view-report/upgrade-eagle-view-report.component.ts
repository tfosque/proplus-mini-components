import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { EagleViewService } from '../../../services/eagle-view.service';
import {
    EagleViewUpgradeOrderRequest,
    Product,
} from '../../../model/eagle-view-upgrade-order';
import { UserService } from '../../../services/user.service';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { MyErrorStateMatcher } from '../../shopping-cart/MyErrorStateMatcher';

@Component({
    selector: 'app-upgrade-eagle-view-report',
    templateUrl: './upgrade-eagle-view-report.component.html',
    styleUrls: ['./upgrade-eagle-view-report.component.scss'],
})
export class UpgradeEagleViewReportComponent implements OnInit {
    @ViewChild('stepper') stepper!: MatStepper;
    @ViewChild('stepper') stepperMobile!: MatStepper;
    isLinear = true;
    reportId = 0;
    propertyAddress: PropertyAddress = {
        street: '',
        city: '',
        state: '',
        zip: '',
    };
    productPrimaryId = 0;
    productPrimaryIdMobile = 0;
    addOnsFormGroup!: FormGroup;
    deliveryFormGroup!: FormGroup;
    structuresFormGroup!: FormGroup;
    additionalInfoFormGroup!: FormGroup;
    orderReviewFormGroup!: FormGroup;
    addOnsFormGroupMobile!: FormGroup;
    deliveryFormGroupMobile!: FormGroup;
    structuresFormGroupMobile!: FormGroup;
    additionalInfoFormGroupMobile!: FormGroup;
    orderReviewFormGroupMobile!: FormGroup;
    selectedHasAddOnReport = '';
    selectedAddOnReport = '';
    selectedDeliveryOption = '';
    selectedStructures = '';
    structuresInstruction = '';
    claimNumber = '';
    claimInfo = '';
    selectedHasAddOnReportMobile = '';
    selectedAddOnReportMobile = '';
    selectedDeliveryOptionMobile = '';
    selectedStructuresMobile = '';
    structuresInstructionMobile = '';
    claimNumberMobile = '';
    claimInfoMobile = '';
    availableStructures: structure[] = [];
    availableAddOnReports: AddOnReport[] = [];
    deliveryOptionList: Product[] = [];
    orderSubmitted = false;
    orderSubmittedMobile = false;
    availableProductId = 0;
    matcher = new MyErrorStateMatcher();
    structures: structure[] = [
        {
            shortName: 'PrimaryPlus',
            name: 'Primary + Detached Garage',
            id: 1,
        },
        {
            shortName: 'Primary',
            name: 'Primary Structure Only',
            id: 2,
        },
        {
            shortName: 'Parcel',
            name: 'All Structures on Parcel',
            id: 3,
        },
        {
            shortName: 'Commercial',
            name: 'Commercial Complex',
            id: 4,
        },
        {
            shortName: 'Other',
            name: 'Other (please provide instruction)',
            id: 5,
        },
    ];
    deliveryOptions: DeliveryProduct[] = [
        {
            id: 8,
            name: 'Regular',
            description: '48 hours or less',
            toDisplay: true,
            fullName: 'Regular Delivery',
        },
        {
            id: 4,
            name: 'Express',
            description: '',
            toDisplay: true,
            fullName: 'Express Delivery',
        },
        {
            id: 7,
            name: '3 Hour',
            description:
                'The three hour delivery time (during business hours) starts once the structure has been identified',
            toDisplay: true,
            fullName: 'Three Hour Delivery',
        },
        {
            id: 45,
            name: 'Quick',
            description: '',
            toDisplay: false,
            fullName: 'Quick Delivery',
        },
    ];
    addOnReports: AddOnReport[] = [
        {
            name: 'Walls',
            id: 33,
            price: 55,
        },
        {
            name: 'WallsLite',
            id: 54,
            price: 36,
        },
    ];

    get hasAddOnReportControl() {
        return this.addOnsFormGroup.get('hasAddOnReportControl');
    }

    get addOnReportControl() {
        return this.addOnsFormGroup.get('addOnReportControl');
    }

    get deliveryControl() {
        return this.deliveryFormGroup.get('deliveryControl');
    }

    get structuresControl() {
        return this.structuresFormGroup.get('structuresControl');
    }

    get structuresInstructionControl() {
        return this.structuresFormGroup.get('structuresInstructionControl');
    }

    get claimNumberControl() {
        return this.additionalInfoFormGroup.get('claimNumberControl');
    }

    get claimInfoControl() {
        return this.additionalInfoFormGroup.get('claimInfoControl');
    }

    get hasAddOnReportControlMobile() {
        return this.addOnsFormGroupMobile.get('hasAddOnReportControlMobile');
    }

    get addOnReportControlMobile() {
        return this.addOnsFormGroupMobile.get('addOnReportControlMobile');
    }

    get deliveryControlMobile() {
        return this.deliveryFormGroupMobile.get('deliveryControlMobile');
    }

    get structuresControlMobile() {
        return this.structuresFormGroupMobile.get('structuresControlMobile');
    }

    get structuresInstructionControlMobile() {
        return this.structuresFormGroupMobile.get(
            'structuresInstructionControlMobile'
        );
    }

    get claimNumberControlMobile() {
        return this.additionalInfoFormGroupMobile.get(
            'claimNumberControlMobile'
        );
    }

    get claimInfoControlMobile() {
        return this.additionalInfoFormGroupMobile.get('claimInfoControlMobile');
    }

    get emailItems() {
        const emailArray = this.additionalInfoFormGroup.get(
            'emailRecipients'
        ) as FormArray;
        const filtered = emailArray.controls
            .filter((e) => (e.get('emailAddress') as FormControl).value)
            .map((e) => (e.get('emailAddress') as FormControl).value)
            .filter((value, index, self) => self.indexOf(value) === index);
        return filtered.join(', ');
    }

    get emailItemsMobile() {
        const emailArray = this.additionalInfoFormGroupMobile.get(
            'emailRecipientsMobile'
        ) as FormArray;
        const filtered = emailArray.controls
            .filter((e) => (e.get('emailAddressMobile') as FormControl).value)
            .map((e) => (e.get('emailAddressMobile') as FormControl).value)
            .filter((value, index, self) => self.indexOf(value) === index);
        return filtered.join(', ');
    }

    get deliveryMethod() {
        if (this.selectedHasAddOnReport && this.selectedAddOnReport) {
            return this.deliveryOptions.filter(
                (d) => d.name === 'Regular' && d.toDisplay
            );
        }
        return this.deliveryOptions.filter((d) => d.toDisplay);
    }

    get deliveryMethodMobile() {
        if (
            this.selectedHasAddOnReportMobile &&
            this.selectedAddOnReportMobile
        ) {
            return this.deliveryOptions.filter(
                (d) => d.name === 'Regular' && d.toDisplay
            );
        }
        return this.deliveryOptions.filter((d) => d.toDisplay);
    }

    get availableDeliveryOptions() {
        return this.deliveryMethod.filter((d) =>
            this.deliveryOptionList.some((dol) => dol.productID === d.id)
        );
    }

    get availableDeliveryOptionsMobile() {
        return this.deliveryMethodMobile.filter((d) =>
            this.deliveryOptionList.some((dol) => dol.productID === d.id)
        );
    }

    get isAccountClosed() {
        return this.user.isLastSelectedAccountClosed;
    }

    config = new MatSnackBarConfig();
    constructor(
        private readonly route: ActivatedRoute,
        private readonly eagleViewService: EagleViewService,
        private readonly _formBuilder: FormBuilder,
        private readonly user: UserService,
        private readonly userNotifier: UserNotifierService,
        private readonly router: Router,
        private readonly _snackBar: MatSnackBar
    ) {}

    async ngOnInit() {
        this.addOnsFormGroup = this._formBuilder.group({
            hasAddOnReportControl: new FormControl(''),
        });
        this.deliveryFormGroup = this._formBuilder.group({
            deliveryControl: new FormControl('', [Validators.required]),
        });
        this.structuresFormGroup = this._formBuilder.group({
            structuresControl: new FormControl('', [Validators.required]),
            structuresInstructionControl: new FormControl(''),
        });
        this.additionalInfoFormGroup = this._formBuilder.group({
            claimNumberControl: new FormControl(''),
            claimInfoControl: new FormControl(''),
            emailRecipients: this._formBuilder.array([
                this.createEmailFormGroup(),
            ]),
        });
        this.orderReviewFormGroup = this._formBuilder.group({});

        this.addOnsFormGroupMobile = this._formBuilder.group({
            hasAddOnReportControlMobile: new FormControl(''),
        });
        this.deliveryFormGroupMobile = this._formBuilder.group({
            deliveryControlMobile: new FormControl('', [Validators.required]),
        });
        this.structuresFormGroupMobile = this._formBuilder.group({
            structuresControlMobile: new FormControl('', [Validators.required]),
            structuresInstructionControlMobile: new FormControl(''),
        });
        this.additionalInfoFormGroupMobile = this._formBuilder.group({
            claimNumberControlMobile: new FormControl(''),
            claimInfoControlMobile: new FormControl(''),
            emailRecipientsMobile: this._formBuilder.array([
                this.createEmailFormGroupMobile(),
            ]),
        });
        this.orderReviewFormGroupMobile = this._formBuilder.group({});

        const p: ParamMap = this.route.snapshot.paramMap;
        if (!p.get('reportId')) {
            throw new Error('Invalid Eagleview report id');
        }
        const reportIdEV = parseInt(p.get('reportId') || '');
	    const fromPage = p.get('fromPage') || '';
        if (isNaN(reportIdEV)) {
            throw new Error('Invalid Eagleview report id');
        }
        this.reportId = reportIdEV;
        const reportResponse =
            await this.eagleViewService.getEagleViewOrderReport(
                this.reportId.toString()
            );
        if (
            !reportResponse ||
            !reportResponse.result ||
            !reportResponse.success
        ) {
            let errorMessage = 'Error retrieving Eagleview report details';
            if (
                reportResponse &&
                reportResponse.messages &&
                reportResponse.messages[0].type === 'error' &&
                reportResponse.messages[0].value
            ) {
                errorMessage = reportResponse.messages[0].value;
            }
            this._snackBar.open(errorMessage, 'Close', this.config);
            await this.router.navigate([this.navigateTo(fromPage)]);
            return;
        }
        const orderReport = reportResponse.result;
        this.propertyAddress = {
            street: orderReport.Street,
            city: orderReport.City,
            state: orderReport.State,
            zip: orderReport.Zip,
        };
        this.productPrimaryId = orderReport.ProductPrimaryId;
        const upgradeResponse =
            await this.eagleViewService.getEagleViewOrderUpgradeProducts(
                this.reportId.toString()
            );
        if (
            !upgradeResponse ||
            !upgradeResponse.result ||
            !upgradeResponse.success
        ) {
            let errorMessage =
                'Error retrieving Eagleview order upgrade product details';
            if (
                upgradeResponse &&
                upgradeResponse.messages &&
                upgradeResponse.messages[0].type === 'error' &&
                upgradeResponse.messages[0].value
            ) {
                errorMessage = upgradeResponse.messages[0].value;
            }
            this._snackBar.open(errorMessage, 'Close', this.config);
            await this.router.navigate([this.navigateTo(fromPage)]);
            return;
        } else if (!reportResponse.result.EligibleForUpgrade) {
            let errorMessage =
                'This EagleView order is not eligible for upgrade';
            if (
                reportResponse &&
                reportResponse.messages &&
                reportResponse.messages[0].type === 'error' &&
                reportResponse.messages[0].value
            ) {
                errorMessage = reportResponse.messages[0].value;
            }
            this._snackBar.open(errorMessage, 'Close', this.config);
            await this.router.navigate([this.navigateTo(fromPage)]);
            return;
        } else if (upgradeResponse.result.AvailableProducts.length === 0) {
            this._snackBar.open(
                'This EagleView order cannot be upgradeded at this time',
                'Close',
                this.config
            );
            await this.router.navigate([this.navigateTo(fromPage)]);
            return;
        } else {
            const availableProduct =
                upgradeResponse.result.AvailableProducts[0];
            this.availableProductId = availableProduct.productID;
            const addOnReportList = availableProduct.addOnProducts;
            this.deliveryOptionList = availableProduct.deliveryProducts;
            const structureList = availableProduct.measurementInstructionTypes;
            this.availableAddOnReports = this.addOnReports.filter((a) =>
                addOnReportList.some((ao) => ao.productID === a.id)
            );
            this.availableStructures = this.structures.filter((s) =>
                structureList.some((sl) => sl === s.id)
            );
        }
    }

    createEmailFormGroup(): FormGroup {
        return new FormGroup({
            emailAddress: new FormControl('', Validators.email),
        });
    }

    createEmailFormGroupMobile(): FormGroup {
        return new FormGroup({
            emailAddressMobile: new FormControl('', Validators.email),
        });
    }

    addEmailFormGroup() {
        const emails = this.additionalInfoFormGroup.get(
            'emailRecipients'
        ) as FormArray;
        emails.push(this.createEmailFormGroup());
    }

    addEmailFormGroupMobile() {
        const emails = this.additionalInfoFormGroupMobile.get(
            'emailRecipientsMobile'
        ) as FormArray;
        emails.push(this.createEmailFormGroupMobile());
    }

    removeOrClearEmail(i: number) {
        const emails = this.additionalInfoFormGroup.get(
            'emailRecipients'
        ) as FormArray;
        if (emails.length > 1) {
            emails.removeAt(i);
        } else {
            emails.reset();
        }
    }

    removeOrClearEmailMobile(i: number) {
        const emails = this.additionalInfoFormGroupMobile.get(
            'emailRecipientsMobile'
        ) as FormArray;
        if (emails.length > 1) {
            emails.removeAt(i);
        } else {
            emails.reset();
        }
    }

    getEmailItems(acctEmail: string) {
        const emailArray = this.additionalInfoFormGroup.get(
            'emailRecipients'
        ) as FormArray;
        const filtered = emailArray.controls
            .filter((e) => (e.get('emailAddress') as FormControl).value)
            .map((e) => (e.get('emailAddress') as FormControl).value)
            .filter((value, index, self) => self.indexOf(value) === index);
        if (
            acctEmail &&
            !filtered.some(
                (e) => e && e.toLowerCase() === acctEmail.toLowerCase()
            )
        ) {
            filtered.unshift(acctEmail);
        }
        return filtered.join(',');
    }

    getEmailItemsMobile(acctEmail: string) {
        const emailArray = this.additionalInfoFormGroupMobile.get(
            'emailRecipientsMobile'
        ) as FormArray;
        const filtered = emailArray.controls
            .filter((e) => (e.get('emailAddressMobile') as FormControl).value)
            .map((e) => (e.get('emailAddressMobile') as FormControl).value)
            .filter((value, index, self) => self.indexOf(value) === index);
        if (
            acctEmail &&
            !filtered.some(
                (e) => e && e.toLowerCase() === acctEmail.toLowerCase()
            )
        ) {
            filtered.unshift(acctEmail);
        }
        return filtered.join(',');
    }

    getAddOnReports() {
        if (this.selectedHasAddOnReport) {
            return this.selectedAddOnReport;
        }
        return '';
    }

    getAddOnReportsMobile() {
        if (this.selectedHasAddOnReportMobile) {
            return this.selectedAddOnReportMobile;
        }
        return '';
    }

    addOnRptChange(event: MatCheckboxChange) {
        if (event.checked) {
            this.addOnsFormGroup.addControl(
                'addOnReportControl',
                new FormControl('', [Validators.required])
            );
            this.selectedAddOnReport = '';
        } else {
            this.addOnsFormGroup.removeControl('addOnReportControl');
        }
        this.selectedDeliveryOption = '';
    }

    addOnRptChangeMobile(event: MatCheckboxChange) {
        if (event.checked) {
            this.addOnsFormGroupMobile.addControl(
                'addOnReportControlMobile',
                new FormControl('', [Validators.required])
            );
            this.selectedAddOnReportMobile = '';
        } else {
            this.addOnsFormGroupMobile.removeControl(
                'addOnReportControlMobile'
            );
        }
        this.selectedDeliveryOptionMobile = '';
    }

    async orderReport() {
        this.orderSubmitted = true;
        await this.user.getSessionInfo();
        const session = this.user.session;
        let acctEmail = '';
        if (session.sessionInfo && session.sessionInfo.email) {
            acctEmail = session.sessionInfo.email;
        }
        let addOnProductIds: number[] = [];
        if (this.selectedHasAddOnReport) {
            const selectedAddOnRpts = this.addOnReports.filter(
                (r) => r.name === this.selectedAddOnReport
            );
            if (selectedAddOnRpts) {
                addOnProductIds = selectedAddOnRpts.map((a) => a.id);
            }
        }
        const deliveryProd = this.deliveryOptions.filter(
            (d) => d.name === this.selectedDeliveryOption
        );
        const deliveryId = deliveryProd ? deliveryProd.map((d) => d.id)[0] : 8;
        let measureTypeId = 0;
        if (this.selectedStructures) {
            measureTypeId = this.structures
                .filter((s) => s.name === this.selectedStructures)
                .map((s) => s.id)[0];
        }
        const additionalEmails = this.getEmailItems(acctEmail);
        const request: EagleViewUpgradeOrderRequest = {
            ReportId: this.reportId,
            MeasurementRequestTypeId: measureTypeId,
            ProductId: this.availableProductId,
            ProductDeliveryId: deliveryId,
            AddOnProductIds: addOnProductIds,
            AdditionalEmails: additionalEmails,
            ClaimNumber: this.claimNumber,
            ClaimInfo: this.claimInfo,
            UUID: uuid(),
        };
        const response = await this.eagleViewService.placeEagleViewUpgradeOrder(
            request
        );
        // console.log('api response: ', response);
        if (response.success) {
            if (response.result) {
                this.router.navigate(['/proplus/eagle-view/thank-you'], {
                    state: { apiResult: response.result },
                });
            } else {
                this.router.navigate(['/proplus/eagle-view/thank-you']);
            }
        } else {
            if (response.messages) {
                const message = response.messages[0];
                const strMessage = message.value.toLowerCase();
                if (
                    strMessage.includes('order is placed') ||
                    strMessage.includes('eagle view service is not available')
                ) {
                    this.router.navigate(['/proplus/eagle-view/thank-you'], {
                        state: { message: message.value },
                    });
                }
                this.userNotifier.alertError(message.value);
            }
        }
        this.orderSubmitted = false;
    }

    async orderReportMobile() {
        this.orderSubmittedMobile = true;
        await this.user.getSessionInfo();
        const session = this.user.session;
        let acctEmail = '';
        if (session.sessionInfo && session.sessionInfo.email) {
            acctEmail = session.sessionInfo.email;
        }
        let addOnProductIds: number[] = [];
        if (this.selectedHasAddOnReportMobile) {
            const selectedAddOnRpts = this.addOnReports.filter(
                (r) => r.name === this.selectedAddOnReportMobile
            );
            if (selectedAddOnRpts) {
                addOnProductIds = selectedAddOnRpts.map((a) => a.id);
            }
        }
        const deliveryProd = this.deliveryOptions.filter(
            (d) => d.name === this.selectedDeliveryOptionMobile
        );
        const deliveryId = deliveryProd ? deliveryProd.map((d) => d.id)[0] : 8;
        let measureTypeId = 0;
        if (this.selectedStructuresMobile) {
            measureTypeId = this.structures
                .filter((s) => s.name === this.selectedStructuresMobile)
                .map((s) => s.id)[0];
        }
        const additionalEmails = this.getEmailItemsMobile(acctEmail);
        const request: EagleViewUpgradeOrderRequest = {
            ReportId: this.reportId,
            MeasurementRequestTypeId: measureTypeId,
            ProductId: this.availableProductId,
            ProductDeliveryId: deliveryId,
            AddOnProductIds: addOnProductIds,
            AdditionalEmails: additionalEmails,
            ClaimNumber: this.claimNumberMobile,
            ClaimInfo: this.claimInfoMobile,
            UUID: uuid(),
        };
        const response = await this.eagleViewService.placeEagleViewUpgradeOrder(
            request
        );
        // console.log('api response: ', response);
        if (response.success) {
            if (response.result) {
                this.router.navigate(['/proplus/eagle-view/thank-you'], {
                    state: { apiResult: response.result },
                });
            } else {
                this.router.navigate(['/proplus/eagle-view/thank-you']);
            }
        } else {
            if (response.messages) {
                const message = response.messages[0];
                const strMessage = message.value.toLowerCase();
                if (
                    strMessage.includes('order is placed') ||
                    strMessage.includes('eagle view service is not available')
                ) {
                    this.router.navigate(['/proplus/eagle-view/thank-you'], {
                        state: { message: message.value },
                    });
                }
                this.userNotifier.alertError(message.value);
            }
        }
        this.orderSubmittedMobile = false;
    }

    formatSelectedValue(inputString: string) {
        if (inputString) {
            return inputString
                .toLowerCase()
                .replace(' + ', '+')
                .split(' ')
                .join('-');
        }
        return '';
  }
  navigateTo(fromPage: string) {
    if (fromPage === 'OrderDetail') {
      return `/proplus/accounts/${this.user.accountIdInString}/orders`;
    } else {
      return '/proplus/eagle-view/landing';
    }
  }
}

interface PropertyAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
}

interface structure {
    shortName: string;
    name: string;
    id: number;
}

interface DeliveryProduct {
    id: number;
    name: string;
    description: string;
    toDisplay: boolean;
    fullName: string;
}

interface AddOnReport {
    name: string;
    id: number;
    price: number;
}
