import { Page, Document, Reference } from '@bloomreach/spa-sdk';
import { DocumentData } from '../../declarations';
import { PageTypes } from '../enums/page-types.enum';

export interface MenuItem {
    title: string;
    url: string;
    isExternal: boolean;
    parameters: Record<string, string>;
}

export interface SiteMenuItem {
    name: string;
    parameters: Record<string, string>;
    childMenuItems: SiteMenuItem[];
    isMarketingBlock?: boolean;
    links: {
        site?: {
            href: string;
            type: string;
        };
    };
}

/**
 * Scrolls to an html element with an optional offset.
 * @param element element to scroll to
 * @param offset optional offset value for scrolling.
 */
export function scrollToElement(
    element: HTMLElement,
    offset: number = 0,
    scrollContainer?: HTMLElement
) {
    const scrollTop = element.offsetTop + offset;

    if (typeof window !== 'undefined' && !scrollContainer) {
        window.scroll({
            top: scrollTop,
            behavior: 'smooth',
        });
    } else if (typeof window !== 'undefined' && scrollContainer) {
        scrollContainer.scroll({
            top: scrollTop,
            behavior: 'smooth',
        });
    }
}

/**
 * Adds a new string to a specified position in an existing string.
 * @param string the string to be modified
 * @param position position to insert into the new string
 * @param stringToAdd the string to be inserted.
 */
export function spliceString(
    string: string,
    position: number,
    stringToAdd: string
) {
    return [
        string.slice(0, position),
        stringToAdd,
        string.slice(position),
    ].join('');
}

export function convertHippoMenuItem(
    cmsMenuSection: SiteMenuItem,
    loggedIn = false
): MenuItem[] {
    return cmsMenuSection.childMenuItems.map((cmsMenuItem) => {
        const cmsMenuLink = cmsMenuItem.links.site;
        let title = cmsMenuItem.name;
        const itemParameters = removeProperties(cmsMenuItem.parameters, [
            'marketing',
            'Show Title (Y/N)?',
        ]);

        // update contact phone
        title = loggedIn
            ? title.replace('(703) 390-0450', '(888) 685-6111')
            : title;

        const teleLink = loggedIn ? '8886856111' : '7033900450';

        const newMenuItem: MenuItem = {
            title: title,
            url: (cmsMenuLink
                ? stripSiteFromLink(cmsMenuLink.href)
                : ''
            ).replace('7033900450', teleLink),
            isExternal: cmsMenuLink ? cmsMenuLink.type === 'external' : false,
            parameters: itemParameters,
        };
        return newMenuItem;
    });
}

export function getDocument<T = Document>(
    page?: Page,
    document?: Reference
): T | undefined {
    return document && page?.getContent<T>(document);
}

export function getContent(document?: Document): DocumentData | undefined {
    return document ? document?.getData<DocumentData>() : undefined;
}

// TODO: Will need to remove the below if we end up using
// the same function in the BrBaseContentComponent
export function getPrimaryDocumentPageLink_v2(
    curUrl: string,
    primaryDocObj: any,
    page?: Page
): string {
    // Check if there is a primaryDocument to build the link with.  If so, priortize this link.
    if (primaryDocObj && primaryDocObj.$ref && page) {
        const primaryDocument = getDocument(page, primaryDocObj);
        if (primaryDocument) {
            try {
                const primaryUrl = primaryDocument?.getUrl();

                if (primaryUrl) {
                    return stripSiteFromLink(primaryUrl);
                }
            } catch (e) {
                if (!primaryDocument?.getUrl) {
                    return (
                        (primaryDocument as any).data?.asset?.links?.site
                            ?.href || curUrl
                    );
                }
            }
        }
    }

    return curUrl;
}

/**
 * If "site" is present in the url, strip from url and return that string.
 * @param navItem the string to be reformatted
 */
export function stripSiteFromLink(navItem: string): string {
    if (navItem) {
        if (
            !navItem.includes('site/_cmsinternal') &&
            navItem.includes('site/')
        ) {
            navItem = navItem.replace('site/', '');
        }
    }

    return navItem;
}

export function removeProperties(
    o: Record<string, string>,
    propertyNames: string[]
) {
    const newObject = { ...o };
    for (const name of propertyNames) {
        delete newObject[name];
    }
    return newObject;
}

export function isCorrectTemplate(pageName?: string, pageType?: PageTypes) {
    if (pageName?.includes(PageTypes.proPlusLanding)) {
        return pageType === PageTypes.proPlusLanding;
    } else if (pageName?.includes(PageTypes.home)) {
        return pageType === PageTypes.home;
    } else if (pageName?.includes(PageTypes.brandLanding)) {
        return pageType === PageTypes.brandLanding;
    } else if (pageName?.includes(PageTypes.browse)) {
        return pageType === PageTypes.browse;
    } else if (pageName?.includes(PageTypes.category)) {
        return pageType === PageTypes.category;
    } else if (
        pageName?.includes(PageTypes.content) ||
        pageName?.includes(PageTypes.pageNotFound)
    ) {
        return pageType === PageTypes.content;
    } else if (pageName?.includes(PageTypes.productDetails)) {
        return pageType === PageTypes.productDetails;
    } else if (pageName?.includes(PageTypes.whereToBuy)) {
        return pageType === PageTypes.whereToBuy;
    }

    return true;
}
