import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ServiceUrls } from '../enums/service-urls.enum';
import { HttpClient } from '@angular/common/http';
import { Record, String, Static, Union, Literal } from 'runtypes';
import { trace, logError } from '../misc-utils/log';

function isEmail(s: string) {
    // tslint:disable-next-line: max-line-length
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        s
    );
}

const Email = String.withConstraint((s) => isEmail(s));

export const ContactUsForm = Record({
    businessEmailAddress: String,
    cmsContactUsDocument: String,
    company: String,
    emailAddress: Email,
    firstName: String,
    lastName: String,
    phone: String,
    preferredContactMethod: Union(Literal('phone'), Literal('email')),
    questions: String,
    role: String,
    subject: String,
    zip: String,
});

export type ContactUs = Static<typeof ContactUsForm>;

/**
 * Handle general form submissions.
 */
@Injectable({
    providedIn: 'root',
})
export class FormSubmissionService {
    // tslint:disable-next-line:max-line-length
    readonly submissionUrl = `${environment.hippoRootProto}://${
        environment.hippoRootUrl
    }:${environment.hippoRootPort}${
        environment.hippoSitePrefix ? `/${environment.hippoSitePrefix}` : ''
    }${ServiceUrls.hippoRestApi}${ServiceUrls.formSubmissions}`;

    constructor(private readonly http: HttpClient) {}

    public async submitContactUs(formData: ContactUs): Promise<any> {
        const url = `/form-handlers/contact-us`;
        try {
            const result = await this.http.post(url, formData).toPromise();
            trace({ event: 'submitContactUs', formData, result });
            return result;
        } catch (error) {
            logError({ event: 'submitContactUs', error, formData, url });
            throw error;
        }
    }

    public async submitSignUp(formData: {
        emailAddress: string;
    }): Promise<true> {
        const email = formData.emailAddress;
        return await this.submitEmailPardot(email);
    }

    private async submitEmailPardot(email: string): Promise<true> {
        try {
            const result = await this.http
                .post(`/form-handlers/submit-email?email=${email}`, {})
                .toPromise();
            trace({ action: 'submitEmailPardot', result });
            return true;
        } catch (error) {
            logError({
                event: 'FormSubmissionService.submitEmailPardot',
                error,
            });
            throw new Error('Failed to submit email to Pardot');
        }
    }
}
