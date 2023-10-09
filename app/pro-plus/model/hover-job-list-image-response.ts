import { Message } from './shopping-cart-response';

export interface HoverJobListImageResponse {
    result: string;
    success: boolean;
    messages?: Message;
}
