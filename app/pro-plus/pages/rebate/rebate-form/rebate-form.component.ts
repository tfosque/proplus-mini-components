import { Component, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import {
    RebateFormVendorDetail,
    RebateFormRow,
    RebateFormField,
} from '../../../model/rebate-form-vendor-detail';
import { RebateService } from '../../../services/rebate.service';
import he from 'he';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    FormGroup,
    Validators,
    ValidatorFn,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SubmitRebateRequest } from '../../../model/submit-rebate';
import { UserService } from '../../../services/user.service';
import { ProplusUrls } from '../../../../enums/proplus-urls.enum';
import { BehaviorSubject } from 'rxjs';
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

type HtmlInputType = 'text' | 'tel' | 'email' | 'password';

interface RebateFormFieldWithKey extends RebateFormField {
    key: string;
    maxLength: number;
    minLength: number;
    invalidMsg: string;
    htmlType: HtmlInputType;
    html: SafeHtml | undefined;
}

type RebateFormRowWithKey = RebateFormFieldWithKey[];

@Component({
    selector: 'app-rebate-form',
    templateUrl: './rebate-form.component.html',
    styleUrls: ['./rebate-form.component.scss'],
})
export class RebateFormComponent implements OnInit {
    rebateId = '';
    textController = new FormControl('', [Validators.required]);
    selectController = new FormControl('', [Validators.required]);
    rebateFormName = '';
    terms = false;
    activeForm = '';
    // public rebateFormResponse: (RebateFormResponse | null) = null;
    public rows: RebateFormRowWithKey[] = [];
    vendorIKO: RebateFormVendorDetail = {
        formName: 'iKO2020Pro4PromotionForm',
        rebateImage: `${ProplusUrls.root}/images/IKO_Rebate_Banner.jpg`,
        rebateFlyer: `${ProplusUrls.root}/Promotions/IKO_Bonus_Rewards.pdf`,
    };
    vendorCT: RebateFormVendorDetail = {
        formName: 'ctContractorCashBackRebateForm',
        rebateImage: `${ProplusUrls.root}/images/NO-LIMITS-BANNER.jpg`,
        rebateFlyer: `${ProplusUrls.root}/Promotions/CertainTeed_Contractor_Cash_Back.pdf`,
    };
    matcher = new MyErrorStateMatcher();
    form!: FormGroup;
    internalUser = true;
    submitRebate = true;
    termsPresent = false;
    rebatePermissions: any = {};
    view = new BehaviorSubject<boolean>(false);

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        private readonly route: ActivatedRoute,
        private readonly rebateService: RebateService,
        private readonly sanitizer: DomSanitizer,
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    async ngOnInit() {
        if (
            this.userService.session &&
            this.userService.session.userPermissions
        ) {
            const perm = this.userService.session.userPermissions.computed;
            if (!perm) {
                this.router.navigate(['error'], {
                    queryParams: {
                        type: 'forbidden',
                    },
                });
                this.view.next(true);
            } else {
                this.rebatePermissions = perm.rebate;
                const { form } = this.rebatePermissions;
                if (!form) {
                    this.router.navigate(['error'], {
                        queryParams: {
                            type: 'forbidden',
                        },
                    });
                    this.view.next(true);
                }
            }
        }
        this.userService.sessionBehavior.subscribe((session) => {
            this.submitRebate = session.permissions.rebate.submit;
        });

        const p: ParamMap = this.route.snapshot.paramMap;
        this.rebateId = p.get('rebateId') || '0';
        const request = {
            rebateId: this.rebateId,
            invokeBy: 'store',
        };
        const rebateFormResponse = await this.rebateService.getRebateForm(
            request
        );
        if (rebateFormResponse) {
            if (rebateFormResponse.result) {
                if (rebateFormResponse.result.rows) {
                    this.rows = this.transformControl(
                        rebateFormResponse.result.rows
                    );
                    this.termsPresent = this.hasTerms(
                        rebateFormResponse.result.rows
                    );
                }
            }
        } else {
            await this.router.navigate(['/proplus/rebate/landing']);
        }
        this.form = this.getformControls(this.rows);
        // if (this.rebateFormResponse && this.rebateFormResponse.result.rows &&
        //   this.rebateFormResponse.result.rows[0].fields) {
        //   this.first = this.rebateFormResponse.result.rows[0].fields[0].value || '';
        // console.log('first: ', this.first);

        // }
        const userInfo = await this.userService.getCurrentUserInfo();
        if (userInfo) {
            this.internalUser = userInfo.internalUser;
        }
    }

    transformControl(rows: RebateFormRow[]): RebateFormRowWithKey[] {
        const newRows = rows.map((r) => {
            if (!r.fields) {
                return [];
            }
            const row = r.fields.map((f) => {
                const field: RebateFormFieldWithKey = {
                    ...f,
                    key:
                        f.type === 'terms'
                            ? 'acceptTerms'
                            : `${f.infoGroup}-${f.name}`,
                    minLength: f.minLength || 0,
                    maxLength: f.maxLength || 500,
                    invalidMsg: f.invalidMsg || `${f.label} is invalid`,
                    htmlType: this.getHtmlType(f),
                    html:
                        f.type === 'htmlBlock' && f.value
                            ? this.convertHTML(f.value)
                            : undefined,
                };
                return field;
            });
            return row;
        });
        return newRows;
    }

    hasTerms(rows: RebateFormRow[]): boolean {
        const rowWithTerms = rows.filter(
            (r) =>
                r.fields &&
                r.fields.filter((field) => field.type && field.type === 'terms')
                    .length > 0
        );
        if (rowWithTerms.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    getHtmlType(f: RebateFormField): HtmlInputType {
        if (f.phone) {
            return 'tel';
        }
        if (f.email) {
            return 'email';
        }
        if (f.type && f.type === 'password') {
            return 'password';
        }
        return 'text';
    }

    getformControls(rows: RebateFormRowWithKey[]): FormGroup {
        const validTypes = new Set(['text', 'select', 'radio', 'terms', 'password']);
        const controls: Record<string, FormControl> = {};
        rows.forEach((r) => {
            if (!r) {
                return;
            }
            r.forEach((f) => {
                if (
                    !validTypes.has(f.type || '') ||
                    (f.type === 'radio' && !f.required)
                ) {
                    return;
                }

                const validators: ValidatorFn[] = [
                    Validators.minLength(f.minLength || 0),
                    Validators.maxLength(
                        f.phone ? 25 : f.zip ? 10 : f.maxLength || 100
                    ),
                    Validators.pattern(
                        f.phone
                            ? /^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/
                            : f.zip
                            ? /^\d{5}(-\d{4})?$/
                            : f.pattern || '.*'
                    ),
                ];

                if (f.required) {
                    validators.push(Validators.required);
                }

                if (f.email) {
                    validators.push(Validators.email);
                }

                controls[f.key] = new FormControl('', validators);
            });
        });
        return new FormGroup(controls);
    }

    isValid(key: string): boolean {
        // console.log('field key: ', key)
        const control = this.form.controls[key];
        if (!control) {
            return true;
        }
        return !(
            !control.valid &&
            control.errors &&
            (control.dirty || control.touched)
        );
        // return !control.errors;
    }

    getErrorMessage(f: RebateFormFieldWithKey) {
        const key = f.key;
        const errors =
            this.form &&
            this.form.controls[key] &&
            this.form.controls[key].errors;
        // return errors;
        if (!errors) {
            return null;
        } else if (errors.required) {
            return `${f.label} required`;
        } else if (errors.minlength) {
            return `${f.label} required minimum length ${f.minLength}`;
        } else if (errors.maxlength) {
            return `${f.label} can't exceed ${
                f.phone ? 25 : f.zip ? 10 : f.maxLength || 100
            } characters`;
        } else {
            return f.invalidMsg;
        }
    }

    getRebateVendor(): string {
        if (
            this.rebateFormName.toUpperCase() ===
            this.vendorIKO.formName.toUpperCase()
        ) {
            return 'IKO';
        } else {
            return 'CT';
        }
    }

    getRebateImage(): string {
        if (this.getRebateVendor() === 'IKO') {
            return this.vendorIKO.rebateImage || '';
        } else {
            return this.vendorCT.rebateImage || '';
        }
    }

    getRebateFlyer(): string {
        if (this.getRebateVendor() === 'IKO') {
            return this.vendorIKO.rebateFlyer || '';
        } else {
            return this.vendorCT.rebateFlyer || '';
        }
    }

    convertCSS(css?: string): string {
        const newCss = (css || '')
            .replace('col-sm', 'small')
            .replace('col-md', 'medium')
            .replace('col-lg', 'large');
        const classes = new Set(newCss.split(/\s+/));
        classes.add('cell');
        const resultCSS = [...classes].join(' ');
        return resultCSS;
    }

    convertLabelClass(required?: boolean) {
        if (required) {
            return 'control-label requiredField';
        } else {
            return '';
        }
    }

    convertHTML(input: string): SafeHtml {
        const output = he.decode(input);
        // console.log('output ', output);
        const fullPath = this.setListStyle(
            this.setFullFilePath(this.setFullImagePath(output))
        );
        return this.sanitizer.bypassSecurityTrustHtml(fullPath);
    }

    setFullImagePath(input: string): string {
        const imagePattern = /(<img.*src=")(\/images\/)/;
        //  TODO:  Figure out alternative
        const fullPath = input.replace(imagePattern, `$1${ProplusUrls.root}$2`);
        return fullPath;
    }

    setFullFilePath(input: string): string {
        const filePattern = /(<a href=")(\/Promotions\/)/;
        const fullPath = input.replace(filePattern, `$1${ProplusUrls.root}$2`);
        return fullPath;
    }

    setListStyle(input: string): string {
        const listPattern = /(<ul style="text-align:center;)(">)/;
        const fullPath = input.replace(
            listPattern,
            '$1' + 'list-style:none;' + '$2'
        );
        return fullPath;
    }

    async submitForm() {
        if (this.form.valid) {
            const submittedData = this.submissionBody;
            const request: SubmitRebateRequest = {
                rebateId: this.rebateId,
                rebateInfo: submittedData['rebateInfo'],
                rebateAddress: submittedData['rebateAddress'] || {},
                rebateCustomInfo: submittedData['rebateCustomInfo'] || {},
            };

            const response = await this.rebateService.submitRebate(request);
            if (response && response.success) {
                this.activeForm = 'successMessage';
                window.scrollTo(0, 0);
            }
        } else {
            Object.keys(this.form.controls).forEach((key) =>
                this.form.controls[key].markAsTouched()
            );
            console.log('form submitted with error');
        }
    }

    changeCheck(e: Event) {
        // add condition for no submitRebate
        if (this.submitRebate === false) {
            return;
        }
        this.terms = this.form.controls['acceptTerms'].value;
    }

    getSubmitBtnClass(): string {
        if ((this.terms || !this.termsPresent) && !this.internalUser) {
            return 'primary';
        } else {
            return 'disabled';
        }
    }

    ///  Creates the object to be submitted to the API
    public get submissionBody() {
        const result: Record<string, any> = {};
        const validControls = new Set(['text', 'select', 'radio', 'password']);
        const validGroups = new Set([
            'rebateInfo',
            'rebateAddress',
            'rebateCustomInfo',
        ]);
        if (this.form && this.form.controls) {
            this.rows.forEach((r) => {
                r.forEach((f) => {
                    const control = this.form.controls[f.key];
                    if (control) {
                        if (f.infoGroup && f.name) {
                            if (
                                validGroups.has(f.infoGroup) &&
                                validControls.has(f.type || '')
                            ) {
                                const hasGroup = !!(
                                    result[f.infoGroup] &&
                                    typeof result[f.infoGroup] === 'object'
                                );
                                if (!hasGroup) {
                                    result[f.infoGroup] = {};
                                }
                                if (
                                    f.infoGroup === 'rebateInfo' &&
                                    f.name === 'phoneNumber'
                                ) {
                                    const phonePattern =
                                        /^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/;
                                    result[f.infoGroup][f.name] =
                                        control.value.replace(
                                            phonePattern,
                                            '$1' + '$2' + '$3'
                                        );
                                } else {
                                    result[f.infoGroup][f.name] = control.value;
                                }
                            }
                        } else if (f.name) {
                            result[f.name] = control.value;
                        }
                    }
                });
            });
        }
        return result;
    }

    getType(type: string) {
        if (type === 'password') return 'text';
        return type;
    }
}
