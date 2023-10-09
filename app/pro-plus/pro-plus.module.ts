import { NgModule } from '@angular/core';
import { ScrollingModule, ScrollDispatcher } from '@angular/cdk/scrolling';
import { PermissionDialogComponent } from './pages/permission-template-detail/permission-dialog/permission-dialog.component';
import { CreateTemplateDialogComponent } from './pages/templates/template-dialog/create-template-dialog/create-template-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { BeaconDialogComponent } from './pages/beacon-dialog/beacon-dialog.component';
// import { DialogContentComponent } from './pages/beacon-dialog/dialog-content/dialog-content.component';
import { NgxPrintModule } from 'ngx-print';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { DropdownOnHoverComponent } from './pages/dropdown-cart/dropdown-on-hover/dropdown-on-hover.component';
import { FilterListPipe } from './pipes/filter-list.pipe';
import { ApproveDialogueComponent } from './pages/order-review/approve-dialogue/approve-dialogue.component';
import { SharedModule } from '../shared.module';
import { CommonComponentsModule } from '../common-components/common-components.module';
// import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
// TODO (Luis Sardon): To review with Tim unused imports

// Page Components
import { AccountsComponent } from './pages/accounts/accounts.component';
import { AddressBookComponent } from './pages/address-book/address-book.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { DeliveryTrackingSettingsComponent } from './pages/delivery-tracking-settings/delivery-tracking-settings.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginModalComponent } from './pages/login-modal/login-modal.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { OrderHistoryPageComponent } from './pages/order-history-page/order-history-page.component';
import { OrderReviewComponent } from './pages/order-review/order-review.component';
import { PendingOrderDetailsComponent } from './pages/pending-orders/pending-order-details/pending-order-details.component';
import { PendingOrderSummaryComponent } from './pages/pending-orders/pending-order-summary/pending-order-summary.component';
import { PerfectOrderComponent } from './pages/perfect-order/perfect-order.component';
import { PerfectOrderDetailComponent } from './pages/perfect-order-detail/perfect-order-detail.component';
import { PerfectOrderLandingComponent } from './pages/perfect-order-landing/perfect-order-landing.component';
import { PermissionTemplateComponent } from './pages/permission-template/permission-template.component';
import { PermissionTemplateDetailComponent } from './pages/permission-template-detail/permission-template-detail.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { ProplusMasterPageComponent } from './pages/proplus-master-page/proplus-master-page.component';
import { QuoteComponent } from './pages/quote/quote.component';
import { QuoteDetailComponent } from './pages/quote-detail/quote-detail.component';
import { QuoteOrderComponent } from './pages/quote-order/quote-order.component';
import { QuoteSummaryComponent } from './pages/quote-summary/quote-summary.component';
import { QuoteUploadComponent } from './pages/quote-upload/quote-upload.component';
import { SavedOrderDetailsComponent } from './pages/saved-order-details/saved-order-details.component';
import { SavedOrderShippingFormComponent } from './pages/saved-order-shipping-form/saved-order-shipping-form.component';
import { SavedOrderSummaryComponent } from './pages/saved-orders/saved-order-summary.component';
import { ShippingFormComponent } from './pages/checkout/shipping-form/shipping-form.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { StormsComponent } from './pages/storms/storms.component';
import { TemplateBrowsePageComponent } from './pages/templates/template-browse-page/template-browse-page.component';
import { TemplateDetailPageComponent } from './pages/templates/template-detail-page/template-detail-page.component';
import { ThankYouPageComponent } from './pages/thank-you-page/thank-you-page.component';
import { UserAdminComponent } from './pages/user-admin/user-admin.component';
import { UserAdminDetailComponent } from './pages/user-admin-detail/user-admin-detail.component';

// User Admin Components
import { UserAdminPermNameDialogueComponent } from './pages/user-admin-detail/user-admin-perm-name-dialogue/user-admin-perm-name-dialogue.component';

// Eagle View Components
import { EagleViewOrderComponent } from './pages/eagle-view/eagle-view-order/eagle-view-order.component';
import { EagleViewThankYouComponent } from './pages/eagle-view/eagle-view-thank-you/eagle-view-thank-you.component';
import { UpgradeEagleViewReportComponent } from './pages/eagle-view/upgrade-eagle-view-report/upgrade-eagle-view-report.component';

// Hover Components
import { JobListComponent } from './pages/hover/job-list/job-list.component';
import { JobDetailComponent } from './pages/hover/job-detail/job-detail.component';
import { ThreeDplusComponent } from './pages/hover/three-dplus/three-dplus.component';

// Shopping Cart Components
import { CustomersAlsoBoughtComponent } from './pages/shopping-cart/customers-also-bought/customers-also-bought.component';
import { DeleteDialogComponent } from './pages/shopping-cart/delete-dialog/delete-dialog.component';
import { DeleteItemDialogComponent } from './pages/shopping-cart/delete-item-dialog/delete-item-dialog.component';
import { SaveOrderDialogComponent } from './pages/shopping-cart/save-order-dialog/save-order-dialog.component';

// Login Components
import { PersistentLoginComponent } from './pages/login-page/persistent-login/persistent-login.component';

// Form Dialog Components
import { DeleteAddressDialogComponent } from './pages/address-book/delete-address-dialog/delete-address-dialog.component';
import { FormDialogComponent } from './pages/address-book/form-dialog/form-dialog.component';

// Order Detail Components
import { AlertDialogComponent } from './pages/order-detail/alert-dialog/alert-dialog.component';
import { DetailDialogComponent } from './pages/order-detail/detail-dialog/detail-dialog.component';
import { PhotoDialogComponent } from './pages/order-detail/photo-dialog/photo-dialog.component';

// Perfect Order Detail Components
import { PoDialogComponent } from './pages/perfect-order-detail/po-dialog/po-dialog.component';

// Quote Detail Components
import { AddItemDialogComponent } from './pages/quote-detail/add-item-dialog/add-item-dialog.component';
import { CustomItemDialogComponent } from './pages/quote-detail/custom-item-dialog/custom-item-dialog.component';

// Quote Summar Components
import { DeleteDraftQuoteComponent } from './pages/quote-summary/quote-table/delete-draft-quote/delete-draft-quote.component';
import { QuoteTableComponent } from './pages/quote-summary/quote-table/quote-table.component';

// Rebate Components
import { RebateFormComponent } from './pages/rebate/rebate-form/rebate-form.component';
import { RebateLandingComponent } from './pages/rebate/rebate-landing/rebate-landing.component';
import { RebateRedeemedDetailComponent } from './pages/rebate/rebateRedeemed/rebate-redeemed-detail/rebate-redeemed-detail.component';
import { RebateRedeemedSummaryComponent } from './pages/rebate/rebateRedeemed/rebate-redeemed-summary/rebate-redeemed-summary.component';

// Shared Components
// import { ProductAdderComponent } from './shared-components/product-adder/product-adder.component';
import { ProductAllComponent } from './shared-components/product-all/product-all.component';
import { SkuSelectorComponent } from './shared-components/sku-selector/sku-selector.component';
// import { ProductSelectorAllComponent } from './shared-components/product-selector-all/product-selector-all.component';
import { ProductLinesComponent } from './shared-components/product-lines/product-lines.component';
import { ConfirmAvailableProductsComponent } from './shared-components/confirm-available-products/confirm-available-products.component';
import { SearchSelectorComponent } from './shared-components/search-selector/search-selector.component';
// import { PendingOrdersBarComponent } from './shared-components/pending-orders-bar/pending-orders-bar.component';
import { FromControlMessagesComponent } from './shared-components/form-control-messages/form-control-messsages.component';
import { ProductSelectorComponent } from './shared-components/product-selector/product-selector.component';
import { ProductListComponent } from './shared-components/product-list/product-list.component';
import { CustomStepperComponent } from './shared-components/custom-stepper/custom-stepper.component';
import { StepIconsComponent } from './shared-components/onboarding/step-icons/step-icons.component';
import { LabelIconsComponent } from './shared-components/onboarding/label-icons/label-icons.component';
import { StepTitleDescComponent } from './shared-components/onboarding/step-title-desc/step-title-desc.component';
import { OnboardingComponent } from './shared-components/onboarding/onboarding.component';
import { ActiveMenuItemComponent } from './shared-components/onboarding/active-menu-item/active-menu-item.component';
import { TemplateTourComponent } from './shared-components/template-tour/template-tour.component';
import { TemplateLabelIconsComponent } from './shared-components/template-tour/template-label-icons/template-label-icons.component';
import { TemplateStepTitleDescComponent } from './shared-components/template-tour/template-step-title-desc/template-step-title-desc.component';
import { TemplateStepIconsComponent } from './shared-components/template-tour/template-step-icons/template-step-icons.component';
import { TemplateActiveMenuItemComponent } from './shared-components/template-tour/template-active-menu-item/template-active-menu-item.component';
import { EagleViewLandingComponent } from './pages/eagle-view/eagle-view-landing/eagle-view-landing.component';
import { ProcessAccountComponent } from './pages/eagle-view/process-account/process-account.component';
import { EagleViewReportListComponent } from './pages/eagle-view/eagle-view-landing/eagle-view-report-list/eagle-view-report-list.component';
import { TemplateSelectionComponent } from './pages/eagle-view/template-selection/template-selection.component';
import { SmartOrderComponent } from './pages/eagle-view/smart-order/smart-order.component';
import { StepIndicatorComponent } from './shared-components/onboarding/step-indicator/step-indicator.component';
import { AgmCoreModule } from '@agm/core';
import { googleMapsApiKey } from '../app.constants';
import { QuoteDisclaimerComponent } from './pages/quote-order/quote-disclaimer/quote-disclaimer.component';
import { EagleViewSmartOrderDialogComponent } from './pages/eagle-view/eagle-view-landing/eagle-view-smart-order-dialog/eagle-view-smart-order-dialog.component';
import { EagleViewCompletedReportListComponent } from './pages/eagle-view/eagle-view-landing/eagle-view-completed-report-list/eagle-view-completed-report-list.component';
import { TemplateDialogComponent } from './pages/eagle-view/smart-order/template-dialog/template-dialog.component';
import { TemplateItemsComponent } from './pages/eagle-view/smart-order/template-dialog/template-items/template-items.component';
import { CommercialModule } from '../commercial/commercial.module';
import { TemplateDetailsPageV2Component } from './pages/templates/template-details-page-v2/template-details-page-v2.component';
import { VariationWidgetComponent } from './pages/templates/template-details-page-v2/variation-widget/variation-widget.component';
import { TemplateDetailsLineItemComponent } from './pages/templates/template-details-page-v2/template-details-line-item/template-details-line-item.component';
import { VariationControlComponent } from './pages/templates/template-details-page-v2/variation-control/variation-control.component';
import { TrackScrollDirective } from './directives/track-scroll.directive';
import { ImgFavIconComponent } from './shared-components/img-fav-icon/img-fav-icon.component';
import { RebateLandingV2Component } from './pages/rebate/rebate-landing-v2/rebate-landing-v2.component';
import { RebateUpdateDialogComponent } from './pages/rebate/rebate-landing-v2/rebate-update-dialog/rebate-update-dialog.component';
import { VariationTestComponent } from './shared-components/variation-test/variation-test.component';
import { VariationItemComponent } from './shared-components/variation-test/variation-item/variation-item.component';
import { RebateDetailComponent } from './pages/rebate/rebate-detail/rebate-detail.component';
import { RebateDetailTableComponent } from './pages/rebate/rebate-detail/rebate-detail-table/rebate-detail-table.component';
// import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


const Components = [
    AccountsComponent,
    ActiveMenuItemComponent,
    AddItemDialogComponent,
    AddressBookComponent,
    AlertDialogComponent,
    ApproveDialogueComponent,
    ChangePasswordComponent,
    CheckoutComponent,
    ConfirmAvailableProductsComponent,
    CreateTemplateDialogComponent,
    CustomersAlsoBoughtComponent,
    CustomItemDialogComponent,
    CustomStepperComponent,
    DeleteAddressDialogComponent,
    DeleteDialogComponent,
    DeleteDraftQuoteComponent,
    DeleteItemDialogComponent,
    DeliveryTrackingSettingsComponent,
    DetailDialogComponent,
    DropdownOnHoverComponent,
    EagleViewOrderComponent,
    EagleViewThankYouComponent,
    ErrorPageComponent,
    ForgotPasswordComponent,
    FormDialogComponent,
    FromControlMessagesComponent,
    JobDetailComponent,
    JobListComponent,
    LabelIconsComponent,
    LandingComponent,
    LoginModalComponent,
    LoginPageComponent,
    OnboardingComponent,
    OrderDetailComponent,
    OrderHistoryPageComponent,
    OrderReviewComponent,
    PendingOrderDetailsComponent,
    PendingOrderSummaryComponent,
    PerfectOrderComponent,
    PerfectOrderDetailComponent,
    PerfectOrderLandingComponent,
    PermissionDialogComponent,
    PermissionTemplateComponent,
    PermissionTemplateDetailComponent,
    PersistentLoginComponent,
    PhotoDialogComponent,
    PoDialogComponent,
    ProductAllComponent,
    ProductLinesComponent,
    ProductListComponent,
    ProductSelectorComponent,
    ProfilePageComponent,
    ProplusMasterPageComponent,
    QuoteComponent,
    QuoteDetailComponent,
    QuoteOrderComponent,
    QuoteSummaryComponent,
    QuoteTableComponent,
    QuoteUploadComponent,
    RebateFormComponent,
    RebateLandingComponent,
    RebateRedeemedDetailComponent,
    RebateRedeemedSummaryComponent,
    SavedOrderDetailsComponent,
    SavedOrderShippingFormComponent,
    SavedOrderSummaryComponent,
    SaveOrderDialogComponent,
    SearchSelectorComponent,
    ShippingFormComponent,
    ShoppingCartComponent,
    ShoppingCartComponent,
    SkuSelectorComponent,
    StepIconsComponent,
    StepIndicatorComponent,
    StepTitleDescComponent,
    StormsComponent,
    TemplateActiveMenuItemComponent,
    TemplateBrowsePageComponent,
    TemplateDetailPageComponent,
    TemplateLabelIconsComponent,
    TemplateStepIconsComponent,
    TemplateStepTitleDescComponent,
    TemplateTourComponent,
    ThankYouPageComponent,
    ThreeDplusComponent,
    UpgradeEagleViewReportComponent,
    UserAdminComponent,
    UserAdminDetailComponent,
    UserAdminPermNameDialogueComponent,
    EagleViewLandingComponent,
    ProcessAccountComponent,
    EagleViewReportListComponent,
    TemplateSelectionComponent,
    SmartOrderComponent,
    EagleViewSmartOrderDialogComponent,
    EagleViewCompletedReportListComponent,
    TemplateDialogComponent,
    TemplateItemsComponent,
    ImgFavIconComponent
];

@NgModule( {
    declarations: [...Components, FilterListPipe, QuoteDisclaimerComponent, TemplateDetailsPageV2Component, VariationWidgetComponent, TemplateDetailsLineItemComponent, VariationControlComponent, TrackScrollDirective, ImgFavIconComponent, RebateLandingV2Component, RebateUpdateDialogComponent, VariationTestComponent, VariationItemComponent, RebateDetailComponent, RebateDetailTableComponent],
    imports: [
        DragDropModule,
        ScrollingModule,
        SharedModule,
        CommonComponentsModule,
        NgxPrintModule,
        AgmCoreModule.forRoot( {
            apiKey: googleMapsApiKey,
        } ),
        CommercialModule
        // NgxSkeletonLoaderModule.forRoot(),
    ],
    exports: [...Components],
    providers: [ScrollDispatcher, FilterListPipe],
} )
export class ProPlusModule { }
