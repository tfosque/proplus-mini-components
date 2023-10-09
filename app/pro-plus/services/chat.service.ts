import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    // public win = window as any;
    constructor() { }

    public displayChat(show: boolean) {
        const win = window as any;
        const ol = win.olark;

        if (typeof window !== 'undefined' && win && win.olark) {
            if (show) {
                ol('api.box.show');
                return;
            }
            ol('api.box.hide');
        }
    }

    /* Automatically update Olark email for proplus account holders */
    updateOlarkEmail(email: string) {
        const win = window as any;
        const ol = win.olark;

        if (win && ol && email) {
            if (email) {
                // Updates the olark visitors email
                ol('api.visitor.updateEmailAddress', {
                    emailAddress: email
                });
            }
        }
    }
}
