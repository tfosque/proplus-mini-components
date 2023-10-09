import { OnboardingService } from './../../../services/onboarding.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-label-icons',
    templateUrl: './label-icons.component.html',
    styleUrls: ['./label-icons.component.scss'],
})
export class LabelIconsComponent implements OnInit {
    constructor(private readonly onboard: OnboardingService) {}

    ngOnInit() {}

    go2Step(step: number): void {
        this.onboard.go2Step(step);
        this.onboard.checkIsDone();
    }
}
