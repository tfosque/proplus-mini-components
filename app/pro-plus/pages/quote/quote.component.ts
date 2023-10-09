import { Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import {SevereError} from '../../../common-components/classes/app-error';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss']
})
export class QuoteComponent implements OnInit {
  accountId: any;
  createQuoteForm: any;
  private isLoading = true;

  get showProgress() {
    return this.isLoading;
  }
  
  get permissionToUpload() {
    return this.user.permissions.quote.upload;
  }
  
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly user: UserService,
    private formBuilder: FormBuilder
    
  ) {
    this.createQuoteForm = this.formBuilder.group({
      quoteName: ['', Validators.required],
    });
   }

  ngOnInit() {
    try {
      const p: ParamMap = this.route.snapshot.paramMap;
      const account = p.get('accountId') || '0';
      this.accountId = account;

      // Access control
      if (!this.user.permissions.quote.edit) {
        throw new SevereError('forbidden');
      }
    } finally {
      this.isLoading = false;
    }
  }
  async redirectCreate() {
    await this.router.navigateByUrl(
      `/proplus/accounts/${this.accountId}/quotes/create-quote`, { state: { quoteName: this.createQuoteForm.value.quoteName }}
    );
  }
  async redirectSummary() {
    await this.router.navigateByUrl(
      `/proplus/accounts/${this.accountId}/quotes`
    );
  }
  async redirectUpload() {
    await this.router.navigateByUrl(
      `/proplus/accounts/${this.accountId}/quotes/upload-quote`
    );
  }

}
