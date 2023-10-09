import { Component, OnInit } from '@angular/core';
// import { EventEmitter } from 'stream';
// import { CommercialService } from '../../services/commercial.service';

@Component( {
  selector: 'app-commercial-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
} )
export class SearchBarComponent implements OnInit {
  // @Output() searchStr = new EventEmitter();
  searchStr = ''

  constructor(
    // private readonly comService: CommercialService
  ) { }

  ngOnInit(): void { }

  update( evt: any ) {
    // this.searchStr.emit( evt )
    console.log( { evt } )
  }


}
