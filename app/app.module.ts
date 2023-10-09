import {
    BrowserModule,
    BrowserTransferStateModule,
    HammerModule,
} from '@angular/platform-browser';
import { APP_ID, Inject, NgModule, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { BrSdkModule } from '@bloomreach/ng-sdk';
import { NguCarouselModule } from '@ngu/carousel';
import { environment } from '../environments/environment';
import { BrBaseContentComponent } from './core/BrBaseContentComponent';
import { MasterPageComponent } from './master-page/master-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CommercialModule } from './commercial/commercial.module';
import {
    IndexPageComponent,
    MAPPING,
} from './core/index-page/index-page.component';
import { CONFIGURATION } from './services/page.service';
import { DummyPageComponent } from './core/dummy-page/dummy-page.component';
import { AppComponent } from './app.component';
import { googleMapsApiKey } from './app.constants';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { ProPlusModule } from './pro-plus/pro-plus.module';
import { SharedModule } from './shared.module';
import { CommonComponentsModule } from './common-components/common-components.module';

// Global Components
import { BrandBannerComponent } from './global-components/brand-banner/brand-banner.component';
import { BreadcrumbComponent } from './global-components/breadcrumb/breadcrumb.component';
import { ConfirmationDialogComponent } from './global-components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ContentSectionComponent } from './global-components/content-section/content-section.component';
import { CustomRichTextComponent } from './global-components/custom-rich-text/custom-rich-text.component';
import { GlobalFooterComponent } from './global-components/global-footer/global-footer.component';
import { ImageCardComponent } from './global-components/image-card/image-card.component';
import { ImageCardSectionComponent } from './global-components/image-card-section/image-card-section.component';
import { ImageCardSectionGroupComponent } from './global-components/image-card-section-group/image-card-section-group.component';
import { ImageLinkColumnComponent } from './global-components/image-link-column/image-link-column.component';
import { ImageLinkRowComponent } from './global-components/image-link-row/image-link-row.component';
import { InPageNavigationComponent } from './global-components/in-page-navigation/in-page-navigation.component';
import { InPageNavigationPlaceholderComponent } from './global-components/in-page-navigation-placeholder/in-page-navigation-placeholder.component';
import { LoadingContainerComponent } from './global-components/loading-container/loading-container.component';
import { MainNavComponent } from './global-components/main-nav/main-nav.component';
import { MainNavMegaMenuComponent } from './global-components/main-nav-mega-menu/main-nav-mega-menu.component';
import { NavigableContentContainerComponent } from './global-components/navigable-content-container/navigable-content-container.component';
import { OpenQuoteComponent } from './global-components/open-quote/open-quote.component';
import { ProPlusNavigationComponent } from './global-components/pro-plus-navigation/pro-plus-navigation.component';
import { RichTextComponent } from './global-components/rich-text/rich-text.component';
import { RotatingCarouselComponent } from './global-components/rotating-carousel/rotating-carousel.component';
import { SeoComponent } from './global-components/seo/seo.component';
import { SingleRowBulletedListComponent } from './global-components/single-row-bulleted-list/single-row-bulleted-list.component';
import { ThreeColumnBulletedListComponent } from './global-components/three-column-bulleted-list/three-column-bulleted-list.component';
import { TopHatComponent } from './global-components/top-hat/top-hat.component';
import { VideoBlockComponent } from './global-components/video-block/video-block.component';

// Page Components
import { BasePageComponent } from './pages/base-page/base-page.component';
import { BrandLandingPageComponent } from './pages/brand-landing-page/brand-landing-page.component';
import { DiagnosticsPageComponent } from './pages/diagnostics-page/diagnostics-page.component';
import { GenericContentPageComponent } from './pages/generic-content-page/generic-content-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { PageComponentRerouterComponent } from './pages/page-component-rerouter/page-component-rerouter.component';
import { ProductBrowsePageComponent } from './pages/product-browse-page/product-browse-page.component';
import { ProductCategoryPageComponent } from './pages/product-category-page/product-category-page.component';
import { ProductDetailsPageComponent } from './pages/product-details-page/product-details-page.component';
import { ProplusLandingPageComponent } from './pages/proplus-landing-page/proplus-landing-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { WhereToBuyPageComponent } from './pages/where-to-buy-page/where-to-buy-page.component';
import { StormPlusComponent } from './pages/storm-plus/storm-plus.component';

// Homepage Components
import { HomeHeroCarouselComponent } from './homepage-components/home-hero-carousel/home-hero-carousel.component';
import { HomeMosaicComponent } from './homepage-components/home-mosaic/home-mosaic.component';
import { MarketingBannerComponent } from './homepage-components/marketing-banner/marketing-banner.component';
import { StatisticsComponentComponent } from './homepage-components/statistics-component/statistics-component.component';

// Product Category Components
import { ApplicationCardComponent } from './product-category-components/application-card/application-card.component';
import { ApplicationCardSectionComponent } from './product-category-components/application-card-section/application-card-section.component';
import { PopularBrandsComponent } from './product-category-components/popular-brands/popular-brands.component';

// Product Browse Components
import { FacetContainerComponent } from './product-browse-components/facet-container/facet-container.component';
import { FacetGroupComponent } from './product-browse-components/facet-group/facet-group.component';
import { FacetModalComponent } from './product-browse-components/facet-modal/facet-modal.component';
import { FacetsSelectorComponent } from './product-browse-components/facets-selector/facets-selector.component';
import { MarketingBlockComponent } from './product-browse-components/marketing-block/marketing-block.component';
import { MarketingCarouselComponent } from './product-browse-components/marketing-carousel/marketing-carousel.component';
import { ProductListComponent } from './product-browse-components/product-list/product-list.component';
import { ResultCardComponent } from './product-browse-components/result-card/result-card.component';
import { SelectedFacetsContainerComponent } from './product-browse-components/selected-facets-container/selected-facets-container.component';
import { ProductBrandCalloutComponent } from './product-browse-components/product-brand-callout/product-brand-callout.component';

// Product Detail Components
import { CarouselComponent } from './product-details-components/carousel/carousel.component';
import { ImageExpandedModalComponent } from './product-details-components/image-expanded-modal/image-expanded-modal.component';
import { ImageGalleryComponent } from './product-details-components/image-gallery/image-gallery.component';
import { ProductDescriptionComponent } from './product-details-components/product-description/product-description.component';
import { ProductDocumentsComponent } from './product-details-components/product-documents/product-documents.component';
import { ProductLeadComponent } from './product-details-components/product-lead/product-lead.component';
import { ProductSpecsComponent } from './product-details-components/product-specs/product-specs.component';
import { RelatedProductsComponent } from './product-details-components/related-products/related-products.component';
import { VideoGalleryComponent } from './product-details-components/video-gallery/video-gallery.component';

// Generic Right Rail Components
import { CalloutComponent } from './generic-right-rail-components/callout/callout.component';
import { ImageListComponent } from './generic-right-rail-components/image-list/image-list.component';
import { InformationComponent } from './generic-right-rail-components/information/information.component';

// Branding Landing Components
import { ContentCardComponent } from './brand-landing-components/content-card/content-card.component';
import { ContentCardSectionComponent } from './brand-landing-components/content-card-section/content-card-section.component';

// Search Components
import { SearchNullMessageComponent } from './search-page-components/search-null-message/search-null-message.component';
import { ContactUsPageComponent } from './pages/contact-us-page/contact-us-page.component';
import { ContactUsConfigComponent } from './contact-us-components/contact-us-config/contact-us-config.component';
import { ContactUsFormComponent } from './contact-us-components/contact-us-form/contact-us-form.component';

// Where to Buy components
import { FinderComponent } from './where-to-buy-components/finder/finder.component';
import { FinderResultsComponent } from './where-to-buy-components/finder-results/finder-results.component';
import { MapSectionComponent } from './where-to-buy-components/map-section/map-section.component';

// Interceptors
import { CachingInterceptor } from './interceptors/caching-interceptor.service';
import { RequestInterceptor } from './interceptors/request-interceptor';
import { AgmCoreModule } from '@agm/core';
import { WINDOW_PROVIDERS } from './services/window-service.service';


// EntryComponents are components that map to existing BR components
const EntryComponents = [
    ApplicationCardSectionComponent,
    BrandBannerComponent,
    BreadcrumbComponent,
    CalloutComponent,
    ConfirmationDialogComponent,
    ContactUsPageComponent,
    ContactUsConfigComponent,
    ContentSectionComponent,
    ContentCardSectionComponent,
    CustomRichTextComponent,
    FacetsSelectorComponent,
    FinderComponent,
    GlobalFooterComponent,
    HomeHeroCarouselComponent,
    HomeMosaicComponent,
    ImageCardSectionGroupComponent,
    ImageLinkColumnComponent,
    ImageLinkRowComponent,
    ImageListComponent,
    InformationComponent,
    InPageNavigationPlaceholderComponent,
    MainNavComponent,
    MarketingBannerComponent,
    MarketingBlockComponent,
    MarketingCarouselComponent,
    OpenQuoteComponent,
    PopularBrandsComponent,
    ProductBrandCalloutComponent,
    ProPlusNavigationComponent,
    RichTextComponent,
    RotatingCarouselComponent,
    SearchNullMessageComponent,
    SeoComponent,
    SingleRowBulletedListComponent,
    StatisticsComponentComponent,
    ThreeColumnBulletedListComponent,
    VideoBlockComponent,
];

// These are Angular components but are only accessible in the angular app
const Components = [
    AppComponent,
    ApplicationCardComponent,
    BasePageComponent,
    BrandLandingPageComponent,
    BrBaseContentComponent,
    CarouselComponent,
    ContactUsFormComponent,
    ContentCardComponent,
    DiagnosticsPageComponent,
    DummyPageComponent,
    FacetContainerComponent,
    FacetGroupComponent,
    FacetModalComponent,
    FinderResultsComponent,
    GenericContentPageComponent,
    HomePageComponent,
    ImageCardComponent,
    ImageCardSectionComponent,
    ImageExpandedModalComponent,
    ImageGalleryComponent,
    IndexPageComponent,
    InPageNavigationComponent,
    LoadingContainerComponent,
    MainNavMegaMenuComponent,
    MapSectionComponent,
    MasterPageComponent,
    NavigableContentContainerComponent,
    NavigableContentContainerComponent,
    PageComponentRerouterComponent,
    ProductBrowsePageComponent,
    ProductCategoryPageComponent,
    ProductCategoryPageComponent,
    ProductDescriptionComponent,
    ProductDetailsPageComponent,
    ProductDocumentsComponent,
    ProductLeadComponent,
    ProductListComponent,
    ProductSpecsComponent,
    ProplusLandingPageComponent,
    RelatedProductsComponent,
    ResultCardComponent,
    SearchPageComponent,
    SelectedFacetsContainerComponent,
    SignUpComponent,
    StormPlusComponent,
    TopHatComponent,
    VideoGalleryComponent,
    WhereToBuyPageComponent,
    ...EntryComponents,
];

@NgModule( {
    bootstrap: [AppComponent],
    declarations: [...Components],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule.withServerTransition( { appId: 'brxm-angular-spa' } ),
        BrowserTransferStateModule,
        BrSdkModule,
        HttpClientModule,
        CommonComponentsModule,
        HammerModule,
        NguCarouselModule,
        ProPlusModule,
        RouterModule,
        SharedModule,
        CommercialModule,
        // ServiceWorkerModule.register('ngsw-worker.js', {
        //     enabled: environment.production,
        //     // Register the ServiceWorker as soon as the app is stable
        //     // or after 30 seconds (whichever comes first).
        //     registrationStrategy: 'registerWhenStable:30000',
        // }),
        AgmCoreModule.forRoot( {
            apiKey: googleMapsApiKey,
        } ),
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: RequestInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CachingInterceptor,
            multi: true,
        },
        {
            provide: CONFIGURATION,
            useValue: {
                endpoint: environment.brxmEndpoint,
                apiBaseUrl: environment.brxmApiBaseUrl,
                spaBaseUrl: environment.brxmSpaBaseUrl,
                origin: environment.brxmApiOrigin,
            },
        },
        WINDOW_PROVIDERS,
        {
            provide: MAPPING,
            useValue: {
                'Basic Hero': BrandBannerComponent,
                'Bulleted List Component': SingleRowBulletedListComponent,
                'By Application Card Section': ApplicationCardSectionComponent,
                'Contact Us Config Component': ContactUsConfigComponent,
                'Content Section Component': ContentSectionComponent,
                'Content Card Section Component': ContentCardSectionComponent,
                'Custom Rich Text Component': CustomRichTextComponent,
                'Facets Selector': FacetsSelectorComponent,
                'Homepage Hero Carousel Component': HomeHeroCarouselComponent,
                'Homepage Marketing Banner Component': MarketingBannerComponent,
                'Homepage Mosaic Component': HomeMosaicComponent,
                'Homepage Statistics Component': StatisticsComponentComponent,
                'Image Link Column Component': ImageLinkColumnComponent,
                'Image Link Row Component': ImageLinkRowComponent,
                'In Page Nav Component': InPageNavigationPlaceholderComponent,
                'Marketing Block': MarketingBlockComponent,
                'Marketing Carousel Component': MarketingCarouselComponent,
                'Popular Brands Component': PopularBrandsComponent,
                'Product Brands Component': ProductBrandCalloutComponent,
                'Product Browse Card Section Group Component':
                    ImageCardSectionGroupComponent,
                'Quote Component': OpenQuoteComponent,
                'Rich Text Component': RichTextComponent,
                'Rotating Carousel Component': RotatingCarouselComponent,
                'SEO Component': SeoComponent,
                'Sidebar Callout Component': CalloutComponent,
                'Sidebar Image List Component': ImageListComponent,
                'Sidebar Information Callout Component': InformationComponent,
                'Three Column Bulleted List Component':
                    ThreeColumnBulletedListComponent,
                'Wistia Video Block Component': VideoBlockComponent,
                'No Results Message Component': SearchNullMessageComponent,
                footer: GlobalFooterComponent,
            },
        },
    ],
    entryComponents: [...EntryComponents],
} )
export class AppModule {
    constructor(
        @Inject( PLATFORM_ID ) platformId: object,
        @Inject( APP_ID ) appId: string
    ) {
        // const platform = isPlatformBrowser(platformId)
        //     ? 'in the browser'
        //     : 'on the server';
        // console.log(`Running ${platform} with appId=${appId}`);
    }
}
