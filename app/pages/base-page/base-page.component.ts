import {
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
  PLATFORM_ID,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { BrPageComponent } from "@bloomreach/ng-sdk";
import { Page } from "@bloomreach/spa-sdk";
import { Subscription } from "rxjs";
import { PageTypes } from "../../enums/page-types.enum";
import { NavigationStateService } from "../../services/navigation-state.service";
import { SeoService } from "../../services/seo.service";
import { isCorrectTemplate } from "../../misc-utils/utility-methods";
import { isPlatformBrowser } from "@angular/common";
// import { environment } from "../../../environments/environment";

@Component({
  selector: "app-base-page",
  templateUrl: "./base-page.component.html",
  styleUrls: ["./base-page.component.scss"],
})
export class BasePageComponent implements OnInit {
  @Input() reRouted?: boolean;

  page?: Page;
  pageName?: string;
  isCorrectTemplate?: boolean;
  isSearchPage?: boolean;
  isBrowser?: boolean;
  contentUrl?: string;
  breadcrumbConfig: any;
  routerSub?: Subscription;

  get isPreview() {
    return this.page?.isPreview();
  }

  get pageTitle() {
    return this.titleService.getTitle();
  }

  get pageType() {
    return PageTypes.content;
  }

  constructor(
    protected titleService: Title,
    protected seoService: SeoService,
    protected navigationService: NavigationStateService,
    protected route: ActivatedRoute,
    protected router: Router,
    @Inject(PLATFORM_ID) platformId: string,
    @Optional() page?: BrPageComponent
  ) {
    this.page = page?.state.getValue();
    this.isBrowser = isPlatformBrowser(platformId);

    // Update page name and correct template on page update
    const root = this.page?.toJSON().root;
    const rootContent = this.page?.getContent(root) as any;
    this.pageName = rootContent?.name;
    this.isSearchPage = this.page?.getUrl()?.includes("search");

    this.isCorrectTemplate = isCorrectTemplate(this.pageName, this.pageType);
  }

  ngOnInit() {
    // this.initPage();
  }

  ngOnDestroy() {}

  initPage() {
    this.contentUrl = this.getPageUrl();

    const breadcrumbComponent = this.page?.getComponent("breadcrumb");
    this.breadcrumbConfig = breadcrumbComponent?.getModels();
    const seoComponent = this.page?.getComponent(
      "seo-component",
      "seo-component"
    );
    const hasSeoTitle =
      seoComponent &&
      seoComponent?.getModels() &&
      seoComponent?.getModels()["seo-information"] &&
      seoComponent?.getModels()["seo-information"].title;
    const seoTitle = hasSeoTitle
      ? seoComponent?.getModels()["seo-information"].title
      : this.titleService.getTitle();
    const pageTitle = this.page?.getTitle();
    this.titleService.setTitle(pageTitle || seoTitle || "No Title");
    //  this.setCanonicalLink();

    if (this.isBrowser) {
      const hasHash = window.location.hash !== "";
      if (!hasHash) {
        window.scroll({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    }
  }

  getPageUrl() {
    return this.page?.getUrl();
  }

  /**
   * Set the canonical URL for this page based on the siteroot constant and the contentUrl pulled from the CMS.
   * Making a separate method so it can be more easily overridden by inheriting components.
   */
  /*  setCanonicalLink() {
        this.seoService.createLinkForCanonicalURL(
            `${environment.brxmSpaOrigin}${this.contentUrl}`
        );
    } */
}
