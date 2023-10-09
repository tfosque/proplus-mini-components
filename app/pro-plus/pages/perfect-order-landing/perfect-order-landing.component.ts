import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-perfect-order-landing',
    templateUrl: './perfect-order-landing.component.html',
    styleUrls: ['./perfect-order-landing.component.scss'],
})
export class PerfectOrderLandingComponent implements OnInit {
    public perfectOrderTemplates = [
        { name: 'TAMKO', image: '/assets/images/tamco-logo.png' },
        { name: 'IKO', image: '/assets/images/IKOlandPO.png' },
        { name: 'GAF', image: '/assets/images/gaf-logo.png' },
        // { name: 'Mastic', image: '/assets/images/MasticPO12.png' },
        { name: 'CertainTeed Roofing', image: '/assets/images/CTRlandPO.png' },
        // Certainteed Vinyl Building Products not working
        {
            name: 'CertainTeed Vinyl Building Products',
            image: '/assets/images/CTR_sidingPO.png',
        },
        {
            name: 'Owens Corning',
            image: '/assets/images/owens-corning-logo.png',
        },
        { name: 'Johns Manville', image: '/assets/images/JMPO.png' },
        {
            name: 'Carlisle Syntec',
            image: '/assets/images/Carlisle_PO_Logo.jpg',
        },
        { name: 'Atlas Roofing', image: '/assets/images/AtlasPO.png' },
        { name: 'Boral', image: '/assets/images/PO_Boral.png' },
        { name: 'Mastic', image: '/assets/images/MasticPO12.png' },
        { name: 'LP SmartSide', image: '/assets/images/SmartSide-IMG.jpeg' },
    ];

    constructor(
        private readonly router: Router
    ) {}

    ngOnInit() {}

    async selectBrand(brand: string) {
        if (brand && brand.length > 0) {
            await this.router.navigate([`/proplus/perfect-order/${brand}`]);
        }
    }
}
