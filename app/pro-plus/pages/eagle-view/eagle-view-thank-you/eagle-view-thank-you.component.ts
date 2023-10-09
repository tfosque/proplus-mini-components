import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-eagle-view-thank-you',
    templateUrl: './eagle-view-thank-you.component.html',
    styleUrls: ['./eagle-view-thank-you.component.scss'],
})
export class EagleViewThankYouComponent implements OnInit {
    apiResult!: Result;
    message = '';
    constructor(
        private readonly router: Router,
    ) {}

    ngOnInit() {
        if (history.state && history.state.apiResult) {
            this.apiResult = history.state.apiResult;
        }
        if (history.state && history.state.message) {
            this.message = history.state.message;
        }
    }

    async navigatePLP() {
        await this.router.navigateByUrl('/search');
    }
}

interface Result {
    mincronOrderId?: string;
    orderId?: number;
    reportIds?: number[];
    modelState?: ModelState;
}

interface ModelState {
    modelKey: string;
    modelValue: string[];
}
