import { Component, OnInit } from '@angular/core';
import { CommercialItemsRequest } from '../services/commercial.service';
import { UserService } from 'src/app/pro-plus/services/user.service';

@Component({
    selector: 'app-iso-fastners',
    templateUrl: './iso-fastners.component.html',
    styleUrls: ['./iso-fastners.component.scss'],
})
export class IsoFastnersComponent implements OnInit {
    req!: CommercialItemsRequest;
    constructor(private readonly userService: UserService) {}

    ngOnInit() {
        const user = this.userService.accountId;
        if (user) {
            this.req = {
                accountId: user,
                cateFilter: 'CAT_CRO_COA_FPT',
                facetFilter: '',
            };
        }
    }
}
