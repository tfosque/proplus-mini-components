import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { CommercialItemsRequest } from '../services/commercial.service';

@Component({
    selector: 'app-coverboard',
    templateUrl: './coverboard.component.html',
    styleUrls: ['./coverboard.component.scss'],
})
export class CoverboardComponent implements OnInit {
    req!: CommercialItemsRequest;
    constructor(private userService: UserService) {}

    ngOnInit() {
        const user = this.userService.accountId;
        if (user) {
            this.req = {
                accountId: user,
                cateFilter: 'CAT_CRO_INS_COV',
                facetFilter: '',
            };
        }
    }
}
