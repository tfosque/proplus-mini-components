import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { CommercialItemsRequest } from '../services/commercial.service';

@Component({
    selector: 'app-iso',
    templateUrl: './iso.component.html',
    styleUrls: ['./iso.component.scss'],
})
export class IsoComponent implements OnInit {
    req!: CommercialItemsRequest;
    reqTaperedI!: CommercialItemsRequest;
    reqNewFlatI!: CommercialItemsRequest;

    isoItemDataSource: any[] = [];
    constructor(private userService: UserService) {}

    async ngOnInit() {
        const user = this.userService.accountId;
        if (user) {
            this.req = {
                accountId: user,
                cateFilter: 'CAT_CRO_INS_POL',
                facetFilter: '',
            };
        }
    }
}
