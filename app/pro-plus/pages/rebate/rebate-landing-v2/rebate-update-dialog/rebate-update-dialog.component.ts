import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SubmittedRebateFormContent, SubmittedRebateFormField, SubmittedRebateFormRow } from '../../../../model/rebate-submitted-form';
import he from 'he';
import { ProplusUrls } from '../../../../../enums/proplus-urls.enum';
import { UserService } from '../../../../services/user.service';
import { UpdateRebateFormRequest, UpdateRebateFormResponse } from '../../../../model/update-rebate-form';
import { RebateService } from '../../../../services/rebate.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

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

interface RebateFormFieldWithKey extends SubmittedRebateFormField {
  key: string;
  maxLength: number;
  minLength: number;
  invalidMsg: string;
  htmlType: HtmlInputType;
  html: SafeHtml | undefined;
}

type RebateFormRowWithKey = RebateFormFieldWithKey[];

@Component({
  selector: 'app-rebate-update-dialog',
  templateUrl: './rebate-update-dialog.component.html',
  styleUrls: ['./rebate-update-dialog.component.scss']
})
export class RebateUpdateDialogComponent implements OnInit {
  activeForm = '';
  ableSubmit = false;
  rebateInfoId = '';
  public rows: RebateFormRowWithKey[] = [];
  form!: FormGroup;
  selectController = new FormControl('', [Validators.required]);
  textController = new FormControl('', [Validators.required]);
  internalUser = true;
  updateResponse: UpdateRebateFormResponse | null = null;

  get isAccountClosed() {
    return this.userService.isLastSelectedAccountClosed;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { rebateForm: SubmittedRebateFormContent, rebateInfoId: string },
    private readonly sanitizer: DomSanitizer,
    private readonly userService: UserService,
    private readonly rebateService: RebateService,
    private readonly _snackBar: MatSnackBar,
    public readonly dialogRef: MatDialogRef<RebateUpdateDialogComponent>,
  ) { }

  async ngOnInit() {
    console.log('update form data: ', this.data.rebateForm);
    if (this.data.rebateForm) {
      const rebateForm = this.data.rebateForm;
      this.ableSubmit = rebateForm.ableSubmit || false;
      this.rebateInfoId = this.data.rebateInfoId;
      if (rebateForm.rows) {
        this.rows = this.transformControl(
          this.rearrangeRows(
            rebateForm.rows
          )
        );
        console.log('rows: ', this.rows);
      }
    }
    this.form = this.getformControls(this.rows);
    console.log('form: ', this.form);
    const userInfo = await this.userService.getCurrentUserInfo();
    if (userInfo) {
      this.internalUser = userInfo.internalUser;
    }
  }

  findRow(rows: SubmittedRebateFormRow[], rowName: string) {
    const targetRows = rows.filter(r =>
      r.fields?.some(f =>
        f.name === rowName));
    if (targetRows && targetRows.length) {
      const targetRow = targetRows[0];
      return targetRow;
    }
    return null;
  }

  rearrangeRows(rows: SubmittedRebateFormRow[]) {
    let newRows = rows
      .filter(e => e.fields && !e.fields.some(fd => fd.type === 'htmlBlock' || fd.type === 'radio'));
    let returnedRows = [];

    const contractorIdRows = newRows.filter(r =>
      r.fields?.some(f =>
        (f.infoGroup === 'rebateCustomInfo' && f.name && f.name.indexOf('Id') > -1)));
    if (contractorIdRows && contractorIdRows.length) {
      const contractorIdRow = contractorIdRows[0];
      returnedRows.push(contractorIdRow);
    }

    const GAFAccountRows = newRows.filter(r =>
      r.fields?.some(f =>
        (f.infoGroup === 'rebateInfo' && f.name && f.name === 'GAFAccount')));
    if (GAFAccountRows && GAFAccountRows.length) {
      let GAFAccountRow = GAFAccountRows[0];
      GAFAccountRow.fields?.map(f => {
        let newField = f;
        newField.css = 'col-md-12';
        const newRow: SubmittedRebateFormRow = {
          fields: [newField]
        };
        return newRow
      });
      returnedRows.push(GAFAccountRow);
    }

    const contactNameRow = this.findRow(newRows, 'contactName');
    if (contactNameRow) returnedRows.push(contactNameRow);

    const companyNameRow = this.findRow(newRows, 'companyName');
    if (companyNameRow) returnedRows.push(companyNameRow);

    const phoneEmailRow = this.findRow(newRows, 'phoneNumber');
    if (phoneEmailRow) {
      phoneEmailRow.fields?.map(f => {
        let newField = f;
        newField.css = 'col-md-12';
        const newRow: SubmittedRebateFormRow = {
          fields: [newField]
        };
        returnedRows.push(newRow);
      });
    }

    const addressRow = this.findRow(newRows, 'address');
    if (addressRow) returnedRows.push(addressRow);

    const cityStateZipRow = this.findRow(newRows, 'city');
    if (cityStateZipRow) returnedRows.push(cityStateZipRow);

    const countyRow = this.findRow(newRows, 'county');
    if (countyRow) returnedRows.push(countyRow);

    const submitButtonRows = newRows.filter(r =>
      r.fields?.some(f =>
        f.type === 'button')
    );
    if (submitButtonRows && submitButtonRows.length) {
      const submitButtonRow = submitButtonRows[0];
      returnedRows.push(submitButtonRow);
    }

    return returnedRows;
  }

  transformControl(rows: SubmittedRebateFormRow[]): RebateFormRowWithKey[] {

    const newRows = rows
      .map((r) => {
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

  getHtmlType(f: SubmittedRebateFormField): HtmlInputType {
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
      return `${f.label} can't exceed ${f.phone ? 25 : f.zip ? 10 : f.maxLength || 100
        } characters`;
    } else {
      return f.invalidMsg;
    }
  }

  getSubmitBtnClass(): string {
    if (!this.internalUser && this.ableSubmit) {
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

  async submitForm() {
    if (this.form.valid) {
      const submittedData = this.submissionBody;
      console.log('submittedData: ', submittedData);
      const request: UpdateRebateFormRequest = {
        rebateInfoId: this.rebateInfoId,
        rebateInfo: submittedData['rebateInfo'],
        rebateAddress: submittedData['rebateAddress'] || {},
        rebateCustomInfo: submittedData['rebateCustomInfo'] || {},
      };
      console.log('update rebate form request: ', request);

      const response = await this.rebateService.updateRebateForm(request);
      if (response && response.success) {
        this.updateResponse = response;
        this.dialogRef.close(response);
      } else {
        let errorMessage = 'update rebate form data failed';
        if (response && response.messages && response.messages.length) {
          if (response.messages[0].value) {
            errorMessage = response.messages[0].value;
          }
        }
        this.showSnack(errorMessage, 'close');
        return;
      }
    } else {
      Object.keys(this.form.controls).forEach((key) =>
        this.form.controls[key].markAsTouched()
      );
      console.log('Rebate update form submitted with error');
      this.showSnack('Form submitted with error', 'close');
      return;
    }
  }

  getType(type: string) {
    if (type === 'password') return 'text';
    return type;
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
