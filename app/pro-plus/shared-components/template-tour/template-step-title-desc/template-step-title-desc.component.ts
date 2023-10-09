import { TemplateTourService } from './../../../services/template-tour.service';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-template-step-title-desc',
  templateUrl: './template-step-title-desc.component.html',
  styleUrls: ['./template-step-title-desc.component.scss']
})
export class TemplateStepTitleDescComponent implements OnInit {
  public currStep = new BehaviorSubject<number>(1);

  constructor(
    private readonly templateTourService: TemplateTourService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    this.templateTourService.currStep$.subscribe(next => {
      this.currStep.next(next);
    })
  }

  closeOnboarding(): void {
    this.templateTourService.complete();
    this.router.navigate(['/proplus/templates']);
  }
}
