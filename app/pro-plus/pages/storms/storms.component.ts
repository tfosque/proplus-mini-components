import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-storms',
    templateUrl: './storms.component.html',
    styleUrls: ['./storms.component.scss'],
})
export class StormsComponent implements OnInit {
    constructor(public router: Router) {}

    ngOnInit() {}
}
