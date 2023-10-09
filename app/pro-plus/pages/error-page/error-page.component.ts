import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss'],
})
export class ErrorPageComponent implements OnInit {
    public message$: Observable<string>;
    showError = true;

    public messages: Record<string, string> = {
        default: 'An error occured',
        'account-setup': [
            `We're sorry, but you do not have access to this page.`,
            ` Please call us at 888.685.6111 or chat with us for further assistance.`,
        ].join('\n'),
        'job-missing': [
            `We're sorry, but it seems your job accounts haven't been setup correctly.`,
            ` Please call us at 888.685.6111 or chat with us for further assistance.`,
        ].join('\n'),
        forbidden: [
            `We're sorry, but you do not have access to this page. ` +
                `Please call us at 888.685.6111 or chat with us for further assistance.`,
        ].join('\n'),
        'no-ev-access': [
            `We're sorry, but you do not have access to this page. ` +
                `Please contact your organization's administrator to request access.`,
        ].join('\n'),
    };

    constructor(private readonly router: ActivatedRoute) {
        this.message$ = router.queryParams.pipe(
            map((p) => {
                const t = p['type'];
                if (!t) {
                    return this.messages['default'];
                }
                const msg = this.messages[t];
                if (!msg) {
                    return this.messages['default'];
                }
                return msg;
            })
        );
    }

    ngOnInit() {
        const params = this.router.snapshot.queryParams;
        const errorType = params['type'];
        if (errorType && errorType.length > 0 
            && (errorType.toLowerCase() === 'forbidden' || errorType.toLowerCase() === 'no-ev-access')) {
            this.showError = false;
        }
    }
}
