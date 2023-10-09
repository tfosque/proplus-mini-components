import { TemplateTourService } from './../../../services/template-tour.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-label-icons',
  templateUrl: './template-label-icons.component.html',
  styleUrls: ['./template-label-icons.component.scss']
})
export class TemplateLabelIconsComponent implements OnInit {

  constructor(
    private readonly templateTourService: TemplateTourService
  ) { }

  ngOnInit() {
  }

  go2Step(step: number): void {
    this.templateTourService.go2Step(step);
    this.templateTourService.checkIsDone();
  }

}
