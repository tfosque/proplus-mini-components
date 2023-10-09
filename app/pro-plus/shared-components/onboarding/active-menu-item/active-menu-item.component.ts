import { OnboardingService } from './../../../services/onboarding.service';
import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-active-menu-item',
    templateUrl: './active-menu-item.component.html',
    styleUrls: ['./active-menu-item.component.scss'],
})
export class ActiveMenuItemComponent implements OnInit {
    public currStep = new BehaviorSubject<number>(0);
    constructor(private readonly onboardSvc: OnboardingService) {}

    ngOnInit() {
        this.onboardSvc.currStep$.subscribe((nextStep) => {
            this.currStep.next(nextStep);
        });
    }
}
