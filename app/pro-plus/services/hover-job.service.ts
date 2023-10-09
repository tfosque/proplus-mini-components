import { Injectable } from '@angular/core';
import { ProPlusApiBase } from './pro-plus-api-base.service';
import { ApiError } from '../services/api-error';
import { HoverJobListResponse } from '../model/hover-job-list-response';
import { HoverJobListRequest } from '../model/hover-job-list-request';
import { HoverJobListImageResponse } from '../model/hover-job-list-image-response';
import { HoverJobDetailResponse } from '../model/hover-job-detail-response';

@Injectable({
    providedIn: 'root',
})
export class HoverJobService {
    constructor(private readonly api: ProPlusApiBase) {}
    public async getHoverJobList(request: HoverJobListRequest) {
        try {
            const response = await this.api.getV23DPlus<HoverJobListResponse>(
                '/getHoverJobList',
                request
            );
            const { ok, status, body } = response;
            if (!ok || !body) {
                if (!ok) {
                    throw new ApiError('hoverJobList', response);
                }
                return null;
            }
            if (status === 200) {
                return body;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    public async getHoverJobListImage(jobId: string) {
        try {
            const response = await this.api.getV2<HoverJobListImageResponse>(
                '/getHoverJobListImage',
                { jobId: jobId }
            );
            const { ok, status, body } = response;
            if (!ok || !body) {
                if (!ok) {
                    throw new ApiError('hoverJobListImage', response);
                }
                return null;
            }
            if (status === 200) {
                return body;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    public async getHoverJobDetail(jobId: string) {
        try {
            const response = await this.api.getV2<HoverJobDetailResponse>(
                '/getHoverJobDetail',
                { jobId: jobId }
            );
            const { ok, status, body } = response;
            if (!ok || !body) {
                if (!ok) {
                    throw new ApiError('hoverJobDetail', response);
                }
                return null;
            }
            if (status === 200) {
                return body;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    public async getHoverJobDetailImage(jobId: string, imageId: string) {
        try {
            const response = await this.api.getV2<HoverJobListImageResponse>(
                '/getHoverJobDetailImage',
                {
                    jobId: jobId,
                    imageId: imageId,
                }
            );
            const { ok, status, body } = response;
            if (!ok || !body) {
                if (!ok) {
                    throw new ApiError('hoverJobDetailImage', response);
                }
                return null;
            }
            if (status === 200) {
                return body;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    public async fetchHoverJobListImage(
        jobId: string,
        ver: string
    ): Promise<string | ArrayBuffer |  null> {
        return await this.api
            .getApiDataUrl('v2', 'fetchHoverJobListImage', {
                jobId: jobId,
                ver: ver
            })
            .toPromise();
    }

    public async fetchHoverJobDetailImage(
        imageId: string,
        ver: string
    ): Promise<string | ArrayBuffer | null> {
        return await this.api
            .getApiDataUrl('v2', 'fetchHoverJobDetailImage', {
                imageId: imageId,
                ver: ver
            })
            .toPromise();
    }

    public async fetchHoverJobPdf(
        jobId: string
    ): Promise<Blob> {
        return await this.api
        .getApiDataUrlBlob('v2', 'fetchHoverJobPdf', {
            jobId: jobId
        })
        .toPromise();
    }
}
