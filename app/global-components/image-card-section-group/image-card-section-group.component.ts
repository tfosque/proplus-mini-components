import { Component, OnInit, Input } from '@angular/core';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

@Component({
    selector: 'app-image-card-section-group',
    templateUrl: './image-card-section-group.component.html',
    styleUrls: ['./image-card-section-group.component.scss'],
})
export class ImageCardSectionGroupComponent
    extends BrBaseContentComponent
    implements OnInit
{
    @Input() imageCardSections: any[] = [];

    constructor() {
        super();
    }

    ngOnInit() {
        if (this.configuration && !this.imageCardSections.length) {
            const itemsArray = this.configuration.pageable?.items || [];
            if (itemsArray && itemsArray.length) {
                this.imageCardSections = Array.from(
                    new Set(itemsArray.map((o: any) => o))
                ).map((contentRef: any) => {
                    const content = contentRef
                        ? this.getContentViaReference(contentRef)
                        : { imageCards: [] };
                    const newContent = content;
                    const imageCards = this.getImageCards(
                        newContent?.imageCards
                    );
                    return { ...newContent, imageCards };
                });
            }
        }
    }
    getImageCards(imageCards: any[]) {
        return imageCards.map((card: any) => {
            const newCard = card;
            const displayImage = this.getImageUrl(newCard.displayImage);
            const pageLink = this.getPrimaryDocumentPageLink(
                newCard.pageLink,
                newCard.primaryDocument
            );
            return { ...newCard, pageLink, displayImage };
        });
    }
}
