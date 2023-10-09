import { Pipe, PipeTransform, Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Rewrite internal references to be absolute to the hippo site url or if internal link to a separate page to use routerLink.
 */
@Pipe({
    name: 'linkRewriter',
})
export class LinkRewriterPipe implements PipeTransform {
    constructor(private renderer: Renderer2) {}

    transform(value: any): string {
        if (value) {
            let newValue = value;
            if (value.value) {
                newValue = value.value;
            }
            newValue = newValue.replace(
                /src="\//g,
                // TODO (Luis Sardon): to review hippoRootUrl vs hippoSpaRootUrl
                `src="${environment.hippoRootProto}://${environment.hippoRootUrl}/`
            );
            const tempDiv = this.renderer.createElement('div');
            tempDiv.innerHTML = newValue.trim();

            // Rewrite resource links to point to hippoRoot.
            const resourceLinks = tempDiv.querySelectorAll(
                '[data-type="resource"]'
            );
            const resourceLinksArray: HTMLAnchorElement[] =
                Array.from(resourceLinks);
            resourceLinksArray.forEach((curLink) => {
                const href = curLink.getAttribute('href');
                curLink.setAttribute(
                    'href',
                    // TODO (Luis Sardon): to review hippoRootUrl vs hippoSpaRootUrl
                    // Appends environment in front of href from cms, keeping code just in case `${environment.hippoRootProto}://${environment.hippoRootUrl}${href}`
                    `${href}`
                );
            });

            // Rewrite internal links to include routerLink attribute and remove context variable if it exists.
            const internalLinks = tempDiv.querySelectorAll(
                'a[data-type="internal"]'
            );
            const internalLinksArray: HTMLAnchorElement[] =
                Array.from(internalLinks);
            internalLinksArray.forEach((curLink) => {
                let href = curLink.getAttribute('href') as string;
                href = href.replace('/site', '');
                curLink.setAttribute('href', href);
                curLink.setAttribute('routerLink', href);
            });

            // Remove align properties set by CMS as they are not accessiblity friendly.
            const leftAlignedImages =
                tempDiv.querySelectorAll('img[align="left"]');
            const leftAlignedImagesArray: Node[] =
                Array.from(leftAlignedImages);
            leftAlignedImagesArray.forEach((curNode: Node) => {
                const curImage = curNode as HTMLElement;
                const classString = curImage.className;
                curImage.removeAttribute('align');
                curImage.className = classString + ' float-left';
            });

            const rightAlignedImages =
                tempDiv.querySelectorAll('img[align="right"]');
            const rightAlignedImagesArray: Node[] =
                Array.from(rightAlignedImages);
            rightAlignedImagesArray.forEach((curNode: Node) => {
                const curImage = curNode as HTMLElement;
                const classString = curImage.className;
                curImage.removeAttribute('align');
                curImage.className = classString + ' float-right';
            });

            const centerAlignedImages = tempDiv.querySelectorAll(
                'img[align="center"], img[align="middle"], img[align="bottom"]'
            );
            const centerAlignedImagesArray: Node[] =
                Array.from(centerAlignedImages);
            centerAlignedImagesArray.forEach((curNode: Node) => {
                const curImage = curNode as HTMLElement;
                const classString = curImage.className;
                curImage.removeAttribute('align');
                curImage.className = classString + ' full-image';
            });

            newValue = tempDiv.innerHTML;
            return newValue;
        }

        return value;
    }
}
