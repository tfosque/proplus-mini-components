import { NgModule, Type } from "@angular/core";
import {
  Routes,
  RouterModule,
  Route,
  UrlMatchResult,
  UrlSegment,
} from "@angular/router";

// Core
import { IndexPageComponent } from "./core/index-page/index-page.component";
import { MasterPageComponent } from "./master-page/master-page.component";

// Resolvers
import { ProductDataResolverService } from "./resolvers/product-data-resolver.service";
import { ProductBrowseDataResolverService } from "./resolvers/product-browse-data-resolver.service";

// Page Components
import { BrandLandingPageComponent } from "./pages/brand-landing-page/brand-landing-page.component";
import { GenericContentPageComponent } from "./pages/generic-content-page/generic-content-page.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { ProductBrowsePageComponent } from "./pages/product-browse-page/product-browse-page.component";
import { ProductCategoryPageComponent } from "./pages/product-category-page/product-category-page.component";
import { ProductDetailsPageComponent } from "./pages/product-details-page/product-details-page.component";
// import { ProplusLandingPageComponent } from "./pages/proplus-landing-page/proplus-landing-page.component";
import { WhereToBuyPageComponent } from "./pages/where-to-buy-page/where-to-buy-page.component";
import { SearchPageComponent } from "./pages/search-page/search-page.component";
import { ContactUsPageComponent } from "./pages/contact-us-page/contact-us-page.component";
import { SignUpComponent } from "./pages/sign-up/sign-up.component";
import { DiagnosticsPageComponent } from "./pages/diagnostics-page/diagnostics-page.component";
import { StormPlusComponent } from "./pages/storm-plus/storm-plus.component";

// Proplus Components
import { ErrorPageComponent } from "./pro-plus/pages/error-page/error-page.component";
import { ProPlusGuard } from "./pro-plus/shared-components/pro-plus.guard";
import { EagleViewGuard } from "./pro-plus/shared-components/eagle-view.guard";
import { OrderHistoryGuard } from "./pro-plus/shared-components/order-history.guard";
import { OrderReviewGuard } from "./pro-plus/shared-components/order-review.guard";
import { PendingOrdersGuard } from "./pro-plus/shared-components/pending-orders.guard";
import { ShippingFormGuard } from "./pro-plus/shared-components/shipping-form.guard";
import { SavedOrdersSummaryGuard } from "./pro-plus/shared-components/saved-orders-summary.guard";
import { UserAdminGuard } from "./pro-plus/shared-components/user-admin.guard";
import { LoginPageComponent } from "./pro-plus/pages/login-page/login-page.component";
import { ProfilePageComponent } from "./pro-plus/pages/profile-page/profile-page.component";
import { AccountsComponent } from "./pro-plus/pages/accounts/accounts.component";
import { AddressBookComponent } from "./pro-plus/pages/address-book/address-book.component";
import { ChangePasswordComponent } from "./pro-plus/pages/change-password/change-password.component";
import { CheckoutComponent } from "./pro-plus/pages/checkout/checkout.component";
import { ShippingFormComponent } from "./pro-plus/pages/checkout/shipping-form/shipping-form.component";
import { DeliveryTrackingSettingsComponent } from "./pro-plus/pages/delivery-tracking-settings/delivery-tracking-settings.component";
import { ForgotPasswordComponent } from "./pro-plus/pages/forgot-password/forgot-password.component";
import { LandingComponent } from "./pro-plus/pages/landing/landing.component";
import { OrderDetailComponent } from "./pro-plus/pages/order-detail/order-detail.component";
import { OrderHistoryPageComponent } from "./pro-plus/pages/order-history-page/order-history-page.component";
import { OrderReviewComponent } from "./pro-plus/pages/order-review/order-review.component";
import { PendingOrderDetailsComponent } from "./pro-plus/pages/pending-orders/pending-order-details/pending-order-details.component";
import { PendingOrderSummaryComponent } from "./pro-plus/pages/pending-orders/pending-order-summary/pending-order-summary.component";
import { PerfectOrderDetailComponent } from "./pro-plus/pages/perfect-order-detail/perfect-order-detail.component";
import { PerfectOrderLandingComponent } from "./pro-plus/pages/perfect-order-landing/perfect-order-landing.component";
import { PerfectOrderComponent } from "./pro-plus/pages/perfect-order/perfect-order.component";
import { PermissionTemplateDetailComponent } from "./pro-plus/pages/permission-template-detail/permission-template-detail.component";
import { PermissionTemplateComponent } from "./pro-plus/pages/permission-template/permission-template.component";
import { QuoteDetailComponent } from "./pro-plus/pages/quote-detail/quote-detail.component";
import { QuoteOrderComponent } from "./pro-plus/pages/quote-order/quote-order.component";
import { QuoteSummaryComponent } from "./pro-plus/pages/quote-summary/quote-summary.component";
import { QuoteUploadComponent } from "./pro-plus/pages/quote-upload/quote-upload.component";
import { QuoteComponent } from "./pro-plus/pages/quote/quote.component";
import { RebateFormComponent } from "./pro-plus/pages/rebate/rebate-form/rebate-form.component";
import { RebateLandingComponent } from "./pro-plus/pages/rebate/rebate-landing/rebate-landing.component";
import { RebateRedeemedDetailComponent } from "./pro-plus/pages/rebate/rebateRedeemed/rebate-redeemed-detail/rebate-redeemed-detail.component";
import { RebateRedeemedSummaryComponent } from "./pro-plus/pages/rebate/rebateRedeemed/rebate-redeemed-summary/rebate-redeemed-summary.component";
import { SavedOrderDetailsComponent } from "./pro-plus/pages/saved-order-details/saved-order-details.component";
import { SavedOrderShippingFormComponent } from "./pro-plus/pages/saved-order-shipping-form/saved-order-shipping-form.component";
import { SavedOrderSummaryComponent } from "./pro-plus/pages/saved-orders/saved-order-summary.component";
import { ShoppingCartComponent } from "./pro-plus/pages/shopping-cart/shopping-cart.component";
import { TemplateBrowsePageComponent } from "./pro-plus/pages/templates/template-browse-page/template-browse-page.component";
import { TemplateDetailPageComponent } from "./pro-plus/pages/templates/template-detail-page/template-detail-page.component";
import { TemplateDetailsPageV2Component } from "./pro-plus/pages/templates/template-details-page-v2/template-details-page-v2.component";

import { ThankYouPageComponent } from "./pro-plus/pages/thank-you-page/thank-you-page.component";
import { UserAdminDetailComponent } from "./pro-plus/pages/user-admin-detail/user-admin-detail.component";
import { UserAdminComponent } from "./pro-plus/pages/user-admin/user-admin.component";
import { TemplateTourComponent } from "./pro-plus/shared-components/template-tour/template-tour.component";
import { JobListComponent } from "./pro-plus/pages/hover/job-list/job-list.component";
import { JobDetailComponent } from "./pro-plus/pages/hover/job-detail/job-detail.component";
import { EagleViewOrderComponent } from "./pro-plus/pages/eagle-view/eagle-view-order/eagle-view-order.component";
import { ThreeDplusComponent } from "./pro-plus/pages/hover/three-dplus/three-dplus.component";
import { EagleViewThankYouComponent } from "./pro-plus/pages/eagle-view/eagle-view-thank-you/eagle-view-thank-you.component";
import { UpgradeEagleViewReportComponent } from "./pro-plus/pages/eagle-view/upgrade-eagle-view-report/upgrade-eagle-view-report.component";
import { ProplusMasterPageComponent } from "./pro-plus/pages/proplus-master-page/proplus-master-page.component";
import { ProPlusCMSGuard } from "./pro-plus/shared-components/pro-plus-cms.guard";
import { UnsecuredProPlusGuard } from "./pro-plus/shared-components/unsecure-pro-plus.guard copy";
import { EagleViewLandingComponent } from "./pro-plus/pages/eagle-view/eagle-view-landing/eagle-view-landing.component";
import { ProcessAccountComponent } from "./pro-plus/pages/eagle-view/process-account/process-account.component";
import { TemplateSelectionComponent } from "./pro-plus/pages/eagle-view/template-selection/template-selection.component";
import { SmartOrderComponent } from "./pro-plus/pages/eagle-view/smart-order/smart-order.component";
import { LandingComponent as CommercialLanding } from "./commercial/landing/landing.component";
import { ShippingComponent } from "./commercial/shipping/shipping.component";
import { JobAccountComponent } from "./commercial/job-account/job-account.component";
import { ManufacturerComponent } from "./commercial/manufacturer/manufacturer.component";
import { JobTypeComponent } from "./commercial/job-type/job-type.component";
import { UnderlaymentVaporBarrierComponent } from "./commercial/underlayment-vapor-barrier/underlayment-vapor-barrier.component";
import { SystemTypeComponent } from "./commercial/system-type/system-type.component";
import { IsoComponent } from "./commercial/iso/iso.component";
import { CoverboardComponent } from "./commercial/coverboard/coverboard.component";
import { IsoFastnersComponent } from "./commercial/iso-fastners/iso-fastners.component";
import { MembraneTypeComponent } from "./commercial/membrane-type/membrane-type.component";
import { MembraneApplicationComponent } from "./commercial/membrane-application/membrane-application.component";
import { AccessoriesComponent } from "./commercial/accessories/accessories.component";
import { OrderSummaryComponent } from "./commercial/order-summary/order-summary.component";
import { RebateLandingV2Component } from "./pro-plus/pages/rebate/rebate-landing-v2/rebate-landing-v2.component";
import { VariationTestComponent } from "./pro-plus/shared-components/variation-test/variation-test.component";
import { RebateDetailComponent } from "./pro-plus/pages/rebate/rebate-detail/rebate-detail.component";

const routes: Routes = [
  {
    path: "",
    component: IndexPageComponent,
    children: [
      /** Proplus  */
      {
        path: "proplus",
        component: ProplusMasterPageComponent,
        // canActivate: [ProPlusGuard],
        children: [
          unsecuredProPlusPage("diagnostics", DiagnosticsPageComponent),
          unsecuredProPlusPage("login", LoginPageComponent),
          unsecuredProPlusPage("sign-up", SignUpComponent),
          securedProPlusPage("profile", ProfilePageComponent),
          securedProPlusPage("shopping-cart", ShoppingCartComponent),
          securedProPlusPage("checkout", CheckoutComponent),
          securedProPlusOrderReviewPage("order-review", OrderReviewComponent),
          securedProPlusCommercialPage("commercial-order", CommercialLanding),
          securedProPlusPage("accounts", AccountsComponent),
          unsecuredProPlusPage(
            "profile/change-password",
            ChangePasswordComponent
          ),
          securedProPlusShippingFormPage(
            "shipping-info",
            ShippingFormComponent
          ),
          securedProPlusOrderHistoryPage(
            "accounts/:accountId/orders",
            OrderHistoryPageComponent
          ),
          securedProPlusOrderHistoryPage(
            "accounts/:accountId/orders/:orderId",
            OrderDetailComponent
          ),
          securedProPlusUserAdminPage("user-admin", UserAdminComponent),
          securedProPlusUserAdminPage(
            "user-admin/:userId",
            UserAdminDetailComponent
          ),
          securedProPlusPage(
            "permission-template",
            PermissionTemplateComponent
          ),
          securedProPlusPage(
            "permission-template/:permissionId",
            PermissionTemplateDetailComponent
          ),
          securedProPlusPage(
            "permission-template/new",
            PermissionTemplateDetailComponent
          ),
          securedProPlusPage(
            "accounts/:accountId/quotes/new-quote",
            QuoteComponent
          ),
          securedProPlusPage(
            "accounts/:accountId/quotes/upload-quote",
            QuoteUploadComponent
          ),
          securedProPlusPage(
            "accounts/:accountId/quotes",
            QuoteSummaryComponent
          ),
          securedProPlusPage(
            "accounts/:accountId/quotes/:quoteId",
            QuoteDetailComponent
          ),
          securedProPlusPage(
            "accounts/:accountId/quote-order/:quoteOrderId",
            QuoteOrderComponent
          ),
          securedProPlusPage(
            "accounts/:accountId/quotes/create-quote",
            QuoteDetailComponent
          ),
          securedProPlusPage("perfect-order/:brandName", PerfectOrderComponent),
          securedProPlusPage(
            "perfect-order/:brandName/template-build/:perfectId",
            PerfectOrderDetailComponent
          ),
          securedProPlusPage("perfect-order", PerfectOrderLandingComponent),
          securedProPlusPage("addressBook", AddressBookComponent),
          securedProPlusPage("templates", TemplateBrowsePageComponent),
          securedProPlusPage("template-tour", TemplateTourComponent),
          securedProPlusPage("thank-you", ThankYouPageComponent),
          securedProPlusPage(
            "accounts/:accountId/templates/:templateId",
            TemplateDetailPageComponent
          ),
          securedProPlusPage(
            "accounts/:accountId/templates/demo/:templateId",
            TemplateDetailsPageV2Component
          ),
          securedProPlusPage(
            "accounts/:accountId/templates/demo/:templateId/variation-test",
            VariationTestComponent
          ),
          securedProPlusPage(
            "tracking-settings",
            DeliveryTrackingSettingsComponent
          ),
          securedProPlusCmsPage("home", LandingComponent),
          unsecuredProPlusPage("forgot-password", ForgotPasswordComponent),
          securedProPlusPage("rebate/landing", RebateLandingComponent),
          securedProPlusPage(
            "rebateRedeemed/summary",
            RebateRedeemedSummaryComponent
          ),
          securedProPlusPage(
            "rebateRedeemed/detail/:rebateId",
            RebateRedeemedDetailComponent
          ),
          securedProPlusPage("rebate/form/:rebateId", RebateFormComponent),
          securedProPlusPage("rebate/landing/v2", RebateLandingV2Component),
          securedProPlusPage(
            "rebate/detail/:brandName/:rebateId",
            RebateDetailComponent
          ),
          securedProPlusPendingOrdersPage(
            "pending-orders",
            PendingOrderSummaryComponent
          ),
          securedProPlusPendingOrdersPage(
            "pending-orders/:savedOrderId",
            PendingOrderDetailsComponent
          ),
          securedProPlusSavedOrdersSummaryPage(
            "saved-orders",
            SavedOrderSummaryComponent
          ),
          securedProPlusSavedOrdersSummaryPage(
            "saved-orders/:savedOrderId",
            SavedOrderDetailsComponent
          ),
          securedProPlusShippingFormPage(
            "saved-orders/:savedOrderId/finalize",
            SavedOrderShippingFormComponent
          ),
          securedProPlusPage(
            "saved-orders/:savedOrderId/review",
            OrderReviewComponent
          ),
          securedProPlusPage(
            "saved-orders/:savedOrderId/thank-you",
            ThankYouPageComponent
          ),
          {
            path: "storms",
            component: StormPlusComponent,
            canActivate: [ProPlusCMSGuard],
          },
          securedProPlusPage("hover/jobList", JobListComponent),
          securedProPlusPage("hover/jobDetail/:jobId", JobDetailComponent),
          securedProPlusEagleViewPage(
            "eagle-view/order-report",
            EagleViewOrderComponent
          ),
          securedProPlusPage("Beacon3Dplus", ThreeDplusComponent),
          securedProPlusEagleViewPage(
            "eagle-view/thank-you",
            EagleViewThankYouComponent
          ),
          securedProPlusEagleViewPage(
            "eagle-view/upgrade-report/:reportId/:fromPage",
            UpgradeEagleViewReportComponent
          ),
          securedProPlusEagleViewPage(
            "eagle-view/landing",
            EagleViewLandingComponent
          ),
          securedProPlusEagleViewPage(
            "eagle-view/process-account",
            ProcessAccountComponent
          ),
          securedProPlusEagleViewPage(
            "eagle-view/template-selection/:evOrderId",
            TemplateSelectionComponent
          ),
          securedProPlusEagleViewPage(
            "eagle-view/smart-order/:evOrderId",
            SmartOrderComponent
          ),
          securedProPlusPage(
            "order-for-approval/:submitterOrderId/thank-you",
            ThankYouPageComponent
          ),
          securedProPlusCmsPage("", LoginPageComponent),
          unsecuredProPlusPage("", LoginPageComponent),

          /**
           * Reroute to login if going to /proplus in browser
           */
          {
            path: "**",
            component: LoginPageComponent,
          },
        ],
      },
      /** General  */
      {
        path: "",
        component: MasterPageComponent,
        children: [
          {
            path: "",
            component: HomePageComponent,
          },
          unsecuredProPlusPage("error", ErrorPageComponent),
          {
            path: "sign-up",
            component: SignUpComponent,
          },
          { path: "home", redirectTo: "/", pathMatch: "full" },

          /**
           * Routes for branding landing hierarchy
           */
          {
            path: "brand-landing",
            children: [
              { path: "", redirectTo: "/", pathMatch: "full" },
              {
                // path: ':brandName',
                matcher: matchBrand,
                component: BrandLandingPageComponent,
              },
              {
                // path: ':brandName/:productBrowseId',
                matcher: matchBrandName2,
                component: ProductBrowsePageComponent,
                resolve: {
                  data: ProductBrowseDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
              {
                // path: ':brandName/:productBrowseId/:productId',
                matcher: matchBrandName3,
                component: ProductDetailsPageComponent,
                resolve: {
                  product: ProductDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
              {
                // path: ':brandName/:productBrowseId/:productId/:itemNumber',
                matcher: matchBrandName4,
                component: ProductDetailsPageComponent,
                resolve: {
                  product: ProductDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
            ],
          },

          /**
           * Routes for product hierarchy.
           */
          {
            path: "products",
            children: [
              { path: "", redirectTo: "/", pathMatch: "full" },
              {
                // path: ':productCategoryId
                matcher: matchProductCategory1,
                component: ProductCategoryPageComponent,
              },
              {
                // path: ':productCategoryId/:productBrowseId
                matcher: matchProductCategory2,
                component: ProductBrowsePageComponent,
                resolve: {
                  data: ProductBrowseDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
              {
                // path: ':productCategoryId/:productBrowseId/:productId',
                matcher: matchProductCategory3,
                component: ProductDetailsPageComponent,
                resolve: {
                  product: ProductDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
              {
                // path: ':productCategoryId/:productBrowseId/:productId/:itemNumber',
                matcher: matchProductCategory4,
                component: ProductDetailsPageComponent,
                resolve: {
                  product: ProductDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
            ],
          },

          /**
           * Routes for product detail hierarchy
           */
          {
            path: "productDetail",
            children: [
              { path: "", redirectTo: "/", pathMatch: "full" },
              { path: ":productId", component: ProductDetailsPageComponent },
              /*  {
                // path: ':productId',
                matcher: matchProduct1,
                component: ProductDetailsPageComponent,
                resolve: {
                  product: ProductDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
              {
                // path: ':productId/:itemNumber',
                matcher: matchProduct2,
                component: ProductDetailsPageComponent,
                resolve: {
                  product: ProductDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              }, */
            ],
          },
          //  TODO:  Make a ticket to create pages that can't be deleted by your average editor for all ProPlus page
          //  TODO:  Create seperate ResolverService that informs developer (in development mode) and alerts team in prod mode.

          /** Search */
          {
            path: "search",
            children: [
              {
                path: "",
                component: SearchPageComponent,
                resolve: {
                  data: ProductBrowseDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
              {
                path: ":searchTerm",
                component: SearchPageComponent,
                resolve: {
                  data: ProductBrowseDataResolverService,
                },
                runGuardsAndResolvers: "paramsOrQueryParamsChange",
              },
            ],
          },

          /** Contact Us */
          {
            path: "contact-us",
            component: ContactUsPageComponent,
          },

          /** Find a Store */
          {
            path: "find-a-store",
            component: WhereToBuyPageComponent,
          },

          /**
           * Any other route is assumed to be generic content
           */
          {
            path: "**",
            component: GenericContentPageComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: "enabled" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

/**
 * Creates a UrlMatcher function from a string path
 *
 * @param path A path in the format of an Angular path
 * @param segmentRegex A regex to test against every segment
 */
function safePath(path: string, segmentRegex?: RegExp) {
  //  Parse the path to extract static and parameter segments
  const segmentTests = parseRoutingString(path);
  const notMatched = { consumed: [] };
  //  Use this regex to reject invalid
  const validSegmentPattern = segmentRegex || /^[\w-]+$/;
  return function (segments: UrlSegment[]): UrlMatchResult {
    const matchedParameters: Record<string, UrlSegment> = {};
    //  If the number of input segments don't even match, we know it's not the same
    if (segments.length !== segmentTests.length) {
      return notMatched;
    }

    //  Loop over every segment and test to see if they all match their segment rules
    const allMatched = segmentTests.every((t, i) => {
      const s = segments[i];
      //  Static segments must match the value exactly
      if (t.segmentType === "static") {
        return t.value === s.path;
        //  Parameter segments can be any value, but must match the charset
      } else if (t.segmentType === "parameter") {
        const isValid = validSegmentPattern.test(s.path);
        if (isValid) {
          //  Segments must be mapped to the parameter name
          matchedParameters[t.value] = s;
        }
        return isValid;
      }
      return false;
    });
    if (allMatched) {
      // console.log('Rule Matched', path, matchedParameters);
      return {
        consumed: segments,
        posParams: matchedParameters,
      };
    }

    // console.log('No match', path);
    return notMatched;
  };

  function isParam(s: string) {
    return !!s.match(/^:/);
  }

  function parseRoutingString(route: string) {
    return route.split("/").map((s) => {
      const segmentType: "parameter" | "static" = isParam(s)
        ? "parameter"
        : "static";
      const value = segmentType === "static" ? s : s.substring(1);
      return { segmentType, value };
    });
  }
}

export function matchProductCategory1(segments: UrlSegment[]) {
  return safePath(":productCategoryId")(segments);
}

export function matchProductCategory2(segments: UrlSegment[]) {
  return safePath(":productCategoryId/:productBrowseId")(segments);
}

export function matchProductCategory3(segments: UrlSegment[]) {
  return safePath(":productCategoryId/:productBrowseId/:productId")(segments);
}

export function matchProductCategory4(segments: UrlSegment[]) {
  return safePath(":productCategoryId/:productBrowseId/:productId/:itemNumber")(
    segments
  );
}

export function matchProduct1(segments: UrlSegment[]) {
  return safePath(":productId")(segments);
}

export function matchProduct2(segments: UrlSegment[]) {
  return safePath(":productId/:itemNumber")(segments);
}
export function matchBrand(segments: UrlSegment[]) {
  return safePath(":brandName")(segments);
}

export function matchBrandName2(segments: UrlSegment[]) {
  return safePath(":brandName/:productBrowseId")(segments);
}

export function matchBrandName3(segments: UrlSegment[]) {
  return safePath(":brandName/:productBrowseId/:productId")(segments);
}

export function matchBrandName4(segments: UrlSegment[]) {
  return safePath(":brandName/:productBrowseId/:productId/:itemNumber")(
    segments
  );
}

export function unsecuredProPlusPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [UnsecuredProPlusGuard],
  };
}

export function securedProPlusPage(path: string, component: Type<any>): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard],
  };
}

/* COMMERCIAL */
export function securedProPlusCommercialPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard],
    children: [
      {
        path: "shipping",
        data: { title: "Shipping" },
        component: ShippingComponent,
      },
      { path: "job-account", component: JobAccountComponent },
      { path: "manufacturer", component: ManufacturerComponent },
      { path: "job-type", component: JobTypeComponent },
      { path: "underlayment", component: UnderlaymentVaporBarrierComponent },
      { path: "system-type", component: SystemTypeComponent },
      { path: "iso", component: IsoComponent },
      { path: "coverboard", component: CoverboardComponent },
      { path: "iso-fastners", component: IsoFastnersComponent },
      { path: "membrane-type", component: MembraneTypeComponent },
      { path: "membrane-application", component: MembraneApplicationComponent },
      { path: "accessories", component: AccessoriesComponent },
      { path: "order-summary", component: OrderSummaryComponent },
    ],
  };
}

export function securedProPlusCmsPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path,
    component,
    canActivate: [ProPlusCMSGuard],
  };
}

export function securedProPlusEagleViewPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard, EagleViewGuard],
    // resolve: { pageModel: ProplusDataResolverService },
  };
}

export function securedProPlusOrderHistoryPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard, OrderHistoryGuard],
    // resolve: { pageModel: ProplusDataResolverService },
  };
}

export function securedProPlusOrderReviewPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard, OrderReviewGuard],
    // resolve: { pageModel: ProplusDataResolverService },
  };
}

export function securedProPlusPendingOrdersPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard, PendingOrdersGuard],
    // resolve: { pageModel: ProplusDataResolverService },
  };
}

export function securedProPlusShippingFormPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard, ShippingFormGuard],
    // resolve: { pageModel: ProplusDataResolverService },
  };
}

export function securedProPlusSavedOrdersSummaryPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard, SavedOrdersSummaryGuard],
    // resolve: { pageModel: ProplusDataResolverService },
  };
}

export function securedProPlusUserAdminPage(
  path: string,
  component: Type<any>
): Route {
  return {
    path: path,
    component: component,
    canActivate: [ProPlusGuard, UserAdminGuard],
    // resolve: { pageModel: ProplusDataResolverService },
  };
}
