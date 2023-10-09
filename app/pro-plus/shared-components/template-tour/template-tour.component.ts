import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TemplateTourService } from './../../services/template-tour.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-template-tour',
    templateUrl: './template-tour.component.html',
    styleUrls: ['./template-tour.component.scss'],
})
export class TemplateTourComponent implements OnInit {
    public currStep = new BehaviorSubject<number>(0);
    public isDone = new BehaviorSubject<boolean>(false);
    templates: Array<SimpleTemplate> = [
        {
            templateName: 'ABC Template',
            lastModified: '06-26-2022',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: 'XYZ Template',
            lastModified: '06-21-2022',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: 'AAA Template',
            lastModified: '01-26-2022',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: 'BBB Template',
            lastModified: '12-16-2021',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: 'YYY Template',
            lastModified: '10-31-2021',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: 'ZZZ Template',
            lastModified: '10-22-2021',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: 'YUI Template',
            lastModified: '10-10-2021',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: 'YTY Template',
            lastModified: '09-01-2021',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: '123 Template',
            lastModified: '08-14-2021',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
        {
            templateName: '789 Template',
            lastModified: '08-11-2021',
            account: 'XXXXXX (ACCOUNT NAME)',
            createdBy: 'Name Last Name',
        },
    ];

    constructor(
        private templateTourService: TemplateTourService,
        private readonly router: Router,
        private $el: ElementRef
    ) {}

    ngOnInit() {
        this.templateTourService.isDone$.subscribe((status) => {
            this.isDone.next(status);
        });
        this.templateTourService.currStep$.subscribe((step) => {
            this.currStep.next(step);
        });
        if (window.innerWidth <= 1250) {
            this.router.navigate(['/proplus/templates']);
        }
    }

    public nextStep(): void {
        this.templateTourService.nextStep();
        const activeEl = this.$el.nativeElement.querySelector(`#divBackdrop`);
        activeEl.style.scrollMarginTop = this.currStep.value >= 1 ? `460px` : 0;
        activeEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
        });
        this.templateTourService.checkIsDone();
    }

    complete(): void {
        this.templateTourService.complete();
        this.router.navigate(['/proplus/templates']);
    }

    @HostListener('window:resize', ['$event'])
    runIndicatorChecks() {
        if (window.innerWidth <= 1250) {
            this.router.navigate(['/proplus/templates']);
        }
    }
}

interface SimpleTemplate {
    templateName: string;
    lastModified: string;
    account: string;
    createdBy: string;
}
