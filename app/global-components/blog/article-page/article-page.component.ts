import {
    BlogEntry,
    SkywordService,
} from '../../../services/blog/skyword.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

type BlogView = Partial<BlogEntry> & { imageUrl?: string };

@Component({
    selector: 'app-article-page',
    templateUrl: './article-page.component.html',
    styleUrls: ['./article-page.component.scss'],
})
export class ArticlePageComponent implements OnInit {
    articlePage$ = new BehaviorSubject<Partial<BlogView>>({});
    isLoading = true;
    constructor(
        private readonly router: Router,
        private readonly skywordService: SkywordService
    ) {}

    ngOnInit() {
        // to avoid using params lol :)
        const id = this.router.url.split('/');
        const articleId = id[3];
        /* fetch article */
        // tslint:disable-next-line: no-floating-promises
        this.fetchArticle(articleId);
    }

    async fetchArticle(id: string) {
        try {
            const a: BlogView = await this.skywordService.getBlogEntry(id);
            if (a && a.featured_data && a.featured_data.featured_url) {
                a.featured_data.featured_url = fixImageUrl(a);
            }
            a.imageUrl = this.getImage(a);
            this.articlePage$.next(a);
        } catch (error) {
            console.log({ error });
            this.articlePage$.next({});
        } finally {
            this.isLoading = false;
        }
    }

    public getImage(e: BlogView) {
        if (!e.featured_data || !e.featured_data.featured_url) {
            // return [];
            return '';
        }
        // return `${e.featured_data.featured_url}`;
        return [`url(${e.featured_data.featured_url})`].join(', ');
        // return `url('${e.featured_data.featured_url}')`;
    }
}
function fixImageUrl(a: BlogView): string | undefined {
    if (!a || !a.featured_data || !a.featured_data.featured_url) {
        return '';
    }
    const url = a.featured_data.featured_url;
    if (url.startsWith(environment.blogApiPath)) {
        return url;
    }
    return a.featured_data.featured_url.replace(
        'api/beacon-bits',
        environment.blogApiPath
    );
}
