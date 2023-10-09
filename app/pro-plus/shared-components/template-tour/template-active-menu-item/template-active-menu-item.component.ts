import { TemplateTourService } from './../../../services/template-tour.service';
import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-active-menu-item',
  templateUrl: './template-active-menu-item.component.html',
  styleUrls: ['./template-active-menu-item.component.scss']
})
export class TemplateActiveMenuItemComponent implements OnInit {
  public currStep = new BehaviorSubject<number>(0);
  constructor(
    private readonly templateTourService: TemplateTourService
  ) { }

  ngOnInit() {
    this.templateTourService.currStep$.subscribe(nextStep => {
      this.currStep.next(nextStep);
    })
  }

}
