import { AnalyticsService } from './../../common-components/services/analytics.service';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
// import moment from 'moment';

/* interface Steps {
  step1: object;
  step2: object;
  step3: object;
  step4: object;
  step5?: object;
  step6?: object;
  step7?: object;
} */
/* STEPS TODO Dynamic Setup */
/*   public createStep1(content: {}): void {
    // const content = {};
    this.steps.step1 = content;
  } */
@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private showOnboarding = new BehaviorSubject<boolean>(true);
  public showOnboarding$ = this.showOnboarding.asObservable();
  private autoTriggerOnboard = new BehaviorSubject<boolean>(false);
  public autoTriggerOnboard$ = this.autoTriggerOnboard.asObservable();
  public playMode = new BehaviorSubject<boolean>(true);
  public playMode$ = this.playMode.asObservable();
  public triggerTerm = 'Onboarding';
  private currStep = new BehaviorSubject<number>(0);
  public currStep$ = this.currStep.asObservable();
  public lastStep = 3;
  private isDone = new BehaviorSubject<boolean>(false);
  public isDone$ = this.isDone.asObservable();


  // TODO create dynamic component
  // steps: Steps;
  constructor(
    private readonly analytics: AnalyticsService
  ) {
    /* this.steps = { step1: {}, step2: {}, step3: {}, step4: {} }
    console.log('steps:', this.steps, 'lastSteps:', this.lastStep); */
    this.analytics.onboarding(0, 0);

  }

  public nextStep(): void {
    const prevStepClicked = this.currStep.value;

    if (prevStepClicked < this.lastStep) {
      this.currStep.next(prevStepClicked + 1);
      this.analytics.onboarding(this.currStep.value, prevStepClicked)
    }
  }

  public go2Step(nextStep: number): void {
    const prevStepClicked = this.currStep.value;
    this.currStep.next(nextStep);
    this.analytics.onboarding(nextStep, prevStepClicked)
  }

  autoTriggerOnboardEvent(trigger: boolean) {
    this.autoTriggerOnboard.next(trigger);
  }

  public complete(): void {
    const prevStepClicked = this.currStep.value;
    this.showOnboarding.next(false);
    /* Override normal functionality */
    this.autoTriggerOnboard.next(false);
    /* Trigger Done for analytics */
    this.analytics.onboarding(this.lastStep + 1, prevStepClicked);
    this.playMode.next(false);
    this.currStep.next(0);
  }

  public checkIsDone(): void {
    if (this.currStep.value === this.lastStep) {
      this.isDone.next(true);
    } else {
      this.isDone.next(false);
    }
  }
}
