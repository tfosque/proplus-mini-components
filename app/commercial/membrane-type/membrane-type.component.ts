import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { CommercialItemsRequest } from '../services/commercial.service';

@Component({
    selector: 'app-membrane-type',
    templateUrl: './membrane-type.component.html',
    styleUrls: ['./membrane-type.component.scss'],
})
export class MembraneTypeComponent implements OnInit {
    reqTPO!: CommercialItemsRequest;
    reqPVC!: CommercialItemsRequest;
    reqEPDM!: CommercialItemsRequest;
    constructor(private userService: UserService) {}

    ngOnInit() {
        const userId = this.userService.accountId;
        if (userId) {
            this.reqPVC = {
                accountId: userId,
                cateFilter: 'CAT_CRO_PVC_MEM',
                facetFilter: '',
            };
            this.reqTPO = {
                accountId: userId,
                cateFilter: 'CAT_CRO_TPO_MEM',
                facetFilter: '',
            };
            this.reqEPDM = {
                accountId: userId,
                cateFilter: 'CAT_CRO_EPD_MEM',
                facetFilter: '',
            };
        }
    }
}
