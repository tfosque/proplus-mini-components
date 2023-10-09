import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
// import * as SkywordData from './_skyword.json';
// import { SkywordData } from './_skyword';

@Injectable({
    providedIn: 'root',
})
export class SkywordService {
    private readonly skywordData = new BehaviorSubject<BlogEntry[]>([]);
    public readonly skywordData$ = this.skywordData.asObservable();
    constructor(private readonly http: HttpClient) {}

    async retrieveBlog(): Promise<void> {
        try {
            if (!environment.blogApiPath) {
                this.skywordData.next([]);
            } else {
                const data = await this.http
                    .get<BlogEntry[]>(`${environment.blogApiPath}/all`, {
                        params: {},
                    })
                    .toPromise();

                // console.log('Fetched Blog', data);

                this.skywordData.next(data);
            }
        } catch (error) {
            console.error('Failed to load blog', error);
            this.skywordData.next([]);
            // throw new Error('Failed to retrieve blog');
        }
    }

    async getBlogEntry(id: string) {
        const data = await this.http
            .get<BlogEntry>(`${environment.blogApiPath}/${id}`, {
                params: {},
            })
            .toPromise();
        return data;
    }
}

export type Blog = {
    content: BlogEntry[];
};

export type BlogEntry = {
    action: string;
    id: string;
    author: string;
    publishedDate: string;
    keyword: string;
    KeyTakeaway?: string;
    title?: string;
    body?: string;
    featured_data?: {
        featured?: string;
        featured_url?: string;
        featured_name?: string;
        featured_imagetitle?: string;
        featured_caption?: string;
        featured_imgalt?: string;
        featured_description?: string;
    };
    wordpressTags?: string;
    metainformation?: {
        seoTitle?: string;
        seoDescription?: string;
    };
    trackingTag?: string;
};
