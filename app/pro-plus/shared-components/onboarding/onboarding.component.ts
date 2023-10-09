import { BehaviorSubject } from 'rxjs';
import { OnboardingService } from './../../services/onboarding.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
    public currStep = new BehaviorSubject<number>(0);
    public isDone = new BehaviorSubject<boolean>(false);

    constructor(private onboardingService: OnboardingService) {}

    ngOnInit(): void {
        this.onboardingService.isDone$.subscribe((status) => {
            this.isDone.next(status);
        });
        this.onboardingService.currStep$.subscribe((step) => {
            this.currStep.next(step);
        });
    }

    public nextStep(): void {
        this.onboardingService.nextStep();
        this.onboardingService.checkIsDone();
    }

    complete(): void {
        this.onboardingService.complete();
    }
}
