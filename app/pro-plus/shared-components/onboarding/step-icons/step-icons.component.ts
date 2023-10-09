import { Component, OnInit } from '@angular/core';
import { OnboardingService } from './../../../services/onboarding.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-step-icons',
    templateUrl: './step-icons.component.html',
    styleUrls: ['./step-icons.component.scss'],
})
export class StepIconsComponent implements OnInit {
    public currStep = new BehaviorSubject<number>(1);
    // TODO this.lastStep dynamic range for

    constructor(private readonly onboardingSvc: OnboardingService) {}

    ngOnInit(): void {
        this.onboardingSvc.currStep$.subscribe((next) => {
            this.currStep.next(next);
        });
    }

    go2Step(step: number): void {
        console.log({ step });

        this.onboardingSvc.go2Step(step);
        this.checkIsDone();
    }

    checkIsDone(): void {
        /* if (this.currStep.value === this.lastStep) {
      this.isDone.next(true);
    } */
        this.onboardingSvc.checkIsDone();
    }
}
