export interface Download3DAppResponse {
    result: any;
    success: boolean;
    messages: Message[];
}

export interface Message {
    code: string | null;
    type: string;
    value: string;
}
