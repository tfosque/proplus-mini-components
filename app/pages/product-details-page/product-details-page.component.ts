import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  Optional,
  PLATFORM_ID,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { BrPageComponent } from "@bloomreach/ng-sdk";
import { REQUEST } from "@nguniversal/express-engine/tokens";
import { Request } from "express";
import { NavigableContainerTypes } from "../../enums/navigable-container-types.enum";
import { InPageNavItem } from "../../global-classes/in-page-nav-item";
import { ContentSectionTypes } from "../../enums/content-section-types.enum";
import { ProductImp } from "../../global-classes/product-imp";
import { SeoService } from "../../services/seo.service";
import * as entities from "html-entities";
import { TranslationsPipe } from "../../pipes/translations.pipe";
import { BasePageComponent } from "../base-page/base-page.component";
import { UserService } from "../../pro-plus/services/user.service";
import { filter, switchMap, take } from "rxjs/operators";
import { ProductsService } from "../../pro-plus/services/products.service";
import { BehaviorSubject, Subscription } from "rxjs";
import { CurrentUser } from "../../pro-plus/model/get-current-user-response";
import { NavigationStateService } from "../../services/navigation-state.service";
import { PageTypes } from "../../enums/page-types.enum";

@Component({
  selector: "app-product-details-page",
  templateUrl: "./product-details-page.component.html",
  styleUrls: ["./product-details-page.component.scss"],
  providers: [TranslationsPipe],
})
export class ProductDetailsPageComponent
  extends BasePageComponent
  implements OnInit, OnDestroy
{
  product?: ProductImp;
  prodId?: string;
  itemNumber?: string;

  searchBreadcrumb?: {
    title: string;
    facetId?: string;
  }[];

  currentUser: CurrentUser | null = null;
  currentUser$ = new BehaviorSubject<any>({});

  readonly productDetailString = "productDetail";

  // Array of predefined values for product detail page in page nav.
  navItems?: InPageNavItem[];

  containerType: NavigableContainerTypes =
    NavigableContainerTypes.productContainer;
  sessionSubscriptions: Subscription[] = [];

  get pageType(): PageTypes {
    return PageTypes.productDetails;
  }

  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductsService,
    readonly translationsPipe: TranslationsPipe,
    titleService: Title,
    seoService: SeoService,
    navigationService: NavigationStateService,
    route: ActivatedRoute,
    router: Router,
    @Inject(PLATFORM_ID) platformId: string,
    @Inject(REQUEST) @Optional() protected request?: Request,
    @Optional() page?: BrPageComponent
  ) {
    super(
      titleService,
      seoService,
      navigationService,
      route,
      router,
      platformId,
      page
    );
  }

  initPage() {
    super.initPage();
    this.product = this.route.snapshot.data.product;
    console.log("this.product", this.product);

    this.route.paramMap
      .pipe(
        switchMap((s: any) =>
          this.productService.getItemDetails({
            accountId: "280381",
            productId: s.params.productId,
            itemNumber: "",
          })
        )
      )
      .subscribe((rte: any) => {
        console.log({ rte });
        // console.log("rte:", rte.params.productId);
      });

    // Early return, only run the page setup if this is the correct page to display.
    if (!this.isCorrectTemplate && !this.reRouted) return;

    if (this.product) {
      this.checkProduct();

      const localProductId = `${this.product.productId}`;
      const localItemNumber = `${this.product.itemNumber}`;
      const session = this.userService.session;

      if (!this.isBrowser) return;

      this.sessionSubscriptions.push(
        this.userService.sessionBehavior.subscribe((v) => {
          this.currentUser = v.sessionInfo;
          this.currentUser$.next(v.sessionInfo);
        })
      );

      const isClient = this.isBrowser;

      if (!session.isLoggedIn && isClient) {
        this.sessionSubscriptions.push(
          this.userService.sessionBehavior
            .pipe(
              filter((u) => !!u.isLoggedIn && !!u.accountId),
              // tap(sess => console.log('getProduct - sessionChanged', { sess })),
              take(1),
              switchMap((u) =>
                this.productService.getProduct(
                  localProductId,
                  localItemNumber,
                  true,
                  `${u.accountId}`
                )
              )
              // tap((p) => console.log('product call LOGGED IN', p))
            )
            .subscribe((p) => {
              this.product = p || undefined;
              this.checkProduct();
            })
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.sessionSubscriptions.forEach((s) => s.unsubscribe());
  }

  // Override Get Page Url
  getPageUrl() {
    return `/${this.productDetailString}/${this.prodId}`;
  }

  checkProduct() {
    /**
     * When the query params change, subscribe to the params observable of the active route and
     * then update the product data with a new observable from the product service
     */
    if (this.product) {
      this.titleService.setTitle(entities.decode(this.product.name));
      this.generateNavItems(this.product);
      const windowUrl = (this.isBrowser && window?.location?.pathname) || "";
      const curUrl = windowUrl || this.request?.path;

      if (this.product.longDesc) {
        this.seoService.createMetaDescription(this.product.longDesc);
      } else {
        this.seoService.createMetaDescription(
          this.translationsPipe.transform(
            "Default beacon description",
            "default-product-meta-desc"
          )
        );
      }

      if (curUrl?.includes(this.productDetailString)) {
        let categories = this.product.categories;

        if (categories && categories.length) {
          categories = categories.sort((a, b) =>
            a.categoryId.localeCompare(b.categoryId)
          );
          this.searchBreadcrumb = categories.map((curCat) => {
            return {
              title: curCat.categoryName,
              facetId: curCat.facetId,
            };
          });
        }
      }
    }
  }

  /**
   * Takes in product data and sets the navItems array to the new nav items.
   * @param product data to base the nav off of.
   */
  generateNavItems(product: ProductImp) {
    const newNavItems: InPageNavItem[] = [];

    if (product.longDesc) {
      newNavItems.push(
        new InPageNavItem(
          "Product Description",
          `product-desc-${product.itemNumber}`,
          ContentSectionTypes.productDescription
        )
      );
    }

    if (product.specification && Object.keys(product.specification).length) {
      newNavItems.push(
        new InPageNavItem(
          "Specifications",
          `product-specs-${product.itemNumber}`,
          ContentSectionTypes.productSpecs
        )
      );
    }

    if (product.resource && Object.keys(product.resource).length) {
      newNavItems.push(
        new InPageNavItem(
          "Documents",
          `product-docs-${product.itemNumber}`,
          ContentSectionTypes.productDocuments
        )
      );
    }

    if (product.relatedProducts && product.relatedProducts.length) {
      newNavItems.push(
        new InPageNavItem(
          "Related Products",
          `related-prods-${product.itemNumber}`,
          ContentSectionTypes.relatedProducts
        )
      );
    }

    this.navItems = newNavItems;
  }
}
