import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { AccessoriesComponent } from './accessories/accessories.component';
import { ShippingComponent } from './shipping/shipping.component';
import { JobAccountComponent } from './job-account/job-account.component';
import { UnderlaymentVaporBarrierComponent } from './underlayment-vapor-barrier/underlayment-vapor-barrier.component';
import { SystemTypeComponent } from './system-type/system-type.component';
import { IsoComponent } from './iso/iso.component';
import { CoverboardComponent } from './coverboard/coverboard.component';
import { IsoFastnersComponent } from './iso-fastners/iso-fastners.component';
import { MembraneTypeComponent } from './membrane-type/membrane-type.component';
import { MembraneApplicationComponent } from './membrane-application/membrane-application.component';
import { LandingComponent } from './landing/landing.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';
import { JobTypeComponent } from './job-type/job-type.component';
import { SharedModule } from '../shared.module';
import { ProductTableComponent } from './product-table/product-table.component';
import { LineItemComponent } from './product-table/line-item/line-item.component';
import { SearchBarComponent } from './job-account/search-bar/search-bar.component';
import { SearchFilterDirective } from './_directives/search-filter.directive';
import { SearchFilterPipe } from './_pipes/search-filter.pipe';
import { TableComponent } from './_layouts/table/table.component';
import { SimpleDropdownComponent } from './simple-dropdown/simple-dropdown.component';
import { DatePipe } from '@angular/common';
import { CommercialFacetSelectorComponent } from './commercial-facet-selector/commercial-facet-selector.component';

@NgModule({
    declarations: [
        OrderSummaryComponent,
        AccessoriesComponent,
        ShippingComponent,
        JobAccountComponent,
        UnderlaymentVaporBarrierComponent,
        SystemTypeComponent,
        IsoComponent,
        CoverboardComponent,
        IsoFastnersComponent,
        MembraneTypeComponent,
        MembraneApplicationComponent,
        LandingComponent,
        ManufacturerComponent,
        JobTypeComponent,
        ProductTableComponent,
        LineItemComponent,
        SearchBarComponent,
        SearchFilterDirective,
        SearchFilterPipe,
        TableComponent,
        SimpleDropdownComponent,
        CommercialFacetSelectorComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, RouterModule, SharedModule],
    providers: [SearchFilterPipe, DatePipe],
    exports: [
        SearchFilterDirective,
        OrderSummaryComponent,
        AccessoriesComponent,
        ShippingComponent,
        JobAccountComponent,
        UnderlaymentVaporBarrierComponent,
        SystemTypeComponent,
        IsoComponent,
        CoverboardComponent,
        IsoFastnersComponent,
        MembraneTypeComponent,
        MembraneApplicationComponent,
        LandingComponent,
        ManufacturerComponent,
        JobTypeComponent,
        ProductTableComponent,
        LineItemComponent,
        SearchBarComponent,
        TableComponent,
        SimpleDropdownComponent,
        CommercialFacetSelectorComponent,
    ],
})
export class CommercialModule {}
