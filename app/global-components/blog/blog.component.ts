import { ArchivesService } from './../../services/blog/archives.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { BlogEntry, SkywordService } from '../../services/blog/skyword.service';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

@Component({
    selector: 'app-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
    articles$ = new BehaviorSubject<BlogEntry[] | undefined>([]);
    currSelArchive = new BehaviorSubject<string>('');
    months$: Observable<{ text: string; value: string }[]>;
    selectedArticles$: Observable<BlogEntry[]>;
    constructor(
        private readonly skywordService: SkywordService,
        private readonly archivesService: ArchivesService
    ) {
        //  Get the months from all the articles
        this.months$ = this.articles$.pipe(
            map((articles) => {
                const set = new Set(
                    (articles || [])
                        .map((a) => new Date(a.publishedDate))
                        .map((d) => new Date(d.getFullYear(), d.getMonth(), 1))
                        .map((d) => d.toString())
                );
                const months = Array.from(set)
                    .map((d) => new Date(d))
                    .sort((a, b) => b.getTime() - a.getTime());

                return months.map((d) => {
                    const value = `${d.getFullYear()}-${(d.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}`;
                    const text = `${
                        monthNames[d.getMonth()]
                    } ${d.getFullYear()}`;
                    return { value, text };
                });
            })
        );

        //  Selected articles update when the selected month changes
        this.selectedArticles$ = combineLatest([
            this.articles$,
            this.currSelArchive,
        ]).pipe(
            map(([articles, date]) => {
                if (!!date) {
                    return (articles || []).filter((a) =>
                        a.publishedDate.startsWith(date)
                    );
                }
                return (articles || []).sort(
                    (a, b) =>
                        getTimeStamp(b.publishedDate) -
                        getTimeStamp(a.publishedDate)
                );
            })
        );
    }

    async ngOnInit() {
        /* Subscribe */
        this.skywordService.skywordData$.subscribe((articles) => {
            this.articles$.next(articles);
            // console.log('this:articles$', this.articles$);
        });
        /* Subscribe */
        this.archivesService.currSelArchive$.subscribe((res) => {
            // console.log({ res });
            this.currSelArchive.next(res);
        });

        await this.skywordService.retrieveBlog();
    }

    setSelArchive(selection: string) {
        this.archivesService.setSelArchive(selection);
        return false;
    }
}

function getTimeStamp(dateString: string) {
    const d = new Date(dateString);
    return d.getTime();
}
