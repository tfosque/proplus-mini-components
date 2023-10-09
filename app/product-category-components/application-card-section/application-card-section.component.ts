import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

@Component({
    selector: 'app-application-card-section',
    templateUrl: './application-card-section.component.html',
    styleUrls: ['./application-card-section.component.scss'],
})
export class ApplicationCardSectionComponent
    extends BrBaseContentComponent
    implements OnInit
{
    appCardSections: any[] = [];

    constructor() {
        super();
    }

    ngOnInit() {
        const itemsArray = this.configuration?.pageable?.items;

        if (itemsArray && itemsArray.length) {
            this.appCardSections = itemsArray.map((curItem: any) => {
                const content = this.getContentViaReference(curItem);
                const imageCards = content?.imageCards.map((curCard: any) => {
                    const { displayImage } = curCard;

                    const imageSrc = displayImage
                        ? this.getImageUrl(displayImage)
                        : null;
                    const pageLink = this.getPrimaryDocumentPageLink(
                        curCard.pageLink,
                        curCard.primaryDocument
                    );
                    return { ...curCard, imageSrc, pageLink };
                });
                return { ...content, imageCards };
            });
        }
    }
}
