import { Component, OnInit } from '@angular/core';

export interface PeriodicElement {
  code: number;
  desc: string;
  color: string;
  unit: string;
  qty: number;
  add: boolean;
}

@Component( {
  selector: 'app-job-type',
  templateUrl: './job-type.component.html',
  styleUrls: ['./job-type.component.scss']
} )
export class JobTypeComponent implements OnInit {
  ELEMENT_DATA: PeriodicElement[] = [
    { code: 1562, desc: 'HP Protective Mat 15 X 300', color: 'White', unit: 'Roll', qty: 1234, add: true },
    { code: 2, desc: 'Name', color: 'White', unit: 'Roll', qty: 1234, add: true },
    { code: 3, desc: 'Name', color: 'White', unit: 'Square', qty: 1234, add: true },
    { code: 4, desc: 'Name', color: 'White', unit: 'Square', qty: 1234, add: true },
    { code: 5, desc: 'Name', color: 'White', unit: 'Roll', qty: 1234, add: true },
    { code: 6, desc: 'Name', color: 'Blue', unit: 'Roll', qty: 1234, add: true }
  ];

  jobTypeData = [

  ]
  displayedColumns: string[] = ['code', 'desc', 'color', 'unit', 'qty', 'add'];
  dataSource = this.ELEMENT_DATA;
  constructor() { }

  ngOnInit(): void {
  }

}
