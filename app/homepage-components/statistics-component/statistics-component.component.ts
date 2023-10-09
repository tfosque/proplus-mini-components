import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

@Component({
    selector: 'app-statistics-component',
    templateUrl: './statistics-component.component.html',
    styleUrls: ['./statistics-component.component.scss'],
})
export class StatisticsComponentComponent
    extends BrBaseContentComponent
    implements OnInit
{
    heading?: string;
    statsArray?: {
        statData: string;
        statLabel: string;
    }[];
    description: string | null = null;
    link!: string;
    linkText!: string;
    linkIsExternal!: boolean;

    constructor() {
        super();
    }

    ngOnInit() {
        // Hook up CMS content to angular content model
        if (this.content) {
            this.heading = this.content.heading;
            if (this.content.statsArray && this.content.statsArray.length) {
                this.statsArray = this.content.statsArray.map(
                    (curStat: any) => {
                        return {
                            statData: curStat.value,
                            statLabel: curStat.key,
                        };
                    }
                );
            }

            // Only set link attributes if link exists in CMS
            if (this.content.callToActionLink) {
                this.link = this.getPrimaryDocumentPageLink(
                    this.content.callToActionLink.url,
                    this.content.callToActionLink.primaryDocument
                );

                this.linkText = this.content.callToActionLink.text;
                this.linkIsExternal = this.content.callToActionLink.isExternal;
            }

            this.description = this.content.description
                ? this.content.description.value
                : null;
        }
    }
}
