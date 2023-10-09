export interface UserRegisterTokenResponse {
    result: UserRegisterToken;
    messages?: Message[];
    success: boolean;
}

export interface Message {
    type: string;
    value: string;
    code: string;
}

export interface UserRegisterToken {
    userRegInfo: UserRegInfo;
    needLogin: boolean;
    needRetry: boolean;
    needContactSupport: boolean;
    needGetUserRegisterToken: boolean;
    registerSuccess: boolean;
}

export interface UserRegInfo {
    userRegisterToken: string;
}
