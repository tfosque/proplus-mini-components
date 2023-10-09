import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approve-dialogue',
  templateUrl: './approve-dialogue.component.html',
  styleUrls: ['./approve-dialogue.component.scss']
})
export class ApproveDialogueComponent implements OnInit {

  orderName: string = ''
  constructor() { }

  get ordernameEmpty() {
    if (this.orderName.length === 0) {
      return true;
    }
    return false;
  }

  ngOnInit() {
  }

}
