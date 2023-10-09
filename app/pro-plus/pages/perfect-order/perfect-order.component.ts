import { UserService } from './../../services/user.service';
import { PerfectOrderService } from './../../services/perfect-order.service';
// import { PerfectOrderService, PerfectStylesResponse } from './../../services/perfect-order.service';
import { Component, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { ProplusUrls } from '../../../enums/proplus-urls.enum';

@Component({
    selector: 'app-perfect-order',
    templateUrl: './perfect-order.component.html',
    styleUrls: ['./perfect-order.component.scss'],
})
export class PerfectOrderComponent implements OnInit {
    brandInfo: BrandInfo[] | null = null;
    isLoading = true;
    templateBuild = 'template-build';
    constructor(
        readonly perfectOrderService: PerfectOrderService,
        readonly userService: UserService,
        readonly route: ActivatedRoute
    ) {}

    async ngOnInit() {
        try {
            const p: ParamMap = this.route.snapshot.paramMap;
            const brandName = p.get('brandName');
            if (brandName) {
                const request = {
                    brandName: brandName,
                    pageNo: 1,
                    pageSize: 50,
                };
                try {
                    const infoStyle = await this.perfectOrderService.getPerfectOrderLanding(
                        request
                    );
                    if (infoStyle) {
                        this.brandInfo = infoStyle.result.items.map((v) => {
                            const item = {
                                id: v.id,
                                imageUrl: `${ProplusUrls.root}${v.imgUrl}`,
                                displayName: v.displayName,
                            };
                            return item;
                        });
                    }
                } catch (error) {}
                try {
                    const info = await this.perfectOrderService.getPerfectStyles(
                        {
                            brand: brandName,
                            pageNo: 1,
                            pageSize: 50,
                        }
                    );

                    if (info) {
                        this.brandInfo = info.result.items.map((v) => {
                            const item = {
                                id: v.styleId,
                                imageUrl: v.productStyleImage,
                                displayName: v.productStyleName,
                            };
                            return item;
                        });
                    }
                } catch (error) {}
            }
        } finally {
            this.isLoading = false;
        }
    }
}

interface BrandInfo {
    id: string;
    imageUrl: string;
    displayName: string;
}
