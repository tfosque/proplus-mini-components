import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { TranslationsPipe } from '../../pipes/translations.pipe';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';
import { Title } from '@angular/platform-browser';

/**
 * This should be included on every page.  Sets the appropriate content based on parameters set in the CMS for SEO meta tags.
 */
@Component({
    selector: 'app-seo',
    templateUrl: './seo.component.html',
    styleUrls: ['./seo.component.scss'],
    providers: [TranslationsPipe],
})
export class SeoComponent extends BrBaseContentComponent implements OnInit {
    seoInfo?: {
        description: string;
        keywords: string;
        title: string;
    };

    constructor(
        protected titleService: Title,
        protected seoService: SeoService,
        private translationsPipe: TranslationsPipe
    ) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();

        let pageTitle = this.page?.getTitle() || 'No Title';

        if (this.configuration) {
            this.seoInfo = this.configuration['seo-information'];

            if (this.seoInfo) {
                if (this.seoInfo.description) {
                    this.seoService.createMetaDescription(
                        this.seoInfo.description
                    );
                } else {
                    this.seoService.createMetaDescription(
                        this.translationsPipe.transform(
                            'Default beacon description',
                            'default-meta-desc'
                        )
                    );
                }

                if (this.seoInfo.keywords) {
                    this.seoService.createMetaKeywords(this.seoInfo.keywords);
                }
            } else {
                this.seoService.createMetaDescription(
                    this.translationsPipe.transform(
                        'Default beacon description',
                        'default-meta-desc'
                    )
                );
            }
        }

        this.titleService.setTitle(pageTitle);
    }
}
