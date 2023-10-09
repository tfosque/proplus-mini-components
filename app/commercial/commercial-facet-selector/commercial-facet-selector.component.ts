import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FacetGroup } from '../_layouts/table/table.component';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { CommercialItemsRequest } from '../services/commercial.service';

@Component({
    selector: 'app-commercial-facet-selector',
    templateUrl: './commercial-facet-selector.component.html',
    styleUrls: ['./commercial-facet-selector.component.scss'],
})
export class CommercialFacetSelectorComponent implements OnInit {
    @Input() facetGroup!: FacetGroup[];
    @Output() facetSelectedRequest: EventEmitter<any> = new EventEmitter();
    user: any | null = null;
    @Input() req!: CommercialItemsRequest;
    facetList: any[] = [];
    showMoreText = 'Show More';
    constructor(private userService: UserService) {}

    ngOnInit() {
        console.log(this.facetGroup);
        this.user = this.userService.accountId;
    }
    toggleFacet(value: any) {
        if (this.facetList.includes(value.facetId)) {
            this.facetList = this.facetList.filter(
                (item) => item !== value.facetId
            );
        } else {
            this.facetList.push(value.facetId);
        }
        console.log(value);
        console.log(this.facetList);
        if (this.user) {
            this.req.facetFilter = this.facetList.join(',');
            this.facetSelectedRequest.emit(this.req);
        }
    }
    showMoreFacetsToggle(facet: FacetGroup) {
        if (facet.facetCountShowMore * 5 > facet.valuesCount) {
            this.showMoreText = 'Show More';
            facet.facetCountShowMore = 1;
        } else {
            this.showMoreText = 'Show Less';
            facet.facetCountShowMore = facet.facetCountShowMore + 10;
        }
    }
}
