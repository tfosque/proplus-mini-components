import { Message } from './eagle-view-exchange-auth-code';
export interface EagleViewOktaLoginUrlResponse {
    result: {
        oktaLoginLink: string;
    } | null;
    success: boolean;
    messages: Message[] | null
}
