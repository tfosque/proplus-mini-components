export interface EagleViewExchangeOktaAuthCodeRequest {
    code: string;
    state: string;
}

export interface EagleViewExchangeOktaAuthCodeResponse {
    result: unknown | null;
    success: boolean;
    messages: Message[] | null;
}

export interface Message {
    code: number | null;
    type: string;
    value: string;
    key: string | null;
}
