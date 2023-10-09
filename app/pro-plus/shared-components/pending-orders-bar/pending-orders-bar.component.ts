import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pending-orders-bar',
  templateUrl: './pending-orders-bar.component.html',
  styleUrls: ['./pending-orders-bar.component.scss']
})
export class PendingOrdersBarComponent implements OnInit {
  pendingOrdersCount = 0;

  constructor(
  ) { }

  ngOnInit() {

  }
}
