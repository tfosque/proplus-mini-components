import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

interface Animal {
  name: string;
  sound: string;
}


@Component( {
  selector: 'app-simple-dropdown',
  templateUrl: './simple-dropdown.component.html',
  styleUrls: ['./simple-dropdown.component.scss']
} )
export class SimpleDropdownComponent implements OnInit {
  @Input() jobs = new BehaviorSubject<any>( [] )
  animalControl = new FormControl( '', Validators.required );
  selectFormControl = new FormControl( '', Validators.required );
  animals: Animal[] = [
    { name: 'Dog', sound: 'Woof!' },
    { name: 'Cat', sound: 'Meow!' },
    { name: 'Cow', sound: 'Moo!' },
    { name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!' },
  ];

  constructor() { }

  ngOnInit(): void {
    console.log( 'SimpleComp.....', this.jobs );
  }

}
