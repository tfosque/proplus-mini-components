import { Injectable } from '@angular/core';
import { ProPlusApiBase } from './pro-plus-api-base.service';
import { Download3DAppResponse } from '../model/download-3d-app-response';

@Injectable({
    providedIn: 'root',
})
export class SMSService {
    constructor(private readonly api: ProPlusApiBase) {}

    public async downloadBeacon3DplusApp(phoneNumber: string) {
        try {
            const response = await this.api.getV2NoErrThrow<Download3DAppResponse>(
                'downloadBeacon3DplusApp',
                { phoneNumber }
            );
            const { status, body } = response;
            if (status === 200) {
                return body;
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}
