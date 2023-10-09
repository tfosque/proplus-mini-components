import { Component, ElementRef, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TemplateTourService } from './../../../services/template-tour.service';

@Component({
    selector: 'app-template-step-icons',
    templateUrl: './template-step-icons.component.html',
    styleUrls: ['./template-step-icons.component.scss'],
})
export class TemplateStepIconsComponent implements OnInit {
    public currStep = new BehaviorSubject<number>(1);
    constructor(
        private readonly templateTourService: TemplateTourService,
        private $el: ElementRef
    ) {}

    ngOnInit(): void {
        this.templateTourService.currStep$.subscribe((next) => {
            this.currStep.next(next);
        });
    }

    go2Step(step: number): void {
        this.templateTourService.go2Step(step);
        const activeEl = this.$el.nativeElement.querySelector(`#divBackdrop`);
        activeEl.style.scrollMarginTop = step >= 1 ? `460px` : 0;
        activeEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
        });
        this.checkIsDone();
    }

    checkIsDone(): void {
        /* if (this.currStep.value === this.lastStep) {
      this.isDone.next(true);
    } */
        this.templateTourService.checkIsDone();
    }
}
