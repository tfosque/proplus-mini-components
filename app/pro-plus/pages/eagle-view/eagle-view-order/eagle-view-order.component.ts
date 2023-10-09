import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormControl,
    Validators,
    NgForm,
    FormGroupDirective,
    ValidatorFn,
    FormArray,
    AbstractControl,
} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import { states } from './../../../../global-classes/states';
import { State } from '../../shopping-cart/shopping-cart.component';
import { Router } from '@angular/router';
import { EagleViewOrderRequest } from '../../../model/eagle-view-order';
import { EagleViewService } from '../../../services/eagle-view.service';
import { UserService } from '../../../services/user.service';
import { UserNotifierService } from '../../../../common-components/services/user-notifier.service';
import { v4 as uuid } from 'uuid';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched || isSubmitted)
        );
    }
}

@Component({
    selector: 'app-eagle-view-order',
    templateUrl: './eagle-view-order.component.html',
    styleUrls: ['./eagle-view-order.component.scss'],
})
export class EagleViewOrderComponent implements OnInit {
    @ViewChild('stepper') stepper!: MatStepper;
    @ViewChild('stepper') stepperMobile!: MatStepper;
    // @ViewChild('formDirective', {static:true}) private readonly ngFormReportType!: NgForm;
    isLinear = true;
    addressFormGroup!: FormGroup;
    propertyTypeFormGroup!: FormGroup;
    reportTypeFormGroup!: FormGroup;
    deliveryFormGroup!: FormGroup;
    structuresFormGroup!: FormGroup;
    additionalInfoFormGroup!: FormGroup;
    orderReviewFormGroup!: FormGroup;
    addressFormGroupMobile!: FormGroup;
    propertyTypeFormGroupMobile!: FormGroup;
    reportTypeFormGroupMobile!: FormGroup;
    deliveryFormGroupMobile!: FormGroup;
    structuresFormGroupMobile!: FormGroup;
    additionalInfoFormGroupMobile!: FormGroup;
    orderReviewFormGroupMobile!: FormGroup;
    addressData: LocationAddress = {
        street: '',
        city: '',
        state: '',
        zip: '',
    };
    addressDataMobile: LocationAddress = {
        street: '',
        city: '',
        state: '',
        zip: '',
    };
    selectedPropertyType = '';
    selectedReportType = '';
    selectedHasAddOnReport = '';
    selectedAddOnReport = '';
    selectedDeliveryOption = '';
    selectedStructures = '';
    structuresInstruction = '';
    claimNumber = '';
    claimInfo = '';
    projectName = '';
    buildingID = '';
    selectedPropertyTypeMobile = '';
    selectedReportTypeMobile = '';
    selectedHasAddOnReportMobile = '';
    selectedAddOnReportMobile = '';
    selectedDeliveryOptionMobile = '';
    selectedStructuresMobile = '';
    structuresInstructionMobile = '';
    claimNumberMobile = '';
    claimInfoMobile = '';
    projectNameMobile = '';
    buildingIDMobile = '';
    propertyTypes: NameDescription[] = [
        {
            name: 'Residential',
            description:
                'Standard Home, Single-family Residence, Single Condo or Townhouse',
        },
        {
            name: 'Commercial',
            description: 'Storefront, Warehouse, Industrial or Office Building',
        },
        {
            name: 'Multi-Family',
            description: 'Apartment or Condominium Complex',
        },
    ];
    reportTypes: ReportType[] = [
        {
            name: 'Premium',
            features: [
                '3D diagram of the roof',
                '5 aerial images of the structure',
                'All critical measurements',
                'Waste calculation table',
            ],
        },
        {
            name: 'Quick Squares',
            features: [
                'Single page',
                'Less than one hour to receive',
                'Top down image of the roof',
                'Outline drawing of the roof',
                'Estimated number of squares',
                'Predominate pitch provided',
                'Upgradable to a premium report',
            ],
        },
    ];
    addOnReports: AddOnReport[] = [
        // {
        //   name: "EagleViewXML",
        //   selected: false,
        //   formControl: new FormControl(""),
        //   id: 19
        // },
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
        // ,
        // {
        //   name: "Solar",
        //   selected: false,
        //   formControl: new FormControl(""),
        //   id: 0
        // },
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
    structures: structure[] = [
        {
            id: 2,
            shortName: 'Primary',
            name: 'Primary Structure Only',
        },
        {
            id: 1,
            shortName: 'PrimaryPlus',
            name: 'Primary + Detached Garage',
        },
        {
            id: 3,
            shortName: 'Parcel',
            name: 'All Structures on Parcel',
        },
    ];
    orderSubmitted = false;
    orderSubmittedMobile = false;

    matcher = new MyErrorStateMatcher();
    states: State[] = states;
    // addOnReportFormArray = new FormArray(this.addOnReports.map(a => a.formControl), {validators: this.atLeastOneCheckboxCheckedValidator()});
    // addOnReportFormArrayMobile = new FormArray(this.addOnReportsMobile.map(a => a.formControl), {validators: this.atLeastOneCheckboxCheckedValidator()});

    get reportPrice() {
        if (this.selectedPropertyType === 'Residential') {
            if (this.selectedReportType === 'Premium') {
                if (this.selectedHasAddOnReport && this.selectedAddOnReport) {
                    const selectedAddOnRpt = this.addOnReports.find(
                        (a) => a.name === this.selectedAddOnReport
                    );
                    if (selectedAddOnRpt) {
                        const addOnRptPrice = selectedAddOnRpt.price;
                        const smallPrice = 20 + addOnRptPrice;
                        const largePrice = 60 + addOnRptPrice;
                        return '$' + smallPrice + '-' + largePrice;
                    }
                }
                return '$20-60';
            } else if (this.selectedReportType === 'Quick Squares') {
                return '$18';
            }
        } else if (this.selectedPropertyType === 'Commercial') {
            return '$75';
        } else if (this.selectedPropertyType == 'Multi-Family') {
            return '$36';
        }
        return '';
    }

    get reportPriceMobile() {
        if (this.selectedPropertyTypeMobile === 'Residential') {
            if (this.selectedReportTypeMobile === 'Premium') {
                if (
                    this.selectedHasAddOnReportMobile &&
                    this.selectedAddOnReportMobile
                ) {
                    const selectedAddOnRpt = this.addOnReports.find(
                        (a) => a.name === this.selectedAddOnReportMobile
                    );
                    if (selectedAddOnRpt) {
                        const addOnRptPrice = selectedAddOnRpt.price;
                        const smallPrice = 20 + addOnRptPrice;
                        const largePrice = 60 + addOnRptPrice;
                        return '$' + smallPrice + '-' + largePrice;
                    }
                }
                return '$20-60';
            } else if (this.selectedReportTypeMobile === 'Quick Squares') {
                return '$18';
            }
        } else if (this.selectedPropertyTypeMobile === 'Commercial') {
            return '$75';
        } else if (this.selectedPropertyTypeMobile == 'Multi-Family') {
            return '$36';
        }
        return '';
    }

    get streetControl() {
        return this.addressFormGroup.get('streetControl');
    }

    get cityControl() {
        return this.addressFormGroup.get('cityControl');
    }

    get stateControl() {
        return this.addressFormGroup.get('stateControl');
    }

    get zipControl() {
        return this.addressFormGroup.get('zipControl');
    }

    get propertyTypeControl() {
        return this.propertyTypeFormGroup.get('propertyTypeControl');
    }

    get reportTypeControl() {
        return this.reportTypeFormGroup.get('reportTypeControl');
    }

    get hasAddOnReportControl() {
        return this.reportTypeFormGroup.get('hasAddOnReportControl');
    }

    get addOnReportControl() {
        return this.reportTypeFormGroup.get('addOnReportControl');
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

    get projectNameControl() {
        return this.additionalInfoFormGroup.get('projectNameControl');
    }

    get buildingIDControl() {
        return this.additionalInfoFormGroup.get('buildingIDControl');
    }

    get emailItems() {
        const emailArray = this.additionalInfoFormGroup.get(
            'emailRecipients'
        ) as FormArray;
        const filtered = emailArray.controls
            .filter((e:any) => (e.get('emailAddress') as FormControl).value)
            .map((e:any) => (e.get('emailAddress') as FormControl).value)
            .filter((value:any, index: any, self: any) => self.indexOf(value) === index);
        return filtered.join(', ');
    }

    get streetControlMobile() {
        return this.addressFormGroupMobile.get('streetControlMobile');
    }

    get cityControlMobile() {
        return this.addressFormGroupMobile.get('cityControlMobile');
    }

    get stateControlMobile() {
        return this.addressFormGroupMobile.get('stateControlMobile');
    }

    get zipControlMobile() {
        return this.addressFormGroupMobile.get('zipControlMobile');
    }

    get propertyTypeControlMobile() {
        return this.propertyTypeFormGroupMobile.get(
            'propertyTypeControlMobile'
        );
    }

    get reportTypeControlMobile() {
        return this.reportTypeFormGroupMobile.get('reportTypeControlMobile');
    }

    get hasAddOnReportControlMobile() {
        return this.reportTypeFormGroupMobile.get(
            'hasAddOnReportControlMobile'
        );
    }

    get addOnReportControlMobile() {
        return this.reportTypeFormGroupMobile.get('addOnReportControlMobile');
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

    get projectNameControlMobile() {
        return this.additionalInfoFormGroupMobile.get(
            'projectNameControlMobile'
        );
    }

    get buildingIDControlMobile() {
        return this.additionalInfoFormGroupMobile.get(
            'buildingIDControlMobile'
        );
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
        if (
            this.selectedReportType === 'Premium' &&
            (this.selectedPropertyType === 'Commercial' ||
                (this.selectedHasAddOnReport && this.selectedAddOnReport))
        ) {
            return this.deliveryOptions.filter(
                (d) => d.name === 'Regular' && d.toDisplay
            );
        }
        return this.deliveryOptions.filter((d) => d.toDisplay);
    }

    get deliveryMethodMobile() {
        if (
            this.selectedReportTypeMobile === 'Premium' &&
            (this.selectedPropertyTypeMobile === 'Commercial' ||
                (this.selectedHasAddOnReportMobile &&
                    this.selectedAddOnReportMobile))
        ) {
            return this.deliveryOptions.filter(
                (d) => d.name === 'Regular' && d.toDisplay
            );
        }
        return this.deliveryOptions.filter((d) => d.toDisplay);
    }

    get isAccountClosed() {
        return this.user.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly _formBuilder: FormBuilder,
        private readonly router: Router,
        private readonly eagleViewService: EagleViewService,
        private readonly user: UserService,
        private readonly userNotifier: UserNotifierService
    ) {}

    ngOnInit() {
        this.addressFormGroup = this._formBuilder.group({
            streetControl: new FormControl('', [Validators.required]),
            cityControl: new FormControl('', [Validators.required]),
            stateControl: new FormControl('', [Validators.required]),
            zipControl: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{5}$|^\d{5}-\d{4}$/),
            ]),
        });
        this.propertyTypeFormGroup = this._formBuilder.group({
            propertyTypeControl: new FormControl('', [Validators.required]),
        });
        this.reportTypeFormGroup = this._formBuilder.group({
            reportTypeControl: new FormControl('', [Validators.required]),
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
            projectNameControl: new FormControl(''),
            buildingIDControl: new FormControl(''),
        });
        this.orderReviewFormGroup = this._formBuilder.group({});

        this.addressFormGroupMobile = this._formBuilder.group({
            streetControlMobile: new FormControl('', [Validators.required]),
            cityControlMobile: new FormControl('', [Validators.required]),
            stateControlMobile: new FormControl('', [Validators.required]),
            zipControlMobile: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{5}$|^\d{5}-\d{4}$/),
            ]),
        });
        this.propertyTypeFormGroupMobile = this._formBuilder.group({
            propertyTypeControlMobile: new FormControl('', [
                Validators.required,
            ]),
        });
        this.reportTypeFormGroupMobile = this._formBuilder.group({
            reportTypeControlMobile: new FormControl('', [Validators.required]),
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
            projectNameControlMobile: new FormControl(''),
            buildingIDControlMobile: new FormControl(''),
        });
        this.orderReviewFormGroupMobile = this._formBuilder.group({});
    }

    propertyTypeChange(event: MatRadioChange) {
        this.selectedReportType = '';
        this.selectedStructures = '';
        this.selectedAddOnReport = '';
        this.selectedDeliveryOption = '';
    }

    propertyTypeChangeMobile(event: MatRadioChange) {
        this.selectedReportTypeMobile = '';
        this.selectedStructuresMobile = '';
        this.selectedAddOnReportMobile = '';
        this.selectedDeliveryOptionMobile = '';
    }

    reportTypeChange(event: MatRadioChange) {
        // console.log(event.source.name, event.value);
        if (
            event.value === 'Premium' &&
            this.selectedPropertyType === 'Residential'
        ) {
            this.reportTypeFormGroup.addControl(
                'hasAddOnReportControl',
                new FormControl('')
            );
            this.reportTypeFormGroup.controls['hasAddOnReportControl'].reset();
            this.selectedHasAddOnReport = '';
        } else {
            if (this.reportTypeFormGroup.controls['hasAddOnReportControl']) {
                this.reportTypeFormGroup.removeControl('hasAddOnReportControl');
            }
        }
        this.selectedStructures = '';
        this.selectedAddOnReport = '';
        this.selectedDeliveryOption = '';
    }

    reportTypeChangeMobile(event: MatRadioChange) {
        // console.log(event.source.name, event.value);
        if (
            event.value === 'Premium' &&
            this.selectedPropertyTypeMobile === 'Residential'
        ) {
            this.reportTypeFormGroupMobile.addControl(
                'hasAddOnReportControlMobile',
                new FormControl('')
            );
            this.reportTypeFormGroupMobile.controls[
                'hasAddOnReportControlMobile'
            ].reset();
            this.selectedHasAddOnReportMobile = '';
        } else {
            if (
                this.reportTypeFormGroupMobile.controls[
                    'hasAddOnReportControlMobile'
                ]
            ) {
                this.reportTypeFormGroupMobile.removeControl(
                    'hasAddOnReportControlMobile'
                );
            }
        }
        this.selectedStructuresMobile = '';
        this.selectedAddOnReportMobile = '';
        this.selectedDeliveryOptionMobile = '';
    }

    addOnRptChange(event: MatCheckboxChange) {
        if (event.checked) {
            this.reportTypeFormGroup.addControl(
                'addOnReportControl',
                new FormControl('', [Validators.required])
            );
            this.selectedAddOnReport = '';
        } else {
            this.reportTypeFormGroup.removeControl('addOnReportControl');
        }
        this.selectedDeliveryOption = '';
    }

    addOnRptChangeMobile(event: MatCheckboxChange) {
        if (event.checked) {
            this.reportTypeFormGroupMobile.addControl(
                'addOnReportControlMobile',
                new FormControl('', [Validators.required])
            );
            this.selectedAddOnReportMobile = '';
        } else {
            this.reportTypeFormGroupMobile.removeControl(
                'addOnReportControlMobile'
            );
        }
        this.selectedDeliveryOptionMobile = '';
    }

    atLeastOneCheckboxCheckedValidator(minRequired = 1): ValidatorFn {
        return (
            abstractControl: AbstractControl
        ): { [key: string]: any } | null => {
            let checked = 0;
            let formArray = <FormArray>abstractControl;
            formArray.controls.forEach((control) => {
                if (control.value === true) {
                    checked++;
                }
            });
            if (checked < minRequired) {
                return {
                    requireCheckboxToBeChecked: true,
                };
            }
            return null;
        };
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

    getAddOnReports() {
        if (this.selectedReportType === 'Premium') {
            if (this.selectedHasAddOnReport) {
                return this.selectedAddOnReport;
            }
        }
        return '';
    }

    getAddOnReportsMobile() {
        if (this.selectedReportTypeMobile === 'Premium') {
            if (this.selectedHasAddOnReportMobile) {
                return this.selectedAddOnReportMobile;
            }
        }
        return '';
    }

    getReportPriceByTwoTypes(propertyType: string, reportType: string) {
        if (propertyType === 'Residential') {
            if (reportType === 'Premium') {
                return '$20-60';
            } else if (reportType === 'Quick Squares') {
                return '$18';
            }
        } else if (propertyType === 'Commercial') {
            return '$75';
        } else if (propertyType === 'Multi-Family') {
            return '$36';
        }
        return '';
    }

    getReportTypes() {
        if (this.selectedPropertyType === 'Commercial') {
            return this.reportTypes.filter((rt) => rt.name === 'Premium');
        } else if (this.selectedPropertyType === 'Multi-Family') {
            return this.reportTypes.filter((rt) => rt.name === 'Quick Squares');
        } else {
            return this.reportTypes;
        }
    }

    getReportTypesMobile() {
        if (this.selectedPropertyTypeMobile === 'Commercial') {
            return this.reportTypes.filter((rt) => rt.name === 'Premium');
        } else if (this.selectedPropertyTypeMobile === 'Multi-Family') {
            return this.reportTypes.filter((rt) => rt.name === 'Quick Squares');
        } else {
            return this.reportTypes;
        }
    }

    getStructures() {
        if (
            this.selectedPropertyType === 'Commercial' ||
            this.selectedPropertyType === 'Multi-Family'
        ) {
            return this.structures.filter((s) => s.shortName === 'Primary');
        } else if (
            this.selectedPropertyType === 'Residential' &&
            this.selectedReportType === 'Quick Squares'
        ) {
            return this.structures.filter(
                (s) =>
                    s.shortName === 'Primary' || s.shortName === 'PrimaryPlus'
            );
        }
        return this.structures;
    }

    getStructuresMobile() {
        if (
            this.selectedPropertyTypeMobile === 'Commercial' ||
            this.selectedPropertyTypeMobile === 'Multi-Family'
        ) {
            return this.structures.filter((s) => s.shortName === 'Primary');
        } else if (
            this.selectedPropertyTypeMobile === 'Residential' &&
            this.selectedReportTypeMobile === 'Quick Squares'
        ) {
            return this.structures.filter(
                (s) =>
                    s.shortName === 'Primary' || s.shortName === 'PrimaryPlus'
            );
        }
        return this.structures;
    }

    async orderReport() {
        this.orderSubmitted = true;
        await this.user.getSessionInfo();
        const session = this.user.session;
        const accountId = session.accountId ? session.accountId.toString() : '';
        let acctEmail = '';
        if (session.sessionInfo && session.sessionInfo.email) {
            acctEmail = session.sessionInfo.email;
        }
        const primaryProductId = this.getPrimaryProductId(
            this.selectedPropertyType,
            this.selectedReportType
        );
        const deliveryProductId = this.getDeliveryProductId(
            this.selectedReportType === 'Quick Squares',
            this.selectedPropertyType === 'Commercial',
            this.selectedDeliveryOption
        );
        const deliveryProd = this.deliveryOptions.filter(
            (d) => d.id === deliveryProductId
        );
        const deliveryType = deliveryProd
            ? deliveryProd.map((d) => d.fullName)[0]
            : '';
        let addOnProductIds: number[] = [];
        const MeasurementInstructionType = this.getMeasurementInstructionType(
            this.selectedPropertyType,
            this.selectedReportType,
            this.selectedStructures
        );
        const MeasurementRequestType = this.structures.filter(
            (s) => s.id === MeasurementInstructionType
        );
        const MeasurementType = MeasurementRequestType
            ? MeasurementRequestType.map((s) => s.name)[0]
            : '';
        // Only Premium Residential property has add-on reports
        if (
            this.selectedPropertyType === 'Residential' &&
            this.selectedReportType === 'Premium' &&
            this.selectedHasAddOnReport
        ) {
            const selectedAddOnRpts = this.addOnReports.filter(
                (r) => r.name === this.selectedAddOnReport
            );
            if (selectedAddOnRpts) {
                addOnProductIds = selectedAddOnRpts.map((a) => a.id);
            }
        }
        let addOnProductNames = '';
        if (addOnProductIds.length > 0) {
            const addOnProducts = this.addOnReports.filter(
                (a) => a.id === addOnProductIds[0]
            );
            addOnProductNames =
                addOnProducts.length > 0
                    ? addOnProducts.map((a) => a.name)[0]
                    : '';
        }
        let price = 0;
        if (
            this.selectedPropertyType !== 'Residential' ||
            this.selectedReportType !== 'Premium'
        ) {
            if (this.reportPrice && this.reportPrice.indexOf('$') === 0) {
                price = parseInt(this.reportPrice.substring(1));
            }
        }
        let reportAttributes = [];
        const ccEmails = this.getEmailItems(acctEmail);
        if (ccEmails) {
            reportAttributes.push({
                Attribute: 24,
                Value: ccEmails,
            });
        }
        const request: EagleViewOrderRequest = {
            OrderReports: [
                {
                    ReportAddresses: [
                        {
                            Address: this.addressData.street,
                            City: this.addressData.city,
                            State: this.addressData.state,
                            Zip: this.addressData.zip,
                            AddressType: 1,
                        },
                    ],
                    BuildingId: this.buildingID,
                    PrimaryProductId: primaryProductId,
                    DeliveryProductId: deliveryProductId,
                    AddOnProductIds: addOnProductIds,
                    MeasurementInstructionType: MeasurementInstructionType,
                    ReportAttibutes: reportAttributes,
                    ClaimNumber: this.claimNumber,
                    ClaimInfo: this.claimInfo,
                    BatchId: '',
                    CatId: '',
                    ChangesInLast4Years: false,
                    PONumber: '',
                    Comments: this.structuresInstruction,
                    ReferenceId: '',
                    InsuredName: '',
                    UpgradeFromReportId: 0,
                    PolicyNumber: '',
                    DateOfLoss: '',
                    propertyType: this.selectedPropertyType,
                    reportType: this.selectedReportType,
                    deliveryType: deliveryType,
                    addOns: addOnProductNames,
                    structures: MeasurementType,
                },
            ],
            PromoCode: '',
            placeOrderUser: 'eagleview@becn.com',
            accountId: accountId,
            email: acctEmail,
            projectName: this.projectName,
            beaconPrice: price,
            UUID: uuid(),
        };

        const response = await this.eagleViewService.placeEagleViewOrder(
            request
        );
        if (response.success) {
            if (response.result) {
                console.log('responseResult, ', response.result);
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
            this.orderSubmitted = false;
        }
    }

    getPrimaryProductId(propertyType: string, reportType: string) {
        if (propertyType === 'Commercial' && reportType === 'Premium') {
            return 32;
        } else if (
            propertyType === 'Multi-Family' &&
            reportType === 'Quick Squares'
        ) {
            return 55;
        } else if (propertyType === 'Residential' && reportType === 'Premium') {
            return 31;
        } else if (
            propertyType === 'Residential' &&
            reportType === 'Quick Squares'
        ) {
            return 44;
        }
        return 0;
    }

    getDeliveryProductId(
        isQuickSqures: boolean,
        isCommercial: boolean,
        deliveryOption?: string
    ) {
        if (isQuickSqures) {
            return 45;
        } else if (isCommercial) {
            return 8;
        } else {
            if (deliveryOption === 'Regular') {
                return 8;
            } else if (deliveryOption === 'Express') {
                return 4;
            } else {
                return 7;
            }
        }
    }

    getMeasurementInstructionType(
        propertyType: string,
        reportType: string,
        selectedStructures: string
    ) {
        if (
            (propertyType === 'Commercial' && reportType === 'Premium') ||
            (propertyType === 'Multi-Family' && reportType === 'Quick Squares')
        ) {
            if (selectedStructures === 'Primary Structure Only') {
                return 2;
            }
        } else if (propertyType === 'Residential') {
            if (selectedStructures === 'Primary Structure Only') {
                return 2;
            } else if (selectedStructures === 'Primary + Detached Garage') {
                return 1;
            } else if (
                reportType === 'Premium' &&
                selectedStructures === 'All Structures on Parcel'
            ) {
                return 3;
            }
        }
        return 0;
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
        return filtered.join(';');
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
        return filtered.join(';');
    }

    async orderReportMobile() {
        this.orderSubmittedMobile = true;
        await this.user.getSessionInfo();
        const session = this.user.session;
        const accountId = session.accountId ? session.accountId.toString() : '';
        let acctEmail = '';
        if (session.sessionInfo && session.sessionInfo.email) {
            acctEmail = session.sessionInfo.email;
        }
        const primaryProductId = this.getPrimaryProductId(
            this.selectedPropertyTypeMobile,
            this.selectedReportTypeMobile
        );
        const deliveryProductId = this.getDeliveryProductId(
            this.selectedReportTypeMobile === 'Quick Squares',
            this.selectedPropertyTypeMobile === 'Commercial',
            this.selectedDeliveryOptionMobile
        );
        const deliveryProd = this.deliveryOptions.filter(
            (d) => d.id === deliveryProductId
        );
        const deliveryType = deliveryProd
            ? deliveryProd.map((d) => d.fullName)[0]
            : '';
        let addOnProductIds: number[] = [];
        const MeasurementInstructionType = this.getMeasurementInstructionType(
            this.selectedPropertyTypeMobile,
            this.selectedReportTypeMobile,
            this.selectedStructuresMobile
        );
        const MeasurementRequestType = this.structures.filter(
            (s) => s.id === MeasurementInstructionType
        );
        const MeasurementType = MeasurementRequestType
            ? MeasurementRequestType.map((s) => s.name)[0]
            : '';
        // Only Premium Residential property has add-on reports
        if (
            this.selectedPropertyTypeMobile === 'Residential' &&
            this.selectedReportTypeMobile === 'Premium' &&
            this.selectedHasAddOnReportMobile
        ) {
            const selectedAddOnRpts = this.addOnReports.filter(
                (r) => r.name === this.selectedAddOnReportMobile
            );
            if (selectedAddOnRpts) {
                addOnProductIds = selectedAddOnRpts.map((a) => a.id);
            }
        }
        let addOnProductNames = '';
        if (addOnProductIds.length > 0) {
            const addOnProducts = this.addOnReports.filter(
                (a) => a.id === addOnProductIds[0]
            );
            addOnProductNames =
                addOnProducts.length > 0
                    ? addOnProducts.map((a) => a.name)[0]
                    : '';
        }
        let price = 0;
        if (
            this.selectedPropertyTypeMobile !== 'Residential' ||
            this.selectedReportTypeMobile !== 'Premium'
        ) {
            if (
                this.reportPriceMobile &&
                this.reportPriceMobile.indexOf('$') === 0
            ) {
                price = parseInt(this.reportPriceMobile.substring(1));
            }
        }
        let reportAttributes = [];
        const ccEmails = this.getEmailItemsMobile(acctEmail);
        if (ccEmails) {
            reportAttributes.push({
                Attribute: 24,
                Value: ccEmails,
            });
        }
        const request: EagleViewOrderRequest = {
            OrderReports: [
                {
                    ReportAddresses: [
                        {
                            Address: this.addressDataMobile.street,
                            City: this.addressDataMobile.city,
                            State: this.addressDataMobile.state,
                            Zip: this.addressDataMobile.zip,
                            AddressType: 1,
                        },
                    ],
                    BuildingId: this.buildingIDMobile,
                    PrimaryProductId: primaryProductId,
                    DeliveryProductId: deliveryProductId,
                    AddOnProductIds: addOnProductIds,
                    MeasurementInstructionType: MeasurementInstructionType,
                    ReportAttibutes: reportAttributes,
                    ClaimNumber: this.claimNumberMobile,
                    ClaimInfo: this.claimInfoMobile,
                    BatchId: '',
                    CatId: '',
                    ChangesInLast4Years: false,
                    PONumber: '',
                    Comments: this.structuresInstructionMobile,
                    ReferenceId: '',
                    InsuredName: '',
                    UpgradeFromReportId: 0,
                    PolicyNumber: '',
                    DateOfLoss: '',
                    propertyType: this.selectedPropertyTypeMobile,
                    reportType: this.selectedReportTypeMobile,
                    deliveryType: deliveryType,
                    addOns: addOnProductNames,
                    structures: MeasurementType,
                },
            ],
            PromoCode: '',
            placeOrderUser: 'eagleview@becn.com',
            accountId: accountId,
            email: acctEmail,
            projectName: this.projectNameMobile,
            beaconPrice: price,
            UUID: uuid(),
        };

        const response = await this.eagleViewService.placeEagleViewOrder(
            request
        );
        if (response.success) {
            if (response.result) {
                console.log('responseResult, ', response.result);
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
            this.orderSubmittedMobile = false;
        }
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
}

export interface LocationAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface NameDescription {
    name: string;
    description: string;
}

export interface DeliveryProduct {
    id: number;
    name: string;
    description: string;
    toDisplay: boolean;
    fullName: string;
}

export interface ReportType {
    name: string;
    features: string[];
}

export interface AddOnReport {
    name: string;
    id: number;
    price: number;
}

export interface structure {
    id: number;
    shortName: string;
    name: string;
}
