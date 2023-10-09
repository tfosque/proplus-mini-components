import { Injectable } from '@angular/core';
import { ProPlusApiBase } from './pro-plus-api-base.service';
import { DeliveryStatusResponse } from '../model/delivery-tracking-status-response';
import { SettingsRequest } from '../pages/delivery-tracking-settings/delivery-tracking-settings.component';

@Injectable({
    providedIn: 'root',
})
export class DeliveryTrackingService {
    constructor(private readonly api: ProPlusApiBase) {}

    async updateDeliveryTrackingSettings(
        request: SettingsRequest
    ): Promise<DeliveryResponse> {
        const { ok, body } = await this.api.postV2<DeliveryResponse>(
            'updateStatusChange',
            request
        );
        if (!ok || !body) {
            throw new Error('Failed');
        }
        return body;
    }

    async getStatusChange(
        orderNumber?: string
    ): Promise<DeliveryStatusResponse> {
        const { ok, body } = await this.api.getV2<DeliveryStatusResponse>(
            'getStatusChange',
            orderNumber ? { orderNumber: orderNumber } : {}
        );
        if (!ok || !body) {
            throw new Error('Failed to fetch');
        }
        return body;
    }
}
interface DeliveryResponse {
    callBackParam: string;
    code: number;
    message: string;
    messageCode: number;
}
