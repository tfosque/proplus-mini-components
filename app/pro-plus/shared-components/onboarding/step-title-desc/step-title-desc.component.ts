import { OnboardingService } from './../../../services/onboarding.service';
import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-step-title-desc',
    templateUrl: './step-title-desc.component.html',
    styleUrls: ['./step-title-desc.component.scss'],
})
export class StepTitleDescComponent implements OnInit {
    public currStep = new BehaviorSubject<number>(1);

    constructor(private readonly onboardingSvc: OnboardingService) {}

    ngOnInit(): void {
        this.onboardingSvc.currStep$.subscribe((next) => {
            this.currStep.next(next);
        });
    }

    closeOnboarding(): void {
        this.onboardingSvc.complete();
    }
}
