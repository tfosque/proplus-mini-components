// TODO(Tim): This Resolver is no longer used. Consider removing.

// import { Injectable } from '@angular/core';
// import {
//     Resolve,
//     RouterStateSnapshot,
//     ActivatedRouteSnapshot,
// } from '@angular/router';
// import {
//     PageModelService,
//     RequestContextService,
//     getNestedObject,
// } from '@bkoury/bloomreach-experience-ng-sdk';
// import { Observable, of, EMPTY } from 'rxjs';
// import { mergeMap, take } from 'rxjs/operators';
// import { PageTypes } from '../enums/page-types.enum';
// import { ProductBrowseDataResolverService } from './product-browse-data-resolver.service';
// import { ProductDataResolverService } from './product-data-resolver.service';
// import { ProductBrowsePageComponent } from '../pages/product-browse-page/product-browse-page.component';
// import { ProductDetailsPageComponent } from '../pages/product-details-page/product-details-page.component';
// import { ProductCategoryPageComponent } from '../pages/product-category-page/product-category-page.component';
// import { BrandLandingPageComponent } from '../pages/brand-landing-page/brand-landing-page.component';
// import { GenericContentPageComponent } from '../pages/generic-content-page/generic-content-page.component';
// import { ContactUsPageComponent } from '../pages/contact-us-page/contact-us-page.component';
// import { SearchPageComponent } from '../pages/search-page/search-page.component';
// import { WhereToBuyPageComponent } from '../pages/where-to-buy-page/where-to-buy-page.component';

// @Injectable({
//     providedIn: 'root',
// })
// export class CmsDataResolverService implements Resolve<any> {
//     isPreview?: boolean;

//     constructor(
//         private readonly pageModelService: PageModelService,
//         private readonly requestContextService: RequestContextService,
//         private readonly productBrowseDataResolver: ProductBrowseDataResolverService,
//         private readonly productDataResolver: ProductDataResolverService
//     ) {}

//     resolve(
//         route: ActivatedRouteSnapshot,
//         state: RouterStateSnapshot
//     ): Observable<any> | Observable<never> {
//         const parts = route.pathFromRoot.map((curRoute) =>
//             curRoute.url.map((segment) => segment.path || '').join('/')
//         );
//         const joinedPath = `${parts.join('/')}`;
//         const localPath = joinedPath.replace(/[/]+/g, '/');
//         // console.log('localPath', localPath);
//         // Rebuild the url so that we can remove queryparams.
//         // console.log('localPath', { joinedPath, localPath });

//         this.requestContextService.parseUrlPath(localPath);

//         // Requesting data from API here instead of bloomreach sdk so that we can delay content resolution until we have the
//         // Beacon product data.
//         return this.pageModelService.fetchPageModel(false).pipe(
//             take(1),
//             mergeMap((pageModel: any) => {
//                 if (pageModel) {
//                     const pageName = getNestedObject(pageModel, [
//                         'page',
//                         'name',
//                     ]);

//                     pageModel.isCorrectTemplate = this.getIsCorrectTemplate(
//                         pageModel,
//                         pageName,
//                         route
//                     );

//                     /**
//                      * If this page is a product browse page, we'll need to return the product browse resolver so that it will
//                      * also initialize the product service.  If it is a product page, we'll need to return the product data resolver so that it
//                      * will fetch and return the product.  These should be compatible as the product browse and product resolvers
//                      * also return the pageModel object.
//                      */
//                     if (
//                         pageModel.isProduct ||
//                         (route.component === ProductDetailsPageComponent &&
//                             !Object.values(PageTypes).some((value) =>
//                                 pageName.includes(value)
//                             ))
//                     ) {
//                         return this.productDataResolver.externalResolve(
//                             route,
//                             state,
//                             pageModel
//                         );
//                     } else if (
//                         pageName.includes(PageTypes.browse) ||
//                         (route.component === ProductBrowsePageComponent &&
//                             !Object.values(PageTypes).some((value) =>
//                                 pageName.includes(value)
//                             ))
//                     ) {
//                         return this.productBrowseDataResolver.externalResolve(
//                             route,
//                             state,
//                             pageModel
//                         );
//                     } else {
//                         this.pageModelService.updatePageModel(pageModel);
//                         return of(pageModel);
//                     }
//                 } else {
//                     return EMPTY;
//                 }
//             })
//         );
//     }

//     /**
//      * If the pageName is not the expected type and is one of the other types, set the isCorrectTemplate flag to false to attempt
//      * to render a different template.  If the pageName does not include any values from the pageType enum, assume we are on the
//      * correct template.
//      * @param pageModel the content object from the CMS
//      * @param pageName the name of the page from the CMS
//      * @param route the current activated route snapshot
//      */
//     getIsCorrectTemplate(
//         pageModel: any,
//         pageName: string,
//         route: ActivatedRouteSnapshot
//     ): boolean {
//         let isCorrectTemplate = false;
//         if (
//             pageModel.isProduct &&
//             route.component === ProductDetailsPageComponent
//         ) {
//             isCorrectTemplate = true;
//         } else if (
//             pageName.includes(PageTypes.category) &&
//             route.component === ProductCategoryPageComponent
//         ) {
//             isCorrectTemplate = true;
//         } else if (
//             pageName.includes(PageTypes.brandLanding) &&
//             route.component === BrandLandingPageComponent
//         ) {
//             isCorrectTemplate = true;
//         } else if (
//             pageName.includes(PageTypes.browse) &&
//             route.component === ProductBrowsePageComponent
//         ) {
//             isCorrectTemplate = true;
//         } else if (
//             (pageName.includes(PageTypes.content) ||
//                 pageName.includes(PageTypes.pageNotFound)) &&
//             (route.component === GenericContentPageComponent ||
//                 route.component === ContactUsPageComponent ||
//                 route.component === SearchPageComponent ||
//                 route.component === WhereToBuyPageComponent)
//         ) {
//             isCorrectTemplate = true;
//         } else if (
//             !Object.values(PageTypes).some((value) => pageName.includes(value))
//         ) {
//             isCorrectTemplate = true;
//         }

//         return isCorrectTemplate;
//     }
// }
