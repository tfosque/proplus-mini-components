import { Component, OnInit, Input } from '@angular/core';
import { ContentSectionTypes } from '../../enums/content-section-types.enum';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

// A mapping of options from hippo to ContentSectionTypes
const hippoContentSectionTypeMap = {
    'Rich Text': ContentSectionTypes.richText,
    'Product Cards': ContentSectionTypes.imageCardSectionGroup,
    'Content Sections': ContentSectionTypes.contentCardSection,
};

type HippContentSectionTypes =
    | 'Rich Text'
    | 'Product Cards'
    | 'Content Sections';

@Component({
    selector: 'app-content-section',
    templateUrl: './content-section.component.html',
    styleUrls: ['./content-section.component.scss'],
})
export class ContentSectionComponent
    extends BrBaseContentComponent
    implements OnInit
{
    // The type of component to be used.  Expect this to be a component class.
    @Input() componentType!: ContentSectionTypes;
    @Input() title!: string;
    @Input() data: any;
    @Input() id!: string;
    // Determines if section is expanded on mobile
    status = false;

    // Expose to template
    ContentSectionTypes = ContentSectionTypes;

    imageCardSections: any[] = [];
    richTextContent = '';
    contentCardsContent: any[] = [];

    isRichText = false;
    isImageCardSectionGroup = false;
    isContentCardSection = false;

    ngOnInit() {
        // If we have a configuration, this is a hippo added component.
        if (this.configuration) {
            const params = this.configuration.cparam;
            this.title = params.title;
            this.id = this.getId() || '';
            this.setComponentType(params);

            const itemsArray: [{ $ref: string }] =
                this.configuration.pageable.items;
            // Set content appropriately based on the given component type.  Retrieve content using the bloomreach sdk.
            if (itemsArray && itemsArray.length > 0)
                if (this.isImageCardSectionGroup) {
                    this.imageCardSections = itemsArray.map((curItem) => {
                        const document = this.getContentViaReference(curItem);
                        const imageCards = this.getImageCards(
                            document?.imageCards
                        );
                        return { ...document, imageCards };
                    });
                } else if (this.isRichText) {
                    this.richTextContent = itemsArray
                        .map((curItem) => {
                            const docContent =
                                this.getContentViaReference(curItem);
                            return docContent?.content.value;
                        })
                        .join('');
                } else if (this.isContentCardSection) {
                    this.contentCardsContent = itemsArray.map((curItem) =>
                        this.getContentViaReference(curItem)
                    );
                }
        }
    }
    getId() {
        const items = this.configuration?.pageable.items;
        const itemForId = items[0];
        return `becn-${this.page?.getContent(itemForId)?.getData()?.id}`;
    }
    setComponentType(params: any) {
        //  TODO: This is a guess.  We didn't actaully prove this to be constrained
        const newLocal = params.componentType as HippContentSectionTypes;
        this.componentType = hippoContentSectionTypeMap[newLocal];
        this.isRichText = this.componentType === ContentSectionTypes.richText;
        this.isImageCardSectionGroup =
            this.componentType === ContentSectionTypes.imageCardSectionGroup;
        this.isContentCardSection =
            this.componentType === ContentSectionTypes.contentCardSection;
    }

    // Toggles whether the current section is expanded or collapsed in mobile view.
    toggleClass() {
        this.status = !this.status;
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
