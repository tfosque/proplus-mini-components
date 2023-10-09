import { NgModule } from '@angular/core';
import { DumpGridComponent } from './components/dump-grid/dump-grid.component';
import { ImagePreloadDirective } from './directives/image-preload.directive';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { NumericInputComponent } from './components/numeric-input/numeric-input.component';
import { SharedModule } from '../shared.module';
import { ScriptLoaderDirective } from './directives/script-loader.directive';
import { ProductSearchModalComponent } from './components/product-search-modal/product-search-modal.component';
import { SearchFormComponent } from './components/product-search-modal/search-form/search-form.component';
import { SearchModalBreadCrumbComponent } from './components/product-search-modal/search-modal-bread-crumb/search-modal-bread-crumb.component';
import { SearchModalContainerComponent } from './components/product-search-modal/search-modal-container/search-modal-container.component';
import { SearchModalDetailsComponent } from './components/product-search-modal/search-modal-details/search-modal-details.component';
import { SearchModalEmptyResultsComponent } from './components/product-search-modal/search-modal-empty-results/search-modal-empty-results.component';
import { SearchModalFacetItemComponent } from './components/product-search-modal/search-modal-facet-item/search-modal-facet-item.component';
import { SearchModalFacetsComponent } from './components/product-search-modal/search-modal-facets/search-modal-facets.component';
import { SearchModalResultsComponent } from './components/product-search-modal/search-modal-results/search-modal-results.component';
import { SearchPaginationComponent } from './components/product-search-modal/search-pagination/search-pagination.component';
import { DetailsOptionsTableComponent } from './components/product-search-modal/search-modal-details/details-options-table/details-options-table.component';
import { SearchResultsCardComponent } from './components/product-search-modal/search-modal-results/search-results-card/search-results-card.component';
// import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
// TODO (Luis Sardon): To review with Tim unused imports

@NgModule( {
    declarations: [
        DumpGridComponent,
        ImagePreloadDirective,
        SearchBarComponent,
        NumericInputComponent,
        ScriptLoaderDirective,
        ProductSearchModalComponent,
        SearchFormComponent,
        SearchModalBreadCrumbComponent,
        SearchModalContainerComponent,
        SearchModalDetailsComponent,
        SearchModalEmptyResultsComponent,
        SearchModalFacetItemComponent,
        SearchModalFacetsComponent,
        SearchModalResultsComponent,
        SearchPaginationComponent,
        DetailsOptionsTableComponent,
        SearchResultsCardComponent,
    ],
    imports: [
        SharedModule
        // OverlayModule,
        // NgxSkeletonLoaderModule.forRoot(),
    ],
    providers: [],
    exports: [
        DumpGridComponent,
        ImagePreloadDirective,
        SearchBarComponent,
        NumericInputComponent,
        ScriptLoaderDirective
    ],
} )
export class CommonComponentsModule { }
