import { Component, OnInit } from '@angular/core';
import { HoverJobService } from '../../../services/hover-job.service';
import { HoverJobDetail } from '../../../model/hover-job-detail-response';
import { ParamMap, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-job-detail',
    templateUrl: './job-detail.component.html',
    styleUrls: ['./job-detail.component.scss'],
})
export class JobDetailComponent implements OnInit {
    public jobId = '';
    public jobDetail: HoverJobDetail = { id: '' };
    public jobDetailImages: JobImage[] = [];
    public activeImageIndex = 0;
    constructor(
        private readonly route: ActivatedRoute,
        private readonly hoverJobService: HoverJobService
    ) {}

    async ngOnInit() {
        const p: ParamMap = this.route.snapshot.paramMap;
        this.jobId = p.get('jobId') || '0';
        const response = await this.hoverJobService.getHoverJobDetail(
            this.jobId
        );
        if (response) {
            if (response.result) {
                this.jobDetail = response.result;
                if (this.jobDetail.images) {
                    const images = this.jobDetail.images;
                    this.jobDetailImages = await Promise.all(
                        images.map(
                            async (image): Promise<JobImage> => {
                                const jobImage = await this.getJobImage(
                                    this.jobDetail.id,
                                    image.id
                                );
                                return {
                                    imageId: image.id,
                                    imageUrl: jobImage,
                                };
                            }
                        )
                    );
                }
            }
        }
    }

    async getJobImage(jobId: string, imageId: string) {
        const imgResponse = await this.hoverJobService.getHoverJobDetailImage(
            jobId,
            imageId
        );
        if (imgResponse) {
            if (imgResponse.result) {
                const imageResult = imgResponse.result;
                const matchResult = imageResult.match(/^.*\/fetchHoverJobDetailImage\?imageId=(\d+)&ver=([a-z]+)$/)
                if (matchResult) {
                    const imageId = matchResult[1];
                    const ver = matchResult[2];
                    const imageContent = await this.hoverJobService.fetchHoverJobDetailImage(imageId, ver);
                    return imageContent;
                } 
                return imgResponse.result;
            }
        }
        return '';
    }

    async getMeasurementsPdf() {
        const pdf = this.jobDetail.pdf;
        if (pdf) {
            const matchResult = pdf.match(/^.*\/fetchHoverJobPdf\?jobId=(\d+)$/);
            if (matchResult) {
                const jobId = matchResult[1];
                const pdfContent = await this.hoverJobService.fetchHoverJobPdf(jobId);
                this.openDataUrl(pdfContent);
            }
        }
    }

    openDataUrl(dataUrl: Blob) {
        if (!dataUrl) {
            return;
        }
        const downloadURL = URL.createObjectURL(dataUrl);
        let link: HTMLAnchorElement | null = document.createElement('a');
        link.href = downloadURL;
        link.download = this.jobId + '_measurements' + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.remove();
        URL.revokeObjectURL(downloadURL);
    }

    thumbImageClick(index: number) {
        // console.log('index, ', index);
        this.activeImageIndex = index;
    }

    imageMove(direction: string) {
        // console.log('direction, ', direction);
        if (direction === 'left') {
            if (this.activeImageIndex > 0) {
                this.activeImageIndex--;
            }
        } else {
            if (this.activeImageIndex < this.jobDetailImages.length - 1) {
                this.activeImageIndex++;
            }
        }
    }
}

interface JobImage {
    imageId: string;
    imageUrl: string | ArrayBuffer | null;
}
