import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Params } from '@angular/router';

/**
 * Service to set/destroy seo related meta and link tags.  Appends to/removes from HTML head.
 */
@Injectable({
    providedIn: 'root',
})
export class SeoService {
    constructor(@Inject(DOCUMENT) private doc: Document) {}

    createLinkForCanonicalURL(canonicalUrl?: string) {
        let link: HTMLLinkElement | null = this.doc.querySelector(
            'link[rel="canonical"]'
        );

        if (!link) {
            link = this.doc.createElement('link');
            link.setAttribute('rel', 'canonical');
            this.doc.head.appendChild(link);
        }

        link.setAttribute('href', canonicalUrl ? canonicalUrl : this.doc.URL);
    }

    createMetaDescription(descriptionText: string) {
        let tag: HTMLMetaElement | null = this.doc.querySelector(
            'meta[name="description"]'
        );

        if (!tag) {
            tag = this.doc.createElement('meta');
            tag.setAttribute('name', 'description');
            this.doc.head.appendChild(tag);
        }

        tag.setAttribute('content', descriptionText);
    }

    createMetaKeywords(keywordsText: string) {
        let tag: HTMLMetaElement | null = this.doc.querySelector(
            'meta[name="keywords"]'
        );

        if (!tag) {
            tag = this.doc.createElement('meta');
            tag.setAttribute('name', 'keywords');
            this.doc.head.appendChild(tag);
        }

        tag.setAttribute('content', keywordsText);
    }

    createPrevLink(pageNo: number, baseUrl: string, queryParams?: Params) {
        let prev: HTMLLinkElement | null = this.doc.querySelector(
            'link[rel="prev"]'
        );

        if (!prev) {
            prev = this.doc.createElement('link');
            prev.setAttribute('rel', 'prev');
            this.doc.head.appendChild(prev);
        }

        prev.setAttribute(
            'href',
            `${baseUrl}?pageNo=${pageNo}` +
                `${
                    queryParams
                        ? Object.keys(queryParams)
                              .filter((curKey) => curKey !== 'pageNo')
                              .map((curKey) => {
                                  return `&${curKey}=${queryParams[curKey]}`;
                              })
                              .join('')
                        : ''
                }`
        );
    }

    createNextLink(pageNo: number, baseUrl: string, queryParams?: Params) {
        let next: HTMLLinkElement | null = this.doc.querySelector(
            'link[rel="next"]'
        );

        if (!next) {
            next = this.doc.createElement('link');
            next.setAttribute('rel', 'next');
            this.doc.head.appendChild(next);
        }

        next.setAttribute(
            'href',
            `${baseUrl}?pageNo=${pageNo}` +
                `${
                    queryParams
                        ? Object.keys(queryParams)
                              .filter((curKey) => curKey !== 'pageNo')
                              .map((curKey) => {
                                  return `&${curKey}=${queryParams[curKey]}`;
                              })
                              .join('')
                        : ''
                }`
        );
    }

    destroyPrevLink() {
        const prev: HTMLLinkElement | null = this.doc.querySelector(
            'link[rel="prev"]'
        );

        if (prev) {
            this.doc.head.removeChild(prev);
        }
    }

    destroyNextLink() {
        const next: HTMLLinkElement | null = this.doc.querySelector(
            'link[rel="next"]'
        );

        if (next) {
            this.doc.head.removeChild(next);
        }
    }

    createMetaRobots() {
        let robots: HTMLMetaElement | null = this.doc.querySelector(
            'meta[name="robots"]'
        );

        if (!robots) {
            robots = this.doc.createElement('meta');
            robots.setAttribute('name', 'robots');
            robots.setAttribute('content', 'noindex,nofollow');
            this.doc.head.appendChild(robots);
        }
    }

    destroyMetaRobots() {
        const robots: HTMLLinkElement | null = this.doc.querySelector(
            'meta[name="robots"]'
        );

        if (robots) {
            this.doc.head.removeChild(robots);
        }
    }
}
