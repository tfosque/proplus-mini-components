import { Component, OnInit, Input } from '@angular/core';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';
import {
    CMSContentCardData,
    CMSContentCardSection,
    ContentCardData,
} from './content-card-section.types';
import { Image } from '../../global-classes/image';

@Component({
    selector: 'app-content-card-section',
    templateUrl: './content-card-section.component.html',
    styleUrls: ['./content-card-section.component.scss'],
})
export class ContentCardSectionComponent
    extends BrBaseContentComponent
    implements OnInit
{
    @Input() contentCardArrayFromServer: any[] = [];

    contentCardSections: {
        contentCardList: ContentCardData[];
    }[] = [];

    ngOnInit() {
        super.ngOnInit();

        if (
            !this.content &&
            this.contentCardArrayFromServer &&
            this.contentCardArrayFromServer.length
        ) {
            this.contentCardSections = this.buildContentCardsArray(
                this.contentCardArrayFromServer
            );
        } else if (this.content) {
            this.contentCardSections = this.buildContentCardsArray([
                this.content,
            ]);
        }
    }

    /**
     * Takes in an array of content and returns built out array of content card sections.
     * @param contentArray array of content used to build out array of content card sections.
     */
    buildContentCardsArray(contentArray: any[]): {
        contentCardList: ContentCardData[];
    }[] {
        // Iterate through all sections and return an array of contentCard sections.
        return contentArray.map((curSection: CMSContentCardSection) => {
            const cardList = curSection.contentCards.map(
                (curCard: CMSContentCardData) => {
                    const curCardContent = curCard;
                    const { isExternal, url } =
                        this.getUrlFromCard(curCardContent);

                    const newContentCard: ContentCardData = {
                        image: curCardContent.image
                            ? new Image(
                                  this.getImageUrl(curCardContent.image),
                                  curCardContent.title,
                                  false
                              )
                            : null,
                        heading: curCardContent.title,
                        category: curCardContent.category,
                        description: curCardContent.description,
                        isExternal,
                        url,
                    };
                    return newContentCard;
                }
            );

            const newSection: {
                contentCardList: ContentCardData[];
            } = {
                // Iterate through all contentcards in this section and return an array of contentCards.
                contentCardList: cardList,
            };

            return newSection;
        });
    }
    // tslint:disable-next-line: no-any
    private getUrlFromCard(curCardContent: CMSContentCardData) {
        if (
            curCardContent.link &&
            !curCardContent.url &&
            !curCardContent.primaryDocument
        ) {
            return { isExternal: true, url: curCardContent.link };
        }
        const url = this.getPrimaryDocumentPageLink(
            curCardContent.url || curCardContent.link || '',
            curCardContent.primaryDocument
        );
        return {
            isExternal: curCardContent.isExternal,
            url,
        };
    }
}
