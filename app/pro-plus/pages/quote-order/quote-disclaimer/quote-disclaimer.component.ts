import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-quote-disclaimer',
  templateUrl: './quote-disclaimer.component.html',
  styleUrls: ['./quote-disclaimer.component.scss']
})
export class QuoteDisclaimerComponent implements OnInit {
  screenSize: any;
  panelOpenState = false;
  disclaimerList: Disclaimer[] = [
      {text: '•', cols: 1, rows: 1},
      {text: 'Please be advised that Beacon can only honor a manufacturer’s quote to the same extent that the manufacturer honors it’s quote to Beacon.', cols: 11, rows: 1},
      {text: '•', cols: 1, rows: 1},
      {text: 'Where project pricing is based on full truckload quantities; warehouse orders cannot be sold at the full truck price.', cols: 11, rows: 1},
      {text: '•', cols: 1, rows: 1},
      {text: 'All quotes are subject to freight, material / fuel surcharges, hazmat fees, and deficit freight fees for partial truck shipments.', cols: 11, rows: 1},
      {text: '•', cols: 1, rows: 1},
      {text: 'Quantities and materials listed are based on our interpretation of the project; it is the customer’s responsibility to review all plans and specs for accuracy.', cols: 11, rows: 1},
      {text: '•', cols: 1, rows: 1},
      {text: 'Listed quantities are estimates only, Beacon Building Products will not be responsible for overages or shortages on the quantities provided.', cols: 11, rows: 1},
      {text: '•', cols: 1, rows: 1},
      {text: 'Non-stock, special order material cannot be returned to a Beacon facility.', cols: 11, rows: 1},
      {text: '•', cols: 1, rows: 1},
      {text: 'Please reference the project quote # when placing an order for this project.', cols: 11, rows: 1},
  ]

  get getSmallScreen() {
    this.screenSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    };
    if (this.screenSize.width < 896) {
        return true;
    } else {
        return false;
    }
}
  constructor() { }

  ngOnInit(): void {
  }

}
export interface Disclaimer {
  text: string;
  cols: number;
  rows: number;
}
