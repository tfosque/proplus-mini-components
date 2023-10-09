import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigableContainerTypes } from '../../enums/navigable-container-types.enum';
import { InPageNavItem } from '../../global-classes/in-page-nav-item';
import { Image } from '../../global-classes/image';
// import { Title } from '@angular/platform-browser';
// import { SeoService } from '../../services/seo.service';
// import { ActivatedRoute, Router } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page.component';
import { PageTypes } from 'src/app/enums/page-types.enum';
import { Container, ContainerItem, ImageSet } from '@bloomreach/spa-sdk';

@Component({
    selector: 'app-brand-landing-page',
    templateUrl: './brand-landing-page.component.html',
    styleUrls: ['./brand-landing-page.component.scss'],
})
export class BrandLandingPageComponent
    extends BasePageComponent
    implements OnInit, OnDestroy
{
    breadcrumbConfig: any;
    containerType: NavigableContainerTypes =
        NavigableContainerTypes.dynamicContainer;
    navItems: InPageNavItem[] = [];
    brandLogo?: Image;
    contentContainer?: Container = {} as Container;
    /**
     * Generates the array of nav items to send to the in page nav.
     * @param containers array of content containers from hippo.
     */

    get pageType() {
        return PageTypes.brandLanding;
    }

    initPage() {
        super.initPage();

        // Early return, only run the page setup if this is the correct page to display.
        if (!this.isCorrectTemplate && !this.reRouted) return;

        this.contentContainer = this.page?.getComponent();
        this.navItems = [];
        this.generateNavItems();

        const brandImageContainer = this.page?.getComponent(
            'in-page-nav-container'
        );
        if (brandImageContainer) {
            const imageContentRef =
                brandImageContainer.getComponent('in-page-nav');

            const docs = imageContentRef?.getModels();
            const contentRef = this.page?.getContent(
                docs?.document
            ) as unknown as ImageSet;
            if (contentRef) {
                const brandImageSrc = contentRef.getOriginal()?.getUrl();
                this.brandLogo = new Image(
                    brandImageSrc || '',
                    this.pageTitle || 'No title',
                    false
                );
            }
        }
    }

    /**
     * Generates the array of nav items to send to the in page nav.
     * @param containers array of content containers from hippo.
     */
    generateNavItems() {
        const sections = this.getSections('content-sections');
        if (sections && sections.length) {
            sections.forEach((section: any) => {
                const children = section.getChildren();
                children.forEach((child: any) => {
                    const model = child.getModels();
                    const title = model.cparam.title;
                    const items = model?.pageable.items;
                    const itemForId = items[0];
                    const id = this.page?.getContent(itemForId)?.getData()?.id;
                    this.navItems.push(new InPageNavItem(title, `becn-${id}`));
                });
            });
        }
    }

    getSections(name: string) {
        const containers = this.contentContainer?.getChildren() || [];
        return containers
            .filter((curComponent: ContainerItem): any => {
                const componentName = curComponent.getName();
                return componentName === name;
            })
            .flat();
    }
}
