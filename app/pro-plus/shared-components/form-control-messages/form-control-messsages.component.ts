import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'form-control-messages',
  template: `<mat-error class="control-message" *ngIf="errorMessage !== null">{{errorMessage}}</mat-error>`,
  styles: ['.control-message { margin-top: -15px; font-size: 14px}']
})
export class FromControlMessagesComponent {
  @Input() control!: FormControl;
  constructor() { }

  get errorMessage() {
    for (let propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }

    return null;
  }
}