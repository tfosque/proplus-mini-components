import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { retry, shareReplay } from 'rxjs/operators';
import { CommercialService } from '../services/commercial.service';
import { ProductsService } from '../../pro-plus/services/products.service';
import { UserService } from '../../pro-plus/services/user.service';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
    productFetch: any = {};
    constructor(
        private readonly http: HttpClient,
        private readonly commercialService: CommercialService,
        private readonly userService: UserService,
        // private readonly api: ProPlusApiBase
        private readonly productsService: ProductsService
    ) {}

    ngOnInit(): void {
        this.commercialService.updateCommercialOrderDetails();

        this.userService.sessionBehavior.subscribe((user) => {
            this.productFetch.accountId =
                user.session.user?.lastSelectedAccount.accountLegacyId;
        });

        this.fetchCarlisleBrand();
    }

    quotes2OrderRestCall(quotesParams: any) {
        // Just as an example to handle long api calls.
        const apiURL = 'https://dev-static.becn.com';
        const options = {
            headers: {
                'Content-Type': 'application/json',
                apiKey: 'someApiKey',
            },
        };

        this.http
            .post(apiURL, quotesParams, options)
            .pipe(shareReplay(), retry(2))
            .subscribe(
                (response) => {
                    console.log({ response });
                },
                (error) => this.handleError(error)
            );
    }

    handleError(err: any) {
        alert('A problem has been detected with your request.');
        console.log({ err });
    }
    /*  */
    fetchProducts(filter: string, facetsFilter: string) {
        const { accountId } = this.productFetch;

        this.productsService.searchProducts({
            accountId,
            filter,
            facetsFilter,
            pageNo: 1,
            pageSize: 25,
            showHoverAttrs: true,
            showSkuList: true,
            hoverSearch: false,
        });
    }
    /*  */
    fetchCarlisleBrand() {
        // - https://becn.com/search?filters=4294789794
        const facetsFilter = '4294789794';
        this.fetchProducts('', facetsFilter);
    }
    fetchISO() {
        // CAT_CRO_INS_POL - https://becn.com/search?cateFilter=2136009171
    }
    fetchCoverboard() {
        // CAT_CRO_INS_COV  - https://becn.com/search?cateFilter=2136009167
    }
    /*  */
    fetchMechanicalFastners() {
        // CAT_CRO_COA_FPT - https://becn.com/search?cateFilter=2136009859
        // CAT_BCO_TOE_FAS - https://becn.com/search/?cateFilter=2136009523
    }
    /*  */
    fetchEPDM() {
        // CAT_CRO_EPD_MEM - https://becn.com/search/?cateFilter=2136009221
        //
    }
    fetchTPO() {
        // CAT_CRO_TPO_MEM - https://becn.com/search?cateFilter=2136009244
    }
    fetchPVC() {
        // CAT_CRO_PVC_MEM - https://becn.com/search?cateFilter=2136009238
    }
    fetchFleecback() {
        // TODO UNKNOWN
    }
    /*  */
    fetchHPProtectiveMat() {
        // - https://becn.com/productDetail/C-010278/10278
    }
    fetchBUR_Polymer_Bitumen_Systems() {
        // https://becn.com/search/?cateFilter=2136009222
    }
}
