import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/pro-plus/services/user.service';

@Component({
    selector: 'app-membrane-application',
    templateUrl: './membrane-application.component.html',
    styleUrls: ['./membrane-application.component.scss'],
})
export class MembraneApplicationComponent implements OnInit {
    req!: { accountId: any; filter: string };

    constructor(private readonly userService: UserService) {}

    ngOnInit() {
        const userId = this.userService.accountId;
        if (userId) {
            this.req = {
                accountId: userId,
                filter: '2136009642,4294791971',
            };
        }
    }
}
