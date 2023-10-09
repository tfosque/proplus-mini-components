import { Component, OnInit } from '@angular/core';

@Component( {
  selector: 'app-image-fav-icon',
  templateUrl: './image-fav-icon.component.html',
  styleUrls: ['./image-fav-icon.component.scss']
} )
export class ImageFavIconComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log( 'common...' )
  }

}
