import { ProPlusApiBase } from './../../pro-plus/services/pro-plus-api-base.service';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormSubmissionService } from '../../services/form-submission.service';
import { convertHippoMenuItem } from '../../misc-utils/utility-methods';
import { MatSnackBar } from '@angular/material/snack-bar';
import { logError } from '../../misc-utils/log';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';
import { DocumentData } from '../../../declarations';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';

// Enums used to find the content for different sections in the hippo nav data.
enum cmsNavTitles {
    contentColumns = 'Content Columns',
    legalInfo = 'Legal Info',
    customerInteractionColumn = 'Customer Interaction Column',
}

interface FooterLink {
    title: string;
    url: string;
    isExternal: boolean;
}

@Component({
    selector: 'app-global-footer',
    templateUrl: './global-footer.component.html',
    styleUrls: ['./global-footer.component.scss'],
})
export class GlobalFooterComponent
    extends BrBaseContentComponent
    implements OnInit
{
    footerDocument?: DocumentData;
    signUpForm = new FormGroup({
        emailAddress: new FormControl('', [
            Validators.required,
            Validators.email,
        ]),
    });
    emailAddress!: string;
    formSuccess = false;
    contentColumns?: {
        heading: string;
        footerLinks: FooterLink[];
    }[];
    menuConfiguration: any;
    signupHeading?: string;
    signupText?: string;
    signupPlaceholder?: string;
    signupButtonText?: string;
    connectHeading?: string;
    logoImage?: string;
    footerLinksArray?: FooterLink[];

    contactUsArray?: FooterLink[];
    beaconWebsitesArray?: FooterLink[];
    aboutArray?: FooterLink[];
    connectArray?: {
        image: string;
        altText: string;
        link: string;
        newTab: boolean;
    }[];

    footerExpanded: Record<string, boolean> = {};
    isBrowser!: boolean;
    local = environment.local;
    
     /**
     * Adding to page within the typescript instead of the index.html file as it was causing a js error when loaded
     * before angular processing finished.
     */
    audioEyeScript = `
    <script type="text/javascript">!function(){var b=function(){window.__AudioEyeSiteHash = "6cfd76d4aba1b1d656258d3e7e7ca087"; var a=document.createElement("script");a.src="https://wsmcdn.audioeye.com/aem.js";a.type="text/javascript";a.setAttribute("async","");document.getElementsByTagName("body")[0].appendChild(a)};"complete"!==document.readyState?window.addEventListener?window.addEventListener("load",b):window.attachEvent&&window.attachEvent("onload",b):b()}();</script>
    `;

    constructor(
        private readonly formSubmissionService: FormSubmissionService,
        private readonly _snackBar: MatSnackBar,
        private readonly proplusApi: ProPlusApiBase,
        @Inject(PLATFORM_ID) platformId: string,
    ) {
        super();
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.proplusApi.userSession.subscribe((user) => {
            this.getMenuConfiguration(user.isLoggedIn);
        });

        this.signupHeading = 'Sign Up for Updates';
        this.signupText =
            'Get the latest news, tips, tools and product updates for all your roofing projects.';
        this.signupPlaceholder = 'Email Address';
        this.signupButtonText = 'Sign Up';

        this.logoImage = '/assets/images/beacon-logo-new.png';
    }

    getMenuConfiguration(loggedIn: boolean) {
        if (!this.configuration) return;

        const { footer } = this.configuration;
        this.footerDocument = this.page?.getContent<DocumentData>(footer);
        const footerContent = this.footerDocument?.model.data;
        const cmsMenuItems = footerContent?.siteMenuItems;

        /**
         * Set all the content for the main navigation by reformatting the content from the cms
         * into the format the components are expecting
         */
        if (cmsMenuItems && cmsMenuItems.length) {
            cmsMenuItems.forEach((cmsMenuSection: any) => {
                switch (cmsMenuSection.name) {
                    case cmsNavTitles.contentColumns:
                        this.contentColumns = cmsMenuSection.childMenuItems.map(
                            (curColumn: any) => {
                                return {
                                    heading: curColumn.name,
                                    footerLinks: convertHippoMenuItem(
                                        curColumn,
                                        loggedIn
                                    ),
                                };
                            }
                        );
                        break;
                    case cmsNavTitles.legalInfo:
                        this.footerLinksArray = convertHippoMenuItem(
                            cmsMenuSection,
                            loggedIn
                        );
                        break;
                    case cmsNavTitles.customerInteractionColumn:
                        // Get the content path of the footer social network configuration. Then map the data to the connect array
                        const socialNetworksCMS =
                            cmsMenuSection.childMenuItems.find(
                                (menuItem: any) =>
                                    menuItem.parameters &&
                                    menuItem.parameters['social-network']
                            );
                        let socialNetworksContentPath = '';
                        let socialNetworksCMSContent: any;
                        if (socialNetworksCMS) {
                            socialNetworksContentPath =
                                socialNetworksCMS.parameters[
                                    'social-network'
                                ].replace('/', '-');
                            const hasSocialInContent =
                                this.configuration &&
                                socialNetworksContentPath in this.configuration;

                            socialNetworksCMSContent =
                                footerContent &&
                                socialNetworksContentPath &&
                                this.configuration &&
                                hasSocialInContent
                                    ? this.configuration[
                                          socialNetworksContentPath
                                      ]
                                    : undefined;
                            this.connectHeading = socialNetworksCMS.name;
                            if (
                                socialNetworksCMSContent &&
                                socialNetworksCMSContent.socialNetworkLinks &&
                                this.connectHeading
                            ) {
                                this.connectArray =
                                    socialNetworksCMSContent &&
                                    socialNetworksCMSContent.socialNetworkLinks.map(
                                        (curLink: any) => {
                                            return {
                                                altText: curLink.name,
                                                link: curLink.url,
                                                newTab: curLink.isNewTab,
                                                image: this.getImageUrl(
                                                    curLink.icon
                                                ),
                                            };
                                        }
                                    );
                            }
                        }
                        break;
                }
            });
        }
        return;
    }

    async onSubmit() {
        try {
            if (this.signUpForm.valid) {
                await this.formSubmissionService.submitSignUp(
                    this.signUpForm.value
                );
                this.formSuccess = true;
                this._snackBar.open('Request Submitted', 'close', {
                    duration: 2000,
                });
            } else {
                logError({
                    event: 'Signup Error',
                    errors: this.signUpForm.errors,
                });
                this._snackBar.open(
                    'There was a problem with the submission',
                    'close',
                    {
                        duration: 5000,
                    }
                );
            }
        } catch (error: any) {
            logError({ event: 'Signup Error', ...error });
            this._snackBar.open(
                'There was a problem with the submission',
                'close',
                {
                    duration: 5000,
                }
            );
        }
    }

    get year() {
        const y = new Date();
        return y.getFullYear();
    }

    isExpanded(name: string) {
        return this.footerExpanded[name];
    }

    toggleExpanded(name: string) {
        this.footerExpanded[name] = !this.isExpanded(name);
    }
}
