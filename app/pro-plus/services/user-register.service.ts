import { Injectable } from '@angular/core';
import { ProPlusApiBase } from './pro-plus-api-base.service';
// import { BasicResponse } from './user.service';
import { ApiError } from '../services/api-error';
import { UserRegisterTokenResponse } from '../model/user-register-token-response';
import {
    SignupEmailForm,
    SignupAccountForm,
    ValidateByEmailOrAccountResponse,
    UserRegInfo,
} from '../model/user-register';

@Injectable({
    providedIn: 'root',
})
export class UserRegisterService {
    constructor(private readonly api: ProPlusApiBase) {}

    public async getUserRegisterToken() {
        try {
            const response = await this.api.getV2<UserRegisterTokenResponse>(
                'getUserRegisterToken',
                {}
            );
            const { ok, status, body } = response;
            if (!ok || !body) {
                if (!ok) {
                    throw new ApiError('getUserRegisterToken', response);
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

    public async validateUserByEmail(
        emailForm: SignupEmailForm,
        userRegisterToken: string
    ): Promise<ValidateByEmailOrAccountResponse> {
        const {
            body,
        } = await this.api.postV2WithToken<ValidateByEmailOrAccountResponse>(
            'validateUserByEmail',
            emailForm,
            userRegisterToken
        );
        // if (!ok || !body) { throw new Error('Failed to validate user by email'); }
        return body;
    }

    public async validateUserByAccount(
        accountForm: SignupAccountForm,
        userRegisterToken: string
    ): Promise<ValidateByEmailOrAccountResponse> {
        const {
            body,
        } = await this.api.postV2WithToken<ValidateByEmailOrAccountResponse>(
            'validateUserByAccount',
            accountForm,
            userRegisterToken
        );
        // if (!ok || !body) { throw new Error('Failed to validate user by email'); }
        return body;
    }

    public async register(
        userRegInfo: UserRegInfo,
        userRegisterToken: string
    ): Promise<ValidateByEmailOrAccountResponse> {
        const {
            body,
        } = await this.api.postV2WithToken<ValidateByEmailOrAccountResponse>(
            'register',
            userRegInfo,
            userRegisterToken
        );
        // if (!ok || !body) { throw new Error('Failed to validate user by email'); }
        return body;
    }
}
