import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { HoverJobService } from '../../../services/hover-job.service';
import { HoverJobListItem } from '../../../model/hover-job-list-response';
import { HoverJobListRequest } from '../../../model/hover-job-list-request';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';

@Component({
    selector: 'app-job-list',
    templateUrl: './job-list.component.html',
    styleUrls: ['./job-list.component.scss'],
})
export class JobListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    public dataSource: JobWithImage[] = [];
    jobNameFilter = '';
    sortBy = 'updated_at';
    sortOrder = 'asc';
    jobCount = 0;

    constructor(
        // private readonly router: Router,
        private readonly hoverJobService: HoverJobService,
        private readonly router: Router
    ) {}

    async ngOnInit() {
        const pageNo = this.paginator ? this.paginator.pageIndex : 1;
        const pageSize = this.paginator
            ? this.paginator.pageSize
                ? this.paginator.pageSize
                : 8
            : 8;
        const request: HoverJobListRequest = {
            pageNo: pageNo,
            pageSize: pageSize,
            filter: '',
            orderBy: 'updated_at asc',
        };
        await this.loadJobs(request);
    }

    private async loadJobs(request: HoverJobListRequest) {
        const response = await this.hoverJobService.getHoverJobList(request);
        // console.log('hover job list', response);
        if (response) {
            if (response.result) {
                if (response.result.pagination) {
                    this.jobCount = response.result.pagination.totalCount;
                }
                // this.dataSource = response.result.items || [];
                const jobs = response.result.items || [];
                const resultArray = await Promise.all(
                    jobs.map(
                        async (job): Promise<JobWithImage> => {
                            const jobImage = await this.getJobImage(job.jobId);
                            return {
                                jobItem: job,
                                jobImage: jobImage,
                            };
                        }
                    )
                );
                // this.dataSource = resultArray.concat(resultArray.concat(resultArray.concat(resultArray.concat(resultArray))));
                this.dataSource = resultArray;
            } else {
                if (response.messages) {
                    const message = response.messages[0];
                    if (
                        parseInt(message.code) === 1007 &&
                        message.value.indexOf('no hover token') !== -1
                    ) {
                        this.router.navigate(['/proplus/Beacon3Dplus']);
                    }
                }
                this.dataSource = [];
            }
        } else {
            this.dataSource = [];
        }
    }

    ngAfterViewInit() {
        this.paginator.page
            .pipe(
                tap(() =>
                    this.loadJobs({
                        pageNo: this.paginator.pageIndex + 1,
                        pageSize: this.paginator.pageSize,
                        filter: this.jobNameFilter,
                        orderBy: `${this.sortBy} ${this.sortOrder}`,
                    })
                )
            )
            .subscribe();
    }

    async getJobImage(jobId: string) {
        const imgResponse = await this.hoverJobService.getHoverJobListImage(
            jobId
        );
        if (imgResponse) {
            if (imgResponse.result) {
                const imageResult = imgResponse.result;
                const matchResult = imageResult.match(
                    /^.*\/fetchHoverJobListImage\?jobId=(\d+)&ver=([a-z]+)$/
                );
                if (matchResult) {
                    const jobId = matchResult[1];
                    const ver = matchResult[2];
                    const imageContent = await this.hoverJobService.fetchHoverJobListImage(
                        jobId,
                        ver
                    );
                    return imageContent;
                }
                return imgResponse.result;
            }
        }
        return '';
    }

    async doSearch() {
        this.paginator.pageIndex = 0;
        const pageNo = this.paginator ? this.paginator.pageIndex : 1;
        const pageSize = this.paginator ? this.paginator.pageSize : 8;
        const request: HoverJobListRequest = {
            pageNo: pageNo,
            pageSize: pageSize,
            filter: this.jobNameFilter,
            orderBy: `${this.sortBy} ${this.sortOrder}`,
        };
        await this.loadJobs(request);
    }
}

interface JobWithImage {
    jobItem: HoverJobListItem;
    jobImage: string | ArrayBuffer | null;
}
