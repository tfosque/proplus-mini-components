import { OnboardingService } from './../../services/onboarding.service';
import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CurrentUser } from '../../model/get-current-user-response';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit, AfterViewInit {
    public showOnboarding = new BehaviorSubject<boolean>(false);
    public playMode = new BehaviorSubject<boolean>(true);
    public autoTriggerOnboard = new BehaviorSubject<boolean>(false);
    public account?: CurrentUser;
    public override = new BehaviorSubject<boolean>(false);


    constructor(
        public router: Router, private readonly user: UserService,
        private readonly userSvc: UserService,
        private onboardSvc: OnboardingService
    ) { }

    async ngOnInit() {
        const response = await this.user.getSessionInfo();
        if (response) {
            this.account = response;
        }
    }

    ngAfterViewInit() {
        /* ONBOARDING Show/ Hide */
        // this.userSvc.getFirstLoggedIn();
        /* Check for platform here */
        this.onboardSvc.autoTriggerOnboard$.subscribe(trigger => {
            // control show/ hide from ui
            this.autoTriggerOnboard.next(trigger);
        })

        this.userSvc.firstLoggedInLess48Hours$
            // control show/ hide from user session data
            .subscribe(isNew => {
                this.showOnboarding.next(isNew);
            })
        this.onboardSvc.playMode$.subscribe(mode => {
            this.playMode.next(mode);
        })
    }

    getOrderHistoryLink() {
        const currentAccountId = this.user.accountIdInString;
        const link = `/proplus/accounts/${currentAccountId}/orders`;
        return link;
    }

    getQuoteLink() {
        const currentAccountId = this.user.accountIdInString;
        const link = `/proplus/accounts/${currentAccountId}/quotes/new`;
        return link;
    }
}
