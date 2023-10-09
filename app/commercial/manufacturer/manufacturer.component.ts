import { Component, OnInit } from '@angular/core';

@Component( {
  selector: 'app-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: ['./manufacturer.component.scss']
} )
export class ManufacturerComponent implements OnInit {
  carlisle = 'https://dev-site-v15.becn.digital/site/binaries/content/gallery/beaconhippo/carlisle_logo_brand.jpg';

  constructor() { }

  ngOnInit(): void {
  }

}
