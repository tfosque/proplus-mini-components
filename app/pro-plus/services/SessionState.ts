import { CurrentUser } from '../model/get-current-user-response';
export type SessionState = {
    tag: 'notInitialized' | 'notLoggedIn' | 'loggedIn';
    user?: CurrentUser;
    loggedOut?: boolean;
};
