import { Injectable } from '@angular/core';
import { UserService } from '../../pro-plus/services/user.service';
import { safeParseUrl } from '../classes/safeParseUrl';

export interface URLInfo {
    href: string;
    origin: string;
    path: string;
    isFullyQualified: boolean;
    parameters: Record<string, string>;
}

@Injectable({
    providedIn: 'root',
})
export class CmsLinksService {
    constructor(private userService: UserService) {}
    getLink(inputUrl: string): URLInfo {
        //  If the URL doesn't start with a scheme (http or https), prepend https://mytestdomain.xyz
        let url = this.replaceUrlParameters(inputUrl);
        return safeParseUrl(url);
    }

    replaceUrlParameters(url: string) {
        const accountNo = this.userService.accountId;
        const newUrl = url.replace("{ACCOUNTNO}", `${accountNo}`);
        // console.log({ url, newUrl });
        return newUrl;
    }
}