import { Component, Input, OnInit } from '@angular/core';


@Component( {
  selector: 'app-search-modal-results',
  templateUrl: './search-modal-results.component.html',
  styleUrls: ['./search-modal-results.component.scss']
} )
export class SearchModalResultsComponent implements OnInit {
  @Input() data: any = {};
  @Input() fromModal = '';
  @Input() searchResults = [];

  constructor(

  ) { }

  ngOnInit(): void {
  }

}
