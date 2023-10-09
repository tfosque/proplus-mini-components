import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/pro-plus/services/user.service';

@Component({
    selector: 'app-accessories',
    templateUrl: './accessories.component.html',
    styleUrls: ['./accessories.component.scss'],
})
export class AccessoriesComponent implements OnInit {
    req!: { accountId: any; filter: string };

    constructor(private readonly userService: UserService) {}

    ngOnInit() {
        const userId = this.userService.accountId;
        if (userId) {
            this.req = {
                accountId: userId,
                filter: 'CAT_CRO_COA',
            };
        }
    }
}
