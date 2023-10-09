import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-signup-page2',
    templateUrl: './signup-page.component.html',
    styleUrls: ['./signup-page.component.scss'],
})
export class SignupPageComponent implements OnInit {
    isLoading = false;
    hasError = false;
    error = '';

    constructor() {}

    ngOnInit() {}

    onSubmit(x: string) {
        console.log('x', x);
    }
}
