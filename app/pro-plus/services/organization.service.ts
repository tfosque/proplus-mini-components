import { Injectable } from '@angular/core';
import { ProPlusApiBase } from './pro-plus-api-base.service';
import { OrganizationListResponse } from '../model/organization-list';
import { OrganizationResponse } from '../model/organization-response';
import { OrganizationRequest } from '../model/organization-request';
import { PermissionTemplateResponse } from '../model/permission-template-response';
import { PermissionTemplateDetailResponse } from '../model/permission-template-detail-response';
import { UserAdminDetailResponse } from '../model/user-admin-response';

@Injectable({
    providedIn: 'root',
})
export class OrganizationService {
    constructor(private readonly api: ProPlusApiBase) {}

    async getOrganizations(): Promise<OrganizationListResponse> {
        const { ok, body } = await this.api.getV2<OrganizationListResponse>(
            'organization',
            {}
        );
        if (!ok || !body) {
            throw new Error('No users asigned');
        }
        return body;
    }

    async getUserInfo(
        request: OrganizationRequest
    ): Promise<OrganizationResponse> {
        const { ok, body } = await this.api.postV2<OrganizationResponse>(
            'user',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch organizations');
        }
        return body;
    }

    async getPermissionList(request: any): Promise<PermissionTemplateResponse> {
        const { ok, body } = await this.api.postV2<PermissionTemplateResponse>(
            'permissionTemplateList',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch permission list');
        }
        return body;
    }

    async getPermissionListDetail(
        templateId: string
    ): Promise<PermissionTemplateDetailResponse> {
        const {
            ok,
            body,
        } = await this.api.postV2<PermissionTemplateDetailResponse>(
            'getPermissionTemplateDetail',
            { templateId: templateId }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch permission');
        }
        return body;
    }

    async getUserDetail(userId: string): Promise<UserAdminDetailResponse> {
        const { ok, body } = await this.api.getV2<UserAdminDetailResponse>(
            'getUserDetail',
            { id: userId }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch organizations');
        }
        return body;
    }

    async getUserDetailNoStandarErrCheck(
        userId: string
    ): Promise<UserAdminDetailResponse> {
        const {
            ok,
            body,
        } = await this.api.getV2NoStandardErrCheck<UserAdminDetailResponse>(
            'getUserDetail',
            { id: userId }
        );
        console.log('getUserDetail: ', body);
        if (!ok || !body) {
            throw new Error('Failed to fetch organizations');
        }
        return body;
    }

    async createPermissionTemplate(template: any): Promise<any> {
        console.log({ template });
        const { ok, body } = await this.api.postV2<any>(
            'createPermissionTemplate',
            template
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch organizations');
        }
        return body;
    }

    async updatePermissionTemplate(template: any): Promise<any> {
        const { ok, body } = await this.api.postV2<any>(
            'updatePermissionTemplate',
            template
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch organizations');
        }
        return body;
    }

    async deletePermissionTemplate(templateId: string): Promise<any> {
        const { ok, body } = await this.api.postV2<any>(
            'deletePermissionTemplate',
            { templateId }
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch organizations');
        }
        return body;
    }
}
