import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EagleViewService } from '../../../services/eagle-view.service';
import {
  EagleViewExchangeOktaAuthCodeRequest
} from '../../../model/eagle-view-exchange-auth-code';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-process-account',
  templateUrl: './process-account.component.html',
  styleUrls: ['./process-account.component.scss']
})
export class ProcessAccountComponent implements OnInit {
  config: MatSnackBarConfig = {
    verticalPosition: 'top',
    duration: 10000,
  };

  constructor(
    private readonly _snackBar: MatSnackBar,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly eagleViewService: EagleViewService,
  ) { }

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    // console.log({params});
    const code = params['code'];
    const state = params['state'];
    const error = params['error'];
    const error_description = params['error_description'];
    console.log('code: ', code);
    console.log('state: ', state);

    if (state && code) {
      // Call the exchangeOktaEagleViewAuthorizationCode api to exchange token from EV by authorization code
      const request: EagleViewExchangeOktaAuthCodeRequest = {
        code: code,
        state: state
      }

      const response = await this.eagleViewService.exchangeOktaEagleViewAuthorizationCode(request);
      if (response.success) {
        this._snackBar.open(`Account linked successfully`, 'Close', this.config);
      } else {
        let errorMessage = 'Account linking error';
        if (response.messages && response.messages.length > 0) {
          const message = response.messages[0];
          if (message.value.length > 0) {
            errorMessage = message.value;
          }
        }
        this._snackBar.open(errorMessage, 'Close', this.config);
      }
    } else {
      if (error) {
        if (error_description) {
          this._snackBar.open(`Account linking failed: ${error} - ${error_description}`, 'Close', this.config);
        } else {
          this._snackBar.open(`Account linking failed - ${error}`, 'Close', this.config);
        }
      }
    }
    this.router.navigate(['/proplus/eagle-view/landing']);
  }
}
